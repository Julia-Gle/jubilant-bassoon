const { DB_TYPE, sequelize } = require('../config/database');

let Todo = null;

// Sequelize Todo Model (für SQL-Datenbanken)
const createSequelizeTodo = () => {
  const { DataTypes } = require('sequelize');
  
  return sequelize.define('Todo', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
      defaultValue: 'TODO',
      allowNull: false,
      validate: {
        isIn: [['TODO', 'IN_PROGRESS', 'DONE']]
      }
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'todos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['dueDate']
      }
    ]
  });
};

// Mongoose Todo Schema (für MongoDB)
const createMongooseTodo = () => {
  const mongoose = require('mongoose');
  
  const todoSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO',
      required: true
    },
    dueDate: {
      type: Date
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true,
    collection: 'todos'
  });

  // Index für bessere Performance
  todoSchema.index({ userId: 1 });
  todoSchema.index({ status: 1 });
  todoSchema.index({ dueDate: 1 });

  // Statische Methoden
  todoSchema.statics.findByUserId = function(userId) {
    return this.find({ userId });
  };

  todoSchema.statics.findByStatus = function(status) {
    return this.find({ status });
  };

  todoSchema.statics.findOverdue = function() {
    return this.find({
      dueDate: { $lt: new Date() },
      status: { $ne: 'DONE' }
    });
  };

  todoSchema.statics.findByUserIdAndStatus = function(userId, status) {
    return this.find({ userId, status });
  };

  // Instance-Methoden
  todoSchema.methods.markAsDone = function() {
    this.status = 'DONE';
    return this.save();
  };

  todoSchema.methods.markInProgress = function() {
    this.status = 'IN_PROGRESS';
    return this.save();
  };

  todoSchema.methods.isOverdue = function() {
    if (!this.dueDate) return false;
    return this.dueDate < new Date() && this.status !== 'DONE';
  };

  return mongoose.model('Todo', todoSchema);
};

// Todo-Model basierend auf Datenbank-Typ initialisieren
const initializeTodoModel = () => {
  if (Todo) return Todo;

  if (DB_TYPE === 'mongodb') {
    Todo = createMongooseTodo();
  } else {
    Todo = createSequelizeTodo();
    
    // Sequelize-spezifische Methoden hinzufügen
    Todo.findByUserId = function(userId) {
      return this.findAll({ where: { userId } });
    };

    Todo.findByStatus = function(status) {
      return this.findAll({ where: { status } });
    };

    Todo.findOverdue = function() {
      return this.findAll({
        where: {
          dueDate: {
            [sequelize.Op.lt]: new Date()
          },
          status: {
            [sequelize.Op.ne]: 'DONE'
          }
        }
      });
    };

    Todo.findByUserIdAndStatus = function(userId, status) {
      return this.findAll({ where: { userId, status } });
    };

    // Instance-Methoden
    Todo.prototype.markAsDone = async function() {
      this.status = 'DONE';
      return await this.save();
    };

    Todo.prototype.markInProgress = async function() {
      this.status = 'IN_PROGRESS';
      return await this.save();
    };

    Todo.prototype.isOverdue = function() {
      if (!this.dueDate) return false;
      return this.dueDate < new Date() && this.status !== 'DONE';
    };
  }

  return Todo;
};

// Todo-Model initialisieren
Todo = initializeTodoModel();

module.exports = Todo;

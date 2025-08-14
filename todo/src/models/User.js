const bcrypt = require('bcryptjs');
const { DB_TYPE, sequelize, mongooseConnection } = require('../config/database');

let User = null;

// Sequelize User Model (für SQL-Datenbanken)
const createSequelizeUser = () => {
  const { DataTypes } = require('sequelize');
  
  const userModel = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    }
  });

  return userModel;
};

// Mongoose User Schema (für MongoDB)
const createMongooseUser = () => {
  const mongoose = require('mongoose');
  
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte geben Sie eine gültige E-Mail-Adresse ein']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255
    }
  }, {
    timestamps: true,
    collection: 'users'
  });

  // Password-Hashing vor dem Speichern
  userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
  });

  // Password-Validierung
  userSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // Password-Update
  userSchema.methods.updatePassword = async function(newPassword) {
    this.password = newPassword;
    return await this.save();
  };

  // Statische Methoden
  userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
  };

  userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
  };

  userSchema.statics.createUser = async function(userData) {
    return await this.create(userData);
  };

  return mongoose.model('User', userSchema);
};

// User-Model basierend auf Datenbank-Typ initialisieren
const initializeUserModel = () => {
  if (User) return User;

  if (DB_TYPE === 'mongodb') {
    User = createMongooseUser();
  } else {
    User = createSequelizeUser();
    
    // Sequelize-spezifische Methoden hinzufügen
    User.prototype.validatePassword = async function(password) {
      return await bcrypt.compare(password, this.password);
    };

    User.prototype.updatePassword = async function(newPassword) {
      this.password = newPassword;
      await this.save();
    };

    User.findByUsername = function(username) {
      return this.findOne({ where: { username } });
    };

    User.findByEmail = function(email) {
      return this.findOne({ where: { email } });
    };

    User.createUser = async function(userData) {
      return await this.create(userData);
    };
  }

  return User;
};

// User-Model initialisieren
User = initializeUserModel();

module.exports = User;

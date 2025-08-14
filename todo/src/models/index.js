const { DB_TYPE, sequelize } = require('../config/database');
const User = require('./User');
const Todo = require('./Todo');

// Beziehungen zwischen Models definieren
const defineAssociations = () => {
  if (DB_TYPE === 'mongodb') {
    // MongoDB-Beziehungen werden über Referenzen gehandhabt
    // Keine expliziten Beziehungen erforderlich
    return;
  }

  // Sequelize-Beziehungen definieren
  if (sequelize) {
    // User hat viele Todos
    User.hasMany(Todo, {
      foreignKey: 'userId',
      as: 'todos',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Todo gehört zu einem User
    Todo.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
};

// Models initialisieren und Beziehungen definieren
const initializeModels = () => {
  // Beziehungen definieren
  defineAssociations();
  
  return {
    User,
    Todo
  };
};

// Models exportieren
module.exports = {
  User,
  Todo,
  initializeModels
};

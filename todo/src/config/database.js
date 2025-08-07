const { Sequelize } = require('sequelize');
require('dotenv').config();

// Datenbank-Konfiguration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'todo_app',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123Juliag',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Datenbank-Verbindung testen
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Datenbank-Verbindung erfolgreich hergestellt.');
  } catch (error) {
    console.error('❌ Fehler bei der Datenbank-Verbindung:', error);
  }
};

module.exports = { sequelize, testConnection };

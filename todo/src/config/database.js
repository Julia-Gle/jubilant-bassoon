const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config();

// Datenbank-Typ aus Umgebungsvariablen
const DB_TYPE = process.env.DB_TYPE || 'memory';

let sequelize = null;
let mongooseConnection = null;

// Datenbank-Konfiguration basierend auf Typ
const getDatabaseConfig = () => {
  switch (DB_TYPE) {
    case 'memory':
    case 'sqlite':
      return {
        dialect: 'sqlite',
        storage: process.env.SQLITE_PATH || ':memory:',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      };
    
    case 'postgresql':
      return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        database: process.env.DB_NAME || 'todo_app',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
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
      };
    
    default:
      throw new Error(`Unbekannter Datenbank-Typ: ${DB_TYPE}`);
  }
};

// Sequelize-Instanz erstellen
const createSequelizeInstance = () => {
  const config = getDatabaseConfig();
  
  if (config.dialect === 'sqlite') {
    sequelize = new Sequelize(config);
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );
  }
  
  return sequelize;
};

// MongoDB-Verbindung erstellen
const createMongoConnection = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_app';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    mongooseConnection = mongoose.connection;
    console.log('✅ MongoDB-Verbindung erfolgreich hergestellt.');
    return mongooseConnection;
  } catch (error) {
    console.error('❌ Fehler bei der MongoDB-Verbindung:', error);
    throw error;
  }
};

// Datenbank-Verbindung initialisieren
const initializeDatabase = async () => {
  try {
    if (DB_TYPE === 'mongodb') {
      await createMongoConnection();
    } else {
      sequelize = createSequelizeInstance();
      await sequelize.authenticate();
      console.log(`✅ ${DB_TYPE.toUpperCase()}-Datenbank-Verbindung erfolgreich hergestellt.`);
    }
  } catch (error) {
    console.error(`❌ Fehler bei der ${DB_TYPE}-Datenbank-Verbindung:`, error);
    throw error;
  }
};

// Datenbank-Verbindung testen
const testConnection = async () => {
  try {
    if (DB_TYPE === 'mongodb') {
      if (!mongooseConnection) {
        await createMongoConnection();
      }
      console.log('✅ MongoDB-Verbindung erfolgreich getestet.');
    } else {
      if (!sequelize) {
        sequelize = createSequelizeInstance();
      }
      await sequelize.authenticate();
      console.log(`✅ ${DB_TYPE.toUpperCase()}-Datenbank-Verbindung erfolgreich getestet.`);
    }
  } catch (error) {
    console.error(`❌ Fehler beim Testen der ${DB_TYPE}-Datenbank-Verbindung:`, error);
    throw error;
  }
};

// Datenbank synchronisieren (nur für SQL-Datenbanken)
const syncDatabase = async () => {
  if (DB_TYPE !== 'mongodb' && sequelize) {
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Datenbank-Schema synchronisiert.');
    } catch (error) {
      console.error('❌ Fehler beim Synchronisieren der Datenbank:', error);
      throw error;
    }
  }
};

// Datenbank-Verbindung schließen
const closeDatabase = async () => {
  try {
    if (DB_TYPE === 'mongodb' && mongooseConnection) {
      await mongooseConnection.close();
      console.log('✅ MongoDB-Verbindung geschlossen.');
    } else if (sequelize) {
      await sequelize.close();
      console.log(`✅ ${DB_TYPE.toUpperCase()}-Datenbank-Verbindung geschlossen.`);
    }
  } catch (error) {
    console.error('❌ Fehler beim Schließen der Datenbank-Verbindung:', error);
  }
};

module.exports = {
  sequelize,
  mongooseConnection,
  DB_TYPE,
  initializeDatabase,
  testConnection,
  syncDatabase,
  closeDatabase,
  getDatabaseConfig
};

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Database und Models importieren
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');

// Routes importieren
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Maximal 100 Requests pro IP
  message: {
    success: false,
    message: 'Zu viele Requests von dieser IP',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
});

// Middleware
app.use(helmet()); // Sicherheits-Header
app.use(cors()); // CORS aktivieren
app.use(limiter); // Rate Limiting
app.use(express.json({ limit: '10mb' })); // JSON Body Parser
app.use(express.urlencoded({ extended: true })); // URL-encoded Parser

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server läuft',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route nicht gefunden',
    errorCode: 'ROUTE_NOT_FOUND'
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Interner Server Fehler',
    errorCode: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Server starten
async function startServer() {
  try {
    // Datenbank-Verbindung testen
    await testConnection();
    
    // Tabellen synchronisieren (nur für Entwicklung!)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false }); // force: false = Tabellen nicht löschen
      console.log('✅ Datenbank-Tabellen synchronisiert');
    }
    
    // Server starten
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`📱 API verfügbar unter: http://localhost:${PORT}`);
      console.log(`🔐 Auth Endpoints:`);
      console.log(`   POST /api/auth/register - Benutzer registrieren`);
      console.log(`   POST /api/auth/login - Benutzer anmelden`);
      console.log(`   GET  /api/auth/profile - Profil abrufen (geschützt)`);
      console.log(`   POST /api/auth/logout - Abmelden (geschützt)`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Server-Start:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM empfangen, Server wird beendet...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT empfangen, Server wird beendet...');
  await sequelize.close();
  process.exit(0);
});

// Server starten
startServer();

module.exports = app;

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { DB_TYPE } = require('../config/database');

// JWT Token verifizieren
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token erforderlich',
        errorCode: 'TOKEN_MISSING'
      });
    }

    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // User aus Datenbank holen (kompatibel mit Sequelize und Mongoose)
    let user;
    if (DB_TYPE === 'mongodb') {
      // MongoDB: findByPk funktioniert nicht, verwende findById
      user = await User.findById(decoded.userId);
    } else {
      // SQL-Datenbanken: findByPk funktioniert
      user = await User.findByPk(decoded.userId);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Token',
        errorCode: 'INVALID_TOKEN'
      });
    }

    // User zu Request hinzufügen
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Token',
        errorCode: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token abgelaufen',
        errorCode: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Token-Verifizierungsfehler:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Fehler bei Token-Verifizierung',
      errorCode: 'SERVER_ERROR'
    });
  }
};

// Optional: Token verifizieren (nicht erforderlich)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      let user;
      if (DB_TYPE === 'mongodb') {
        user = await User.findById(decoded.userId);
      } else {
        user = await User.findByPk(decoded.userId);
      }
      
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Bei Fehler einfach weitergehen (optional auth)
    next();
  }
};

// Middleware für Rollen-basierte Autorisierung
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentifizierung erforderlich',
        errorCode: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Hier können Sie Rollen-Logik implementieren
    // Beispiel: req.user.role sollte in der roles-Array enthalten sein
    if (roles && roles.length > 0) {
      const userRole = req.user.role || 'user';
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Unzureichende Berechtigungen',
          errorCode: 'INSUFFICIENT_PERMISSIONS'
        });
      }
    }

    next();
  };
};

// Middleware für User-spezifische Ressourcen
const requireOwnership = (resourceIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentifizierung erforderlich',
        errorCode: 'AUTHENTICATION_REQUIRED'
      });
    }

    const resourceUserId = req.params[resourceIdField] || req.body[resourceIdField];
    const currentUserId = req.user.id || req.user._id;

    if (resourceUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Zugriff verweigert',
        errorCode: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

module.exports = { 
  authenticateToken, 
  optionalAuth, 
  requireRole, 
  requireOwnership 
};

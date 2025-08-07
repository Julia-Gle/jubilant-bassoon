const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    
    // User aus Datenbank holen
    const user = await User.findByPk(decoded.userId);
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
      const user = await User.findByPk(decoded.userId);
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

module.exports = { authenticateToken, optionalAuth };

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// JWT Token generieren
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Validierung für Registrierung
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username muss zwischen 3 und 50 Zeichen lang sein')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username darf nur Buchstaben, Zahlen und Unterstriche enthalten'),
  body('email')
    .isEmail()
    .withMessage('Gültige E-Mail-Adresse erforderlich')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Passwort muss mindestens 6 Zeichen lang sein')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten')
];

// Validierung für Login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Gültige E-Mail-Adresse erforderlich')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Passwort erforderlich')
];

// POST /register - Neuen Benutzer registrieren
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Validierungsfehler prüfen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { username, email, password } = req.body;

    // Prüfen ob Username bereits existiert
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username bereits vergeben',
        errorCode: 'USERNAME_EXISTS'
      });
    }

    // Prüfen ob E-Mail bereits existiert
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail-Adresse bereits registriert',
        errorCode: 'EMAIL_EXISTS'
      });
    }

    // Neuen Benutzer erstellen
    const user = await User.create({
      username,
      email,
      password // Wird automatisch durch Sequelize hooks gehashed
    });

    // JWT Token generieren
    const token = generateToken(user.id);

    // Erfolgreiche Antwort
    res.status(201).json({
      success: true,
      message: 'Benutzer erfolgreich registriert',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        token,
        tokenType: 'Bearer',
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler bei der Registrierung',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// POST /login - Benutzer anmelden
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Validierungsfehler prüfen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { email, password } = req.body;

    // Benutzer nach E-Mail suchen
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // Passwort validieren
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // JWT Token generieren
    const token = generateToken(user.id);

    // Erfolgreiche Antwort
    res.json({
      success: true,
      message: 'Anmeldung erfolgreich',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        token,
        tokenType: 'Bearer',
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Anmeldefehler:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler bei der Anmeldung',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// GET /profile - Benutzerprofil abrufen (geschützt)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profil erfolgreich abgerufen',
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          created_at: req.user.created_at,
          updated_at: req.user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Profilfehler:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Abrufen des Profils',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// POST /logout - Abmelden (Token invalidieren)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In einer echten Anwendung würdest du hier den Token auf eine Blacklist setzen
    // Für dieses Beispiel geben wir einfach eine Erfolgsmeldung zurück
    res.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });
  } catch (error) {
    console.error('Abmeldefehler:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Abmelden',
      errorCode: 'SERVER_ERROR'
    });
  }
});

module.exports = router;

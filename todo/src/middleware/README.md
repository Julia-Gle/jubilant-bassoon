# Auth Middleware Dokumentation

Diese Middleware bietet Authentifizierung und Autorisierung für die Todo App API.

## 🚀 Verfügbare Middleware

### 1. `authenticateToken`

**Beschreibung:** Validiert JWT-Token aus dem Authorization-Header und fügt den User an `req.user` hinzu.

**Verwendung:**
```javascript
const { authenticateToken } = require('../middleware/auth');

// Route mit Authentifizierung
router.get('/protected', authenticateToken, (req, res) => {
  // req.user ist jetzt verfügbar
  res.json({ user: req.user });
});
```

**Header-Format:**
```
Authorization: Bearer <jwt-token>
```

**Response bei fehlendem Token:**
```json
{
  "success": false,
  "message": "Access token erforderlich",
  "errorCode": "TOKEN_MISSING"
}
```

**Response bei ungültigem Token:**
```json
{
  "success": false,
  "message": "Ungültiger Token",
  "errorCode": "INVALID_TOKEN"
}
```

### 2. `optionalAuth`

**Beschreibung:** Optional Authentifizierung - fügt User hinzu, wenn Token vorhanden ist, aber blockiert nicht bei fehlendem Token.

**Verwendung:**
```javascript
const { optionalAuth } = require('../middleware/auth');

router.get('/public', optionalAuth, (req, res) => {
  // req.user ist verfügbar, wenn Token vorhanden ist
  const isAuthenticated = !!req.user;
  res.json({ isAuthenticated, user: req.user });
});
```

### 3. `requireRole`

**Beschreibung:** Rollen-basierte Autorisierung - prüft, ob der User die erforderliche Rolle hat.

**Verwendung:**
```javascript
const { authenticateToken, requireRole } = require('../middleware/auth');

// Nur Admins können zugreifen
router.get('/admin', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Admin-Bereich' });
});

// Admins oder Moderatoren können zugreifen
router.get('/moderate', authenticateToken, requireRole(['admin', 'moderator']), (req, res) => {
  res.json({ message: 'Moderator-Bereich' });
});
```

**Response bei unzureichenden Berechtigungen:**
```json
{
  "success": false,
  "message": "Unzureichende Berechtigungen",
  "errorCode": "INSUFFICIENT_PERMISSIONS"
}
```

### 4. `requireOwnership`

**Beschreibung:** Prüft, ob der User der Eigentümer der angefragten Ressource ist.

**Verwendung:**
```javascript
const { authenticateToken, requireOwnership } = require('../middleware/auth');

// User kann nur sein eigenes Profil abrufen
router.get('/user/:userId/profile', authenticateToken, requireOwnership('userId'), (req, res) => {
  res.json({ user: req.user });
});

// User kann nur seine eigenen Todos bearbeiten
router.put('/todos/:todoId', authenticateToken, requireOwnership('userId'), (req, res) => {
  res.json({ message: 'Todo aktualisiert' });
});
```

**Response bei Zugriffsverweigerung:**
```json
{
  "success": false,
  "message": "Zugriff verweigert",
  "errorCode": "ACCESS_DENIED"
}
```

## 🔧 Konfiguration

### JWT Secret
Setzen Sie das JWT Secret in der `.env`-Datei:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Datenbank-Kompatibilität
Die Middleware funktioniert automatisch mit:
- **SQL-Datenbanken** (Sequelize): Verwendet `findByPk()`
- **MongoDB** (Mongoose): Verwendet `findById()`

## 📝 Beispiele

### Vollständiges Beispiel mit allen Middleware-Typen:
```javascript
const express = require('express');
const { 
  authenticateToken, 
  optionalAuth, 
  requireRole, 
  requireOwnership 
} = require('../middleware/auth');

const router = express.Router();

// Öffentliche Route (keine Auth erforderlich)
router.get('/public', (req, res) => {
  res.json({ message: 'Öffentlich zugänglich' });
});

// Optional authentifizierte Route
router.get('/optional', optionalAuth, (req, res) => {
  res.json({ 
    message: 'Optional authentifiziert',
    user: req.user || null 
  });
});

// Geschützte Route (Auth erforderlich)
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Geschützt',
    user: req.user 
  });
});

// Admin-Route (Auth + Admin-Rolle erforderlich)
router.get('/admin', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({ 
    message: 'Admin-Bereich',
    user: req.user 
  });
});

// User-spezifische Route (Auth + Ownership erforderlich)
router.get('/user/:userId/settings', authenticateToken, requireOwnership('userId'), (req, res) => {
  res.json({ 
    message: 'User-Einstellungen',
    user: req.user,
    requestedUserId: req.params.userId 
  });
});

module.exports = router;
```

## 🛡️ Sicherheitsfeatures

1. **Token-Validierung:** JWT-Token werden auf Gültigkeit und Ablauf geprüft
2. **User-Verifizierung:** Token werden gegen die Datenbank validiert
3. **Rollen-basierte Autorisierung:** Flexible Rollenprüfung
4. **Ownership-Prüfung:** Ressourcen-Zugriffskontrolle
5. **Fehlerbehandlung:** Detaillierte Fehlermeldungen mit Error-Codes

## 🔍 Error Codes

- `TOKEN_MISSING`: Kein Token im Authorization-Header
- `INVALID_TOKEN`: Token ist ungültig oder beschädigt
- `TOKEN_EXPIRED`: Token ist abgelaufen
- `AUTHENTICATION_REQUIRED`: Authentifizierung erforderlich
- `INSUFFICIENT_PERMISSIONS`: Unzureichende Berechtigungen
- `ACCESS_DENIED`: Zugriff verweigert
- `SERVER_ERROR`: Interner Server-Fehler

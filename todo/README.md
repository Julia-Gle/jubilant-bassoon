# Todo App API mit Express.js, Sequelize und PostgreSQL

Eine vollständige REST API mit Express.js, Sequelize ORM und PostgreSQL Datenbank.

## 🚀 Features

- **Vollständige REST API** mit Express.js
- **User Model** mit UUID, username, email, password (gehashed) und createdAt
- **JWT Authentication** für sichere Anmeldung
- **Automatisches Password-Hashing** mit bcryptjs
- **PostgreSQL Integration** mit Sequelize ORM
- **Input Validierung** mit express-validator
- **Sicherheits-Middleware** (Helmet, CORS, Rate Limiting)
- **Geschützte Routen** mit JWT Middleware
- **Fehlerbehandlung** und Logging

## 📋 Voraussetzungen

- Node.js (Version 14 oder höher)
- PostgreSQL Datenbank
- npm oder yarn

## 🛠️ Installation

1. **Dependencies installieren:**
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren:**
```bash
cp env.example .env
```
Bearbeite die `.env` Datei mit deinen Datenbank-Einstellungen.

3. **PostgreSQL Datenbank erstellen:**
```sql
CREATE DATABASE todo_app;
```

## 🏃‍♂️ Verwendung

### Entwicklung starten:
```bash
npm run dev
```

### Produktion starten:
```bash
npm start
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden
- `GET /api/auth/profile` - Benutzerprofil abrufen (geschützt)
- `POST /api/auth/logout` - Abmelden (geschützt)

### System
- `GET /health` - Health Check

## 🧪 API Testing

### Mit curl:
```bash
# Registrierung
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Profil abrufen (Token aus Login-Response verwenden)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mit VS Code REST Client:
Verwende die `test-api.http` Datei für einfaches Testing.

## 📁 Projektstruktur

```
src/
├── config/
│   └── database.js      # Sequelize Konfiguration
├── models/
│   └── User.js          # User Model
├── middleware/
│   └── auth.js          # JWT Authentication Middleware
├── routes/
│   └── auth.js          # Authentication Routes
├── server.js            # Express Server
└── index.js             # Alte Hauptdatei (Beispiele)
```

## 🗄️ User Model

### Felder:
- **id**: UUID (Primärschlüssel, automatisch generiert)
- **username**: String (3-50 Zeichen, eindeutig)
- **email**: String (E-Mail-Format, eindeutig)
- **password**: String (6-255 Zeichen, automatisch gehashed)
- **created_at**: Timestamp (automatisch gesetzt)
- **updated_at**: Timestamp (automatisch aktualisiert)

### Methoden:
- `validatePassword(password)`: Validiert ein Password
- `updatePassword(newPassword)`: Ändert das Password
- `findByUsername(username)`: Findet User nach Username
- `findByEmail(email)`: Findet User nach E-Mail
- `createUser(userData)`: Erstellt einen neuen User

## 🔐 Sicherheit

- **Password-Hashing**: Automatisches Hashing mit bcryptjs (12 Salt-Rounds)
- **Validierung**: Eingabevalidierung für alle Felder
- **Eindeutigkeit**: Username und E-Mail sind eindeutig

## 📊 Datenbank-Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für bessere Performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

## 🧪 Beispiel-Verwendung

```javascript
// User erstellen
const user = await User.create({
  username: 'testuser',
  email: 'test@example.com',
  password: 'securepassword123'
});

// Password validieren
const isValid = await user.validatePassword('securepassword123');

// User finden
const foundUser = await User.findByUsername('testuser');

// Password ändern
await foundUser.updatePassword('newpassword456');
```

## 🔧 Konfiguration

Die Konfiguration erfolgt über Umgebungsvariablen:

### Datenbank:
- `DB_HOST`: Datenbank-Host (Standard: localhost)
- `DB_PORT`: Datenbank-Port (Standard: 5432)
- `DB_NAME`: Datenbank-Name (Standard: todo_app)
- `DB_USER`: Datenbank-Benutzer (Standard: postgres)
- `DB_PASSWORD`: Datenbank-Passwort (Standard: password)

### Server:
- `PORT`: Server-Port (Standard: 3000)
- `NODE_ENV`: Umgebung (Standard: development)

### JWT:
- `JWT_SECRET`: Geheimer Schlüssel für JWT-Token (Standard: your-secret-key)

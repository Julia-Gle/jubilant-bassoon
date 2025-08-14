# Todo App API mit flexibler Datenbank-Unterstützung

Eine vollständige REST API mit Express.js und flexibler Datenbank-Unterstützung (In-Memory, SQLite, PostgreSQL, MongoDB).

## 🚀 Features

- **Vollständige REST API** mit Express.js
- **Flexible Datenbank-Unterstützung**:
  - **In-Memory (SQLite)** - Standard für Entwicklung
  - **SQLite** - Datei-basierte SQL-Datenbank
  - **PostgreSQL** - Robuste SQL-Datenbank
  - **MongoDB** - NoSQL-Datenbank
- **User Model** mit UUID, username, email, password (gehashed) und createdAt
- **Todo Model** mit UUID, title, description, status (TODO/IN_PROGRESS/DONE), dueDate, userId
- **JWT Authentication** für sichere Anmeldung
- **Automatisches Password-Hashing** mit bcryptjs
- **Input Validierung** mit express-validator
- **Sicherheits-Middleware** (Helmet, CORS, Rate Limiting)
- **Geschützte Routen** mit JWT Middleware
- **Rollen-basierte Autorisierung** und Ownership-Prüfung
- **Fehlerbehandlung** und Logging

## 📋 Voraussetzungen

- Node.js (Version 14 oder höher)
- npm oder yarn
- **Optional**: PostgreSQL oder MongoDB (nur wenn nicht In-Memory verwendet wird)

## 🛠️ Installation

1. **Dependencies installieren:**
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren:**
```bash
cp env.example .env
```

## 🗄️ Datenbank-Konfiguration

Die App unterstützt verschiedene Datenbanktypen. Standardmäßig wird eine **In-Memory-Datenbank** verwendet.

### In-Memory (Standard)
```env
DB_TYPE=memory
```
- Keine externe Datenbank erforderlich
- Daten gehen beim Neustart verloren
- Perfekt für Entwicklung und Tests

### SQLite (Datei-basiert)
```env
DB_TYPE=sqlite
SQLITE_PATH=./data/todo.db
```
- Daten werden in einer Datei gespeichert
- Keine externe Datenbank erforderlich
- Daten bleiben nach Neustart erhalten

### PostgreSQL
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_app
DB_USER=postgres
DB_PASSWORD=password
```
- Robuste SQL-Datenbank
- Externe PostgreSQL-Installation erforderlich

### MongoDB
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/todo_app
```
- NoSQL-Datenbank
- Externe MongoDB-Installation erforderlich

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
- `GET /api/auth/admin` - Admin-Bereich (geschützt, Admin-Rolle)
- `GET /api/auth/user/:userId/profile` - User-spezifisches Profil (geschützt, Ownership)

### Todos
- `GET /api/todos` - Alle Todos des Users abrufen (geschützt)
- `POST /api/todos` - Neues Todo erstellen (geschützt)
- `GET /api/todos/:id` - Einzelnes Todo abrufen (geschützt, Ownership)
- `PUT /api/todos/:id` - Todo aktualisieren (geschützt, Ownership)
- `DELETE /api/todos/:id` - Todo löschen (geschützt, Ownership)
- `PATCH /api/todos/:id/status` - Todo-Status ändern (geschützt, Ownership)
- `GET /api/todos/status/:status` - Todos nach Status filtern (geschützt)
- `GET /api/todos/overdue` - Überfällige Todos abrufen (geschützt)

### System
- `GET /health` - Health Check (zeigt aktuellen Datenbank-Typ)

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

# Todo erstellen
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Mein Todo","description":"Beschreibung","status":"TODO","dueDate":"2024-12-31T23:59:59.000Z"}'

# Todos abrufen
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mit VS Code REST Client:
Verwende die `test-api.http` Datei für einfaches Testing.

## 📁 Projektstruktur

```
src/
├── config/
│   └── database.js      # Flexible Datenbank-Konfiguration
├── models/
│   ├── index.js         # Model-Beziehungen
│   ├── User.js          # User Model (Sequelize + Mongoose)
│   └── Todo.js          # Todo Model (Sequelize + Mongoose)
├── middleware/
│   ├── auth.js          # JWT Authentication Middleware
│   └── README.md        # Middleware-Dokumentation
├── routes/
│   ├── auth.js          # Authentication Routes
│   └── todos.js         # Todo Routes
├── server.js            # Express Server
└── index.js             # Alte Hauptdatei (Beispiele)
```

## 🗄️ Model-Schemas

### User Model
- **id**: UUID (Primärschlüssel, automatisch generiert)
- **username**: String (3-50 Zeichen, eindeutig)
- **email**: String (E-Mail-Format, eindeutig)
- **password**: String (6-255 Zeichen, automatisch gehashed)
- **created_at**: Timestamp (automatisch gesetzt)
- **updated_at**: Timestamp (automatisch aktualisiert)

### Todo Model
- **id**: UUID (Primärschlüssel, automatisch generiert)
- **title**: String (1-255 Zeichen, erforderlich)
- **description**: Text (optional)
- **status**: Enum (TODO, IN_PROGRESS, DONE, Standard: TODO)
- **dueDate**: Date (optional)
- **userId**: UUID (Fremdschlüssel zu User, erforderlich)
- **created_at**: Timestamp (automatisch gesetzt)
- **updated_at**: Timestamp (automatisch aktualisiert)

## 🔐 Sicherheit

- **Password-Hashing**: Automatisches Hashing mit bcryptjs (12 Salt-Rounds)
- **Validierung**: Eingabevalidierung für alle Felder
- **Eindeutigkeit**: Username und E-Mail sind eindeutig
- **JWT-Token**: Sichere Token-basierte Authentifizierung
- **Ownership-Prüfung**: User können nur ihre eigenen Ressourcen bearbeiten
- **Rollen-basierte Autorisierung**: Flexible Berechtigungssysteme

## 🔄 Datenbank wechseln

Um die Datenbank zu wechseln, ändern Sie einfach die `DB_TYPE` in der `.env`-Datei:

```env
# Für In-Memory (Standard)
DB_TYPE=memory

# Für PostgreSQL
DB_TYPE=postgresql

# Für MongoDB
DB_TYPE=mongodb

# Für SQLite
DB_TYPE=sqlite
```

Die App passt sich automatisch an und verwendet die entsprechende Datenbank-Implementierung.

## 🧪 Beispiel-Verwendung

### User-Operationen:
```javascript
// User erstellen (funktioniert mit allen Datenbanktypen)
const user = await User.create({
  username: 'testuser',
  email: 'test@example.com',
  password: 'securepassword123'
});

// Password validieren
const isValid = await user.validatePassword('securepassword123');

// User finden
const foundUser = await User.findByUsername('testuser');
```

### Todo-Operationen:
```javascript
// Todo erstellen
const todo = await Todo.create({
  title: 'Mein Todo',
  description: 'Beschreibung',
  status: 'TODO',
  dueDate: new Date('2024-12-31'),
  userId: user.id
});

// Todos nach Status filtern
const doneTodos = await Todo.findByUserIdAndStatus(user.id, 'DONE');

// Todo-Status ändern
await todo.markAsDone();

// Überfällige Todos finden
const overdueTodos = await Todo.findOverdue();
```

## 🔧 Konfiguration

Die Konfiguration erfolgt über Umgebungsvariablen:

### Datenbank-Auswahl:
- `DB_TYPE`: Datenbank-Typ (memory, sqlite, postgresql, mongodb)

### SQLite:
- `SQLITE_PATH`: Pfad zur SQLite-Datei (Standard: :memory:)

### PostgreSQL:
- `DB_HOST`: Datenbank-Host (Standard: localhost)
- `DB_PORT`: Datenbank-Port (Standard: 5432)
- `DB_NAME`: Datenbank-Name (Standard: todo_app)
- `DB_USER`: Datenbank-Benutzer (Standard: postgres)
- `DB_PASSWORD`: Datenbank-Passwort (Standard: password)

### MongoDB:
- `MONGODB_URI`: MongoDB-Verbindungs-URI (Standard: mongodb://localhost:27017/todo_app)

### Server:
- `PORT`: Server-Port (Standard: 3000)
- `NODE_ENV`: Umgebung (Standard: development)

### JWT:
- `JWT_SECRET`: Geheimer Schlüssel für JWT-Token (Standard: your-secret-key)

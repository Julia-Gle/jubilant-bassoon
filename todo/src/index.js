const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');

// Hauptfunktion
async function main() {
  try {
    // Datenbank-Verbindung testen
    await testConnection();
    
    // Tabellen synchronisieren (nur für Entwicklung!)
    await sequelize.sync({ force: true });
    console.log('✅ Tabellen erfolgreich synchronisiert.');
    
    // Beispiel: User erstellen
    console.log('\n📝 Erstelle Beispiel-User...');
    const newUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'securepassword123'
    });
    
    console.log('✅ User erstellt:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.created_at
    });
    
    // Beispiel: User finden
    console.log('\n🔍 Suche User nach Username...');
    const foundUser = await User.findByUsername('testuser');
    if (foundUser) {
      console.log('✅ User gefunden:', {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email
      });
    }
    
    // Beispiel: Password validieren
    console.log('\n🔐 Validiere Password...');
    const isValidPassword = await foundUser.validatePassword('securepassword123');
    console.log('✅ Password ist gültig:', isValidPassword);
    
    const isInvalidPassword = await foundUser.validatePassword('wrongpassword');
    console.log('❌ Falsches Password:', isInvalidPassword);
    
    // Beispiel: Password ändern
    console.log('\n🔄 Ändere Password...');
    await foundUser.updatePassword('newsecurepassword456');
    console.log('✅ Password geändert');
    
    // Beispiel: Alle User anzeigen
    console.log('\n📋 Alle User:');
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'created_at']
    });
    console.table(allUsers.map(user => user.toJSON()));
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  } finally {
    // Datenbank-Verbindung schließen
    await sequelize.close();
    console.log('\n🔌 Datenbank-Verbindung geschlossen.');
  }
}

// Anwendung starten
if (require.main === module) {
  main();
}

module.exports = { main };

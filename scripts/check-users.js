const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'studio_pos.db');

console.log('🔍 Checking database users...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Database connected');
  
  db.all('SELECT id, username, email, role, full_name, is_active FROM users', (err, rows) => {
    if (err) {
      console.error('❌ Error querying users:', err.message);
      return;
    }
    
    console.log('📋 Registered users:');
    if (rows.length === 0) {
      console.log('  No users found');
    } else {
      rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.full_name}) - ${user.role} - Active: ${user.is_active}`);
      });
    }
    
    db.close();
  });
});

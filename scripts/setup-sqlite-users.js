const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'studio_pos.db');

console.log('🔧 Setting up SQLite database with users...');
console.log('Database path:', dbPath);

// Create database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error creating database:', err.message);
    return;
  }
  console.log('✅ Database created/opened');
  
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;
  
  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
      return;
    }
    console.log('✅ Users table created');
    
    // Insert users
    const users = [
      {
        id: 'admin',
        username: 'admin',
        password: 'admin123',
        email: 'admin@studio-pos.com',
        role: 'Administrator',
        full_name: 'Administrator',
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'kasir1',
        username: 'kasir1',
        password: 'kasir123',
        email: 'kasir1@studio-pos.com',
        role: 'Kasir',
        full_name: 'Kasir Satu',
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'kasir2',
        username: 'kasir2',
        password: 'kasir123',
        email: 'kasir2@studio-pos.com',
        role: 'Kasir',
        full_name: 'Kasir Dua',
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'manager',
        username: 'manager',
        password: 'manager123',
        email: 'manager@studio-pos.com',
        role: 'Manager',
        full_name: 'Manager',
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const insertUser = `
      INSERT OR REPLACE INTO users (id, username, password, email, role, full_name, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    let completed = 0;
    users.forEach((user) => {
      db.run(insertUser, [
        user.id, user.username, user.password, user.email,
        user.role, user.full_name, user.is_active,
        user.created_at, user.updated_at
      ], (err) => {
        if (err) {
          console.error(`❌ Error inserting user ${user.username}:`, err.message);
        } else {
          console.log(`✅ User ${user.username} inserted`);
        }
        completed++;
        if (completed === users.length) {
          // Verify users
          db.all('SELECT username, full_name, role, is_active FROM users', (err, rows) => {
            if (err) {
              console.error('❌ Error verifying users:', err.message);
            } else {
              console.log('\n📋 Users in database:');
              rows.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.username} (${user.full_name}) - ${user.role} - Active: ${user.is_active}`);
              });
            }
            db.close();
          });
        }
      });
    });
  });
});


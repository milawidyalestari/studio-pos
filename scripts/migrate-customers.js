const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database configuration
const getDatabaseConfig = () => {
  const userDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
  const dbPath = path.join(userDataPath, 'studio-pos', 'studio_pos.db');
  
  return {
    host: 'localhost',
    port: 5432,
    database: 'studio_pos',
    user: 'postgres',
    password: 'postgres',
    sqlitePath: dbPath
  };
};

const migrateCustomersTable = async () => {
  try {
    const config = getDatabaseConfig();
    
    // Try PostgreSQL first
    try {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
      });

      console.log('🔄 Migrating PostgreSQL customers table...');
      
      // Check if columns exist
      const checkColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name IN ('email', 'address')
      `);
      
      const existingColumns = checkColumns.rows.map(row => row.column_name);
      
      if (!existingColumns.includes('email')) {
        await pool.query('ALTER TABLE customers ADD COLUMN email TEXT');
        console.log('✅ Added email column to customers table');
      }
      
      if (!existingColumns.includes('address')) {
        await pool.query('ALTER TABLE customers ADD COLUMN address TEXT');
        console.log('✅ Added address column to customers table');
      }
      
      await pool.end();
      console.log('✅ PostgreSQL migration completed');
      
    } catch (pgError) {
      console.log('⚠️ PostgreSQL not available, migrating SQLite...');
      
      // Fallback to SQLite
      const dbPath = config.sqlitePath;
      const dbDir = path.dirname(dbPath);
      
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const db = new sqlite3.Database(dbPath);
      
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Check if columns exist
          db.all("PRAGMA table_info(customers)", (err, columns) => {
            if (err) {
              reject(err);
              return;
            }
            
            const existingColumns = columns.map(col => col.name);
            const migrations = [];
            
            if (!existingColumns.includes('email')) {
              migrations.push('ALTER TABLE customers ADD COLUMN email TEXT');
            }
            
            if (!existingColumns.includes('address')) {
              migrations.push('ALTER TABLE customers ADD COLUMN address TEXT');
            }
            
            if (migrations.length === 0) {
              console.log('✅ SQLite customers table already up to date');
              db.close();
              resolve();
              return;
            }
            
            // Run migrations
            let completed = 0;
            migrations.forEach((migration, index) => {
              db.run(migration, (err) => {
                if (err) {
                  console.error(`❌ Error running migration ${index + 1}:`, err);
                  reject(err);
                  return;
                }
                
                console.log(`✅ Migration ${index + 1} completed: ${migration}`);
                completed++;
                
                if (completed === migrations.length) {
                  console.log('✅ SQLite migration completed');
                  db.close();
                  resolve();
                }
              });
            });
          });
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration
migrateCustomersTable()
  .then(() => {
    console.log('🎉 Customers table migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

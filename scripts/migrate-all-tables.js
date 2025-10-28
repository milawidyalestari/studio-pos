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

const migrateAllTables = async () => {
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

      console.log('🔄 Migrating PostgreSQL database...');
      
      // Read and execute the full schema
      const schemaPath = path.join(__dirname, '..', 'database', 'supabase-setup.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and filter out empty statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
          } catch (err) {
            console.warn('⚠️ PostgreSQL statement warning:', err.message);
          }
        }
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
          // Read and execute the SQLite schema
          const schemaPath = path.join(__dirname, '..', 'database', 'sqlite-schema.sql');
          const schema = fs.readFileSync(schemaPath, 'utf8');
          
          // Split by semicolon and filter out empty statements
          const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
          
          let completed = 0;
          const totalStatements = statements.length;
          
          if (totalStatements === 0) {
            console.log('✅ No statements to execute');
            db.close();
            resolve();
            return;
          }
          
          statements.forEach((statement, index) => {
            if (statement.trim()) {
              db.run(statement, (err) => {
                if (err) {
                  console.warn(`⚠️ Statement ${index + 1} warning:`, err.message);
                } else {
                  console.log(`✅ Statement ${index + 1} executed successfully`);
                }
                
                completed++;
                if (completed === totalStatements) {
                  console.log('✅ SQLite migration completed');
                  db.close();
                  resolve();
                }
              });
            } else {
              completed++;
              if (completed === totalStatements) {
                console.log('✅ SQLite migration completed');
                db.close();
                resolve();
              }
            }
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
migrateAllTables()
  .then(() => {
    console.log('🎉 All tables migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const getDatabaseConfig = () => {
  const userDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
  const dbPath = path.join(userDataPath, 'studio-pos', 'studio_pos.db');
  return dbPath;
};

const verifyTables = async () => {
  try {
    const dbPath = getDatabaseConfig();
    console.log('🔍 Checking database at:', dbPath);
    
    const db = new sqlite3.Database(dbPath);
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // List all tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log('\n📋 Tables found in database:');
          tables.forEach(table => {
            console.log(`  ✅ ${table.name}`);
          });
          
          // Check for required tables
          const requiredTables = [
            'customers',
            'materials', 
            'products',
            'orders',
            'transactions',
            'categories',
            'suppliers',
            'employees',
            'users'
          ];
          
          console.log('\n🔍 Checking required tables:');
          const missingTables = [];
          
          requiredTables.forEach(tableName => {
            const exists = tables.some(table => table.name === tableName);
            if (exists) {
              console.log(`  ✅ ${tableName} - EXISTS`);
            } else {
              console.log(`  ❌ ${tableName} - MISSING`);
              missingTables.push(tableName);
            }
          });
          
          if (missingTables.length === 0) {
            console.log('\n🎉 All required tables are present!');
          } else {
            console.log(`\n⚠️ Missing tables: ${missingTables.join(', ')}`);
          }
          
          // Check materials table structure
          db.all("PRAGMA table_info(materials)", (err, columns) => {
            if (err) {
              console.log('\n⚠️ Could not check materials table structure');
            } else {
              console.log('\n📊 Materials table structure:');
              columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
              });
            }
            
            // Check customers table structure
            db.all("PRAGMA table_info(customers)", (err, columns) => {
              if (err) {
                console.log('\n⚠️ Could not check customers table structure');
              } else {
                console.log('\n📊 Customers table structure:');
                columns.forEach(col => {
                  console.log(`  - ${col.name} (${col.type})`);
                });
              }
              
              db.close();
              resolve();
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
};

// Run verification
verifyTables()
  .then(() => {
    console.log('\n✅ Database verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });

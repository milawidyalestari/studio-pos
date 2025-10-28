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

const migrateMaterialsTable = async () => {
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

      console.log('🔄 Migrating PostgreSQL materials table...');
      
      // Check if materials table exists
      const checkTable = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'materials'
        );
      `);
      
      if (!checkTable.rows[0].exists) {
        // Create materials table
        await pool.query(`
          CREATE TABLE materials (
            id TEXT PRIMARY KEY,
            kode TEXT NOT NULL UNIQUE,
            nama TEXT NOT NULL,
            satuan TEXT NOT NULL,
            stok_akhir INTEGER DEFAULT 0,
            stok_opname INTEGER DEFAULT 0,
            lebar_maksimum DECIMAL(10,2),
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
          );
        `);
        console.log('✅ Created materials table in PostgreSQL');
      } else {
        console.log('✅ Materials table already exists in PostgreSQL');
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
          // Check if materials table exists
          db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='materials'", (err, tables) => {
            if (err) {
              reject(err);
              return;
            }
            
            if (tables.length === 0) {
              // Create materials table
              const createTableSQL = `
                CREATE TABLE materials (
                  id TEXT PRIMARY KEY,
                  kode TEXT NOT NULL UNIQUE,
                  nama TEXT NOT NULL,
                  satuan TEXT NOT NULL,
                  stok_akhir INTEGER DEFAULT 0,
                  stok_opname INTEGER DEFAULT 0,
                  lebar_maksimum REAL,
                  created_at TEXT DEFAULT (datetime('now')),
                  updated_at TEXT DEFAULT (datetime('now'))
                );
              `;
              
              db.run(createTableSQL, (err) => {
                if (err) {
                  console.error('❌ Error creating materials table:', err);
                  reject(err);
                  return;
                }
                
                console.log('✅ Created materials table in SQLite');
                
                // Create indexes
                db.run('CREATE INDEX IF NOT EXISTS idx_materials_kode ON materials(kode);', (err) => {
                  if (err) {
                    console.warn('⚠️ Warning creating index on kode:', err.message);
                  }
                });
                
                db.run('CREATE INDEX IF NOT EXISTS idx_materials_nama ON materials(nama);', (err) => {
                  if (err) {
                    console.warn('⚠️ Warning creating index on nama:', err.message);
                  }
                });
                
                // Insert some sample materials
                const sampleMaterials = [
                  {
                    id: 'mat_001',
                    kode: 'KRT001',
                    nama: 'Kertas A3 80gsm',
                    satuan: 'Lembar',
                    stok_akhir: 100,
                    stok_opname: 100,
                    lebar_maksimum: 29.7
                  },
                  {
                    id: 'mat_002',
                    kode: 'KRT002',
                    nama: 'Kertas A4 80gsm',
                    satuan: 'Lembar',
                    stok_akhir: 200,
                    stok_opname: 200,
                    lebar_maksimum: 21.0
                  },
                  {
                    id: 'mat_003',
                    kode: 'VIN001',
                    nama: 'Vinyl Glossy',
                    satuan: 'Meter',
                    stok_akhir: 50,
                    stok_opname: 50,
                    lebar_maksimum: 1.37
                  }
                ];
                
                let inserted = 0;
                sampleMaterials.forEach((material, index) => {
                  const insertSQL = `
                    INSERT INTO materials (id, kode, nama, satuan, stok_akhir, stok_opname, lebar_maksimum)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                  `;
                  
                  db.run(insertSQL, [
                    material.id,
                    material.kode,
                    material.nama,
                    material.satuan,
                    material.stok_akhir,
                    material.stok_opname,
                    material.lebar_maksimum
                  ], (err) => {
                    if (err) {
                      console.warn(`⚠️ Warning inserting sample material ${index + 1}:`, err.message);
                    } else {
                      console.log(`✅ Inserted sample material: ${material.nama}`);
                    }
                    
                    inserted++;
                    if (inserted === sampleMaterials.length) {
                      console.log('✅ SQLite migration completed');
                      db.close();
                      resolve();
                    }
                  });
                });
              });
            } else {
              console.log('✅ Materials table already exists in SQLite');
              db.close();
              resolve();
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
migrateMaterialsTable()
  .then(() => {
    console.log('🎉 Materials table migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

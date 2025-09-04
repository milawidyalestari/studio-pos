const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Database imports
const { Pool } = require('pg');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Development flags
const isDevelopment = process.env.NODE_ENV === 'development';
const enableDevTools = process.argv.includes('--dev');
const enableLogging = process.argv.includes('--enable-logging');
const enableDebug = process.argv.includes('--inspect');

// Global reference to prevent garbage collection
let mainWindow;
let dbPool = null;

// Database configuration
const getDatabaseConfig = () => {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'studio_pos.db');
  
  return {
    host: 'localhost',
    port: 5432,
    database: 'studio_pos',
    user: 'postgres',
    password: 'postgres',
    // For SQLite fallback (if PostgreSQL not available)
    sqlitePath: dbPath
  };
};

// Initialize database connection
const initializeDatabase = async () => {
  try {
    const config = getDatabaseConfig();
    
    // Try PostgreSQL first
    try {
      dbPool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await dbPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ Connected to PostgreSQL database');
      return { type: 'postgresql', connected: true };
    } catch (pgError) {
      console.log('⚠️ PostgreSQL connection failed, falling back to SQLite');
      
      // Fallback to SQLite
      const sqlite3 = require('sqlite3').verbose();
      const dbPath = config.sqlitePath;
      
      // Ensure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      dbPool = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ SQLite connection failed:', err);
          throw err;
        }
        console.log('✅ Connected to SQLite database');
      });
      
      return { type: 'sqlite', connected: true };
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { type: 'none', connected: false, error: error.message };
  }
};

// Create database tables
const createTables = async () => {
  try {
    let schemaPath;
    
    if (dbPool.query) {
      // PostgreSQL
      schemaPath = path.join(__dirname, '..', 'database', 'supabase-setup.sql');
    } else {
      // SQLite
      schemaPath = path.join(__dirname, '..', 'database', 'sqlite-schema.sql');
    }
    
    const schema = await readFile(schemaPath, 'utf8');
    
    if (dbPool.query) {
      // PostgreSQL
      const queries = schema.split(';').filter(q => q.trim());
      for (const query of queries) {
        if (query.trim()) {
          await dbPool.query(query);
        }
      }
    } else {
      // SQLite
      const queries = schema.split(';').filter(q => q.trim());
      for (const query of queries) {
        if (query.trim()) {
          await new Promise((resolve, reject) => {
            dbPool.run(query, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
    }
    
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

// IPC Handlers for database operations
const setupIpcHandlers = () => {
  // Get database info
  ipcMain.handle('database:getInfo', async () => {
    try {
      if (!dbPool) {
        return { type: 'none', connected: false };
      }
      
      if (dbPool.query) {
        // PostgreSQL
        const result = await dbPool.query('SELECT NOW() as current_time');
        return { 
          type: 'postgresql', 
          connected: true, 
          currentTime: result.rows[0].current_time 
        };
      } else {
        // SQLite
        return { type: 'sqlite', connected: true };
      }
    } catch (error) {
      return { type: 'none', connected: false, error: error.message };
    }
  });

  // Query data
  ipcMain.handle('database:query', async (event, { table, options = {} }) => {
    try {
      if (!dbPool) throw new Error('Database not initialized');
      
      let query = `SELECT * FROM ${table}`;
      const params = [];
      
      // Add WHERE clause
      if (options.where) {
        const whereConditions = Object.entries(options.where)
          .map(([key, value], index) => {
            params.push(value);
            return `${key} = $${index + 1}`;
          })
          .join(' AND ');
        query += ` WHERE ${whereConditions}`;
      }
      
      // Add ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy.column} ${options.orderBy.direction.toUpperCase()}`;
      }
      
      // Add LIMIT
      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      
      if (dbPool.query) {
        // PostgreSQL
        const result = await dbPool.query(query, params);
        return result.rows;
      } else {
        // SQLite
        return new Promise((resolve, reject) => {
          dbPool.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      }
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  });

  // Create record
  ipcMain.handle('database:create', async (event, { table, data }) => {
    try {
      if (!dbPool) throw new Error('Database not initialized');
      
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`);
      
      const query = `
        INSERT INTO ${table} (${columns.join(', ')}) 
        VALUES (${placeholders.join(', ')}) 
        RETURNING *
      `;
      
      if (dbPool.query) {
        // PostgreSQL
        const result = await dbPool.query(query, values);
        return result.rows[0];
      } else {
        // SQLite
        return new Promise((resolve, reject) => {
          dbPool.run(query, values, function(err) {
            if (err) reject(err);
            else {
              // Get the inserted record
              dbPool.get(`SELECT * FROM ${table} WHERE id = ?`, [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          });
        });
      }
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  });

  // Update record
  ipcMain.handle('database:update', async (event, { table, id, data }) => {
    try {
      if (!dbPool) throw new Error('Database not initialized');
      
      const updates = Object.entries(data)
        .map(([key, value], index) => `${key} = $${index + 1}`)
        .join(', ');
      const values = Object.values(data);
      
      const query = `
        UPDATE ${table} 
        SET ${updates} 
        WHERE id = $${values.length + 1}
        RETURNING *
      `;
      
      if (dbPool.query) {
        // PostgreSQL
        const result = await dbPool.query(query, [...values, id]);
        return result.rows[0];
      } else {
        // SQLite
        return new Promise((resolve, reject) => {
          dbPool.run(query, [...values, id], function(err) {
            if (err) reject(err);
            else {
              // Get the updated record
              dbPool.get(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          });
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  });

  // Delete record
  ipcMain.handle('database:delete', async (event, { table, id }) => {
    try {
      if (!dbPool) throw new Error('Database not initialized');
      
      const query = `DELETE FROM ${table} WHERE id = $1`;
      
      if (dbPool.query) {
        // PostgreSQL
        await dbPool.query(query, [id]);
      } else {
        // SQLite
        await new Promise((resolve, reject) => {
          dbPool.run(query, [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  });

  // Transaction
  ipcMain.handle('database:transaction', async (event, { operations }) => {
    try {
      if (!dbPool) throw new Error('Database not initialized');
      
      if (dbPool.query) {
        // PostgreSQL transaction
        const client = await dbPool.connect();
        try {
          await client.query('BEGIN');
          const results = [];
          
          for (const operation of operations) {
            if (operation.type === 'create') {
              const columns = Object.keys(operation.data);
              const values = Object.values(operation.data);
              const placeholders = values.map((_, index) => `$${index + 1}`);
              
              const query = `
                INSERT INTO ${operation.table} (${columns.join(', ')}) 
                VALUES (${placeholders.join(', ')}) 
                RETURNING *
              `;
              
              const result = await client.query(query, values);
              results.push(result.rows[0]);
            } else if (operation.type === 'update') {
              const updates = Object.entries(operation.data)
                .map(([key, value], index) => `${key} = $${index + 1}`)
                .join(', ');
              const values = Object.values(operation.data);
              
              const query = `
                UPDATE ${operation.table} 
                SET ${updates} 
                WHERE id = $${values.length + 1}
                RETURNING *
              `;
              
              const result = await client.query(query, [...values, operation.id]);
              results.push(result.rows[0]);
            } else if (operation.type === 'delete') {
              const query = `DELETE FROM ${operation.table} WHERE id = $1`;
              await client.query(query, [operation.id]);
              results.push({ deleted: true });
            }
          }
          
          await client.query('COMMIT');
          return results;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } else {
        // SQLite transaction
        return new Promise((resolve, reject) => {
          dbPool.serialize(() => {
            dbPool.run('BEGIN TRANSACTION');
            
            const results = [];
            let operationIndex = 0;
            
            const processNextOperation = () => {
              if (operationIndex >= operations.length) {
                dbPool.run('COMMIT', (err) => {
                  if (err) reject(err);
                  else resolve(results);
                });
                return;
              }
              
              const operation = operations[operationIndex];
              
              if (operation.type === 'create') {
                const columns = Object.keys(operation.data);
                const values = Object.values(operation.data);
                const placeholders = values.map(() => '?').join(', ');
                
                const query = `
                  INSERT INTO ${operation.table} (${columns.join(', ')}) 
                  VALUES (${placeholders})
                `;
                
                dbPool.run(query, values, function(err) {
                  if (err) {
                    dbPool.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  // Get the inserted record
                  dbPool.get(`SELECT * FROM ${operation.table} WHERE id = ?`, [this.lastID], (err, row) => {
                    if (err) {
                      dbPool.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    results.push(row);
                    operationIndex++;
                    processNextOperation();
                  });
                });
              } else if (operation.type === 'update') {
                const updates = Object.entries(operation.data)
                  .map(([key]) => `${key} = ?`)
                  .join(', ');
                const values = Object.values(operation.data);
                
                const query = `
                  UPDATE ${operation.table} 
                  SET ${updates} 
                  WHERE id = ?
                `;
                
                dbPool.run(query, [...values, operation.id], function(err) {
                  if (err) {
                    dbPool.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  // Get the updated record
                  dbPool.get(`SELECT * FROM ${operation.table} WHERE id = ?`, [operation.id], (err, row) => {
                    if (err) {
                      dbPool.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    results.push(row);
                    operationIndex++;
                    processNextOperation();
                  });
                });
              } else if (operation.type === 'delete') {
                const query = `DELETE FROM ${operation.table} WHERE id = ?`;
                dbPool.run(query, [operation.id], (err) => {
                  if (err) {
                    dbPool.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  results.push({ deleted: true });
                  operationIndex++;
                  processNextOperation();
                });
              }
            };
            
            processNextOperation();
          });
        });
      }
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  });

  // File dialog handlers
  ipcMain.handle('dialog:showOpenDialog', async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
  });

  ipcMain.handle('dialog:showSaveDialog', async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
  });
};

// Create main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // Development optimizations
      devTools: isDevelopment,
      webSecurity: !isDevelopment,
    },
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    show: false,
    titleBarStyle: 'default',
    // Development window settings
    ...(isDevelopment && {
      minWidth: 1200,
      minHeight: 800,
      resizable: true,
      maximizable: true,
    })
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    
    // Development tools
    if (enableDevTools || isDevelopment) {
      mainWindow.webContents.openDevTools();
    }
    
    // Enable hot reload in development
    if (isDevelopment) {
      mainWindow.webContents.on('did-fail-load', () => {
        console.log('Page failed to load, retrying...');
        setTimeout(() => {
          mainWindow.loadURL('http://localhost:5173');
        }, 1000);
      });
    }
  } else {
    // Production mode - load from built files
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('Loading production app from:', indexPath);
    
    // Check if file exists
    if (require('fs').existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('❌ index.html not found at:', indexPath);
      // Fallback - try different paths
      const altPath = path.join(process.resourcesPath, 'app', 'dist', 'index.html');
      console.log('Trying alternative path:', altPath);
      if (require('fs').existsSync(altPath)) {
        mainWindow.loadFile(altPath);
      } else {
        console.error('❌ Alternative path also not found');
        // Show error dialog
        const { dialog } = require('electron');
        dialog.showErrorBox('App Loading Error', 'Could not find application files. Please reinstall the application.');
      }
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Always log in production for debugging
    console.log('🎯 Main window ready');
    console.log('🔧 Development mode:', isDevelopment);
    console.log('📦 App packaged:', app.isPackaged);
    console.log('🛠️ DevTools enabled:', enableDevTools);
    console.log('📝 Logging enabled:', enableLogging);
    console.log('📂 App path:', app.getAppPath());
    console.log('📂 Resources path:', process.resourcesPath);
    
    // Open DevTools in production for debugging
    if (!isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', errorDescription, 'URL:', validatedURL);
  });

  // Handle console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Renderer console:', level, message);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// App event handlers
app.whenReady().then(async () => {
  console.log('🚀 Starting Studio POS Electron app...');
  
  // Initialize database
  const dbStatus = await initializeDatabase();
  console.log('Database status:', dbStatus);
  
  if (dbStatus.connected) {
    // Create tables if they don't exist
    await createTables();
  }
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  // Create window
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Close database connection
  if (dbPool) {
    if (dbPool.end) {
      await dbPool.end();
    } else {
      dbPool.close();
    }
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Database imports
const { Pool } = require('pg');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

// Set environment - force production in packaged app
process.env.NODE_ENV = app.isPackaged ? 'production' : (process.env.NODE_ENV || 'development');

// Hide console window on Windows
if (process.platform === 'win32') {
  // Hide the console window using Windows API
  try {
    const { exec } = require('child_process');
    exec('powershell -Command "Add-Type -Name Win32 -Namespace Console -MemberDefinition \'[DllImport(\\"kernel32.dll\\")] public static extern IntPtr GetConsoleWindow(); [DllImport(\\"user32.dll\\")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);\'; $console = [Console.Win32]::GetConsoleWindow(); [Console.Win32]::ShowWindow($console, 0)"', (error) => {
      if (error) {
        // Fallback - console will remain visible
        console.log('Console window hiding not available');
      }
    });
  } catch (e) {
    // Fallback - console will remain visible
    console.log('Console window hiding not available');
  }
}

// Development flags - only enable in development
const isDevelopment = !app.isPackaged && process.env.NODE_ENV === 'development';
const enableDevTools = isDevelopment && process.argv.includes('--dev');
const enableLogging = isDevelopment && process.argv.includes('--enable-logging');
const enableDebug = isDevelopment && process.argv.includes('--inspect');

// Global reference to prevent garbage collection
let mainWindow;
let splashWindow;
let dbPool = null;
let viteProcess = null;

// Database configuration
let currentDbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'studio_pos',
  user: 'postgres',
  password: 'postgres'
};

const getDatabaseConfig = () => {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'studio_pos.db');
  
  return {
    ...currentDbConfig,
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

      // Test connection with timeout
      const client = await dbPool.connect();
      await Promise.race([
        client.query('SELECT NOW()'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
        )
      ]);
      client.release();
      
      console.log('✅ Connected to PostgreSQL database');
      return { type: 'postgresql', connected: true };
    } catch (pgError) {
      console.log('⚠️ PostgreSQL connection failed:', pgError.message);
      
      // If this is a configuration update, don't fallback to SQLite
      if (pgError.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to PostgreSQL server at ${config.host}:${config.port}. Please check if PostgreSQL is running and the connection details are correct.`);
      } else if (pgError.code === 'ENOTFOUND') {
        throw new Error(`PostgreSQL server not found at ${config.host}. Please check the host address.`);
      } else if (pgError.code === '28P01') {
        throw new Error(`Authentication failed for user '${config.user}'. Please check the username and password.`);
      } else if (pgError.code === '3D000') {
        throw new Error(`Database '${config.database}' does not exist. Please create the database first.`);
      } else {
        throw new Error(`PostgreSQL connection failed: ${pgError.message}`);
      }
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
    
    // Create default admin user
    await createDefaultUser();
    
    console.log('✅ Database tables and default data created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

// Create default admin user
const createDefaultUser = async () => {
  try {
    const adminUser = {
      id: 'admin',
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      email: 'admin@studio-pos.com',
      role: 'Administrator', // Fix role name
      full_name: 'Administrator',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (dbPool.query) {
      // PostgreSQL
      await dbPool.query(`
        INSERT INTO users (id, username, password, email, role, full_name, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [
        adminUser.id, adminUser.username, adminUser.password, adminUser.email,
        adminUser.role, adminUser.full_name, adminUser.is_active,
        adminUser.created_at, adminUser.updated_at
      ]);
    } else {
      // SQLite
      await new Promise((resolve, reject) => {
        dbPool.run(`
          INSERT OR IGNORE INTO users (id, username, password, email, role, full_name, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          adminUser.id, adminUser.username, adminUser.password, adminUser.email,
          adminUser.role, adminUser.full_name, adminUser.is_active,
          adminUser.created_at, adminUser.updated_at
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('✅ Default admin user created (admin/admin123)');
  } catch (error) {
    console.error('❌ Error creating default user:', error);
  }
};

// IPC Handlers for database operations
const setupIpcHandlers = () => {
  // Database configuration handler
  ipcMain.handle('database:updateConfig', async (event, config) => {
    try {
      console.log('🔧 Updating database configuration:', config);
      
      // Update current configuration
      if (config.connection) {
        currentDbConfig = {
          host: config.connection.host || 'localhost',
          port: config.connection.port || 5432,
          database: config.connection.database || 'studio_pos',
          user: config.connection.username || 'postgres',
          password: config.connection.password || 'postgres'
        };
      }
      
      // Close existing connection
      if (dbPool) {
        try {
          if (dbPool.end) {
            await dbPool.end();
          }
        } catch (closeError) {
          console.warn('Warning: Error closing existing connection:', closeError.message);
        }
        dbPool = null;
      }
      
      // Reinitialize with new config
      const result = await initializeDatabase();
      if (!result.connected) {
        throw new Error(result.error || 'Database initialization failed');
      }
      
      console.log('✅ Database configuration updated successfully:', currentDbConfig);
      return { success: true, config: currentDbConfig, type: result.type };
    } catch (error) {
      console.error('❌ Database config update error:', error);
      return { success: false, error: error.message };
    }
  });

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
      
      // Quote column names to avoid SQL syntax errors with reserved words
      const quotedColumns = columns.map(col => `"${col}"`).join(', ');
      
      const query = `
        INSERT INTO ${table} (${quotedColumns}) 
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
      
      // Quote column names to avoid SQL syntax errors
      const updates = Object.entries(data)
        .map(([key, value], index) => `"${key}" = $${index + 1}`)
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

  // User authentication handlers
  console.log('🔐 Registering auth:login handler...');
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      console.log('🔐 Login attempt received:', { username, password: '***' });
      console.log('🔐 Database pool status:', dbPool ? 'Available' : 'Not available');
      
      // Check if database is available
      if (!dbPool) {
        console.log('⚠️ Database not initialized, using fallback authentication');
        // Fallback to default admin user
        if (username === 'admin' && password === 'admin123') {
          return {
            id: 'admin',
            username: 'admin',
            password: 'admin123',
            email: 'admin@studio-pos.com',
            role: 'Administrator',
            full_name: 'Administrator',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      let query, params;
      if (dbPool.query) {
        // PostgreSQL
        query = 'SELECT * FROM users WHERE username = $1 AND password = $2 AND is_active = true';
        params = [username, password];
      } else {
        // SQLite
        query = 'SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1';
        params = [username, password];
      }
      
      let user = null;
      if (dbPool.query) {
        const result = await dbPool.query(query, params);
        user = result.rows[0] || null;
      } else {
        user = await new Promise((resolve, reject) => {
          dbPool.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          });
        });
      }
      
      // Fix role name if found
      if (user && user.role === 'admin') {
        user.role = 'Administrator';
      }
      
      console.log('🔐 Login result:', user ? 'Success' : 'Failed');
      if (user) {
        console.log('🔐 User details:', { username: user.username, role: user.role, full_name: user.full_name });
      }
      return user;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Fallback to default admin user on error
      if (username === 'admin' && password === 'admin123') {
        console.log('🔄 Using fallback admin user');
        return {
          id: 'admin',
          username: 'admin',
          password: 'admin123',
          email: 'admin@studio-pos.com',
          role: 'Administrator',
          full_name: 'Administrator',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      throw error;
    }
  });

  ipcMain.handle('auth:getCurrentUser', async () => {
    // This would typically get from session, but for now return null
    return null;
  });

  // Test handler to verify IPC communication
  ipcMain.handle('auth:test', async () => {
    console.log('🧪 Auth test handler called');
    return { success: true, message: 'Auth handlers are working' };
  });

  // File dialog handlers
  ipcMain.handle('dialog:showOpenDialog', async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
  });

  ipcMain.handle('dialog:showSaveDialog', async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
  });

  // Window control handlers
  ipcMain.handle('window:setTransparent', async (event, transparent = true) => {
    try {
      if (mainWindow) {
        mainWindow.setTransparent(transparent);
        return { success: true, transparent };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Set transparent error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:setFrame', async (event, frame = false) => {
    try {
      if (mainWindow) {
        mainWindow.setFrame(frame);
        return { success: true, frame };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Set frame error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:setTitleBarStyle', async (event, style = 'hidden') => {
    try {
      if (mainWindow) {
        mainWindow.setTitleBarStyle(style);
        return { success: true, style };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Set title bar style error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:setVibrancy', async (event, vibrancy = 'under-window') => {
    try {
      if (mainWindow && process.platform === 'darwin') {
        mainWindow.setVibrancy(vibrancy);
        return { success: true, vibrancy };
      }
      return { success: false, error: 'Vibrancy only available on macOS' };
    } catch (error) {
      console.error('Set vibrancy error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:getWindowInfo', async () => {
    try {
      if (mainWindow) {
        const bounds = mainWindow.getBounds();
        return {
          success: true,
          info: {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: mainWindow.isMaximized(),
            isMinimized: mainWindow.isMinimized(),
            isVisible: mainWindow.isVisible(),
            platform: process.platform
          }
        };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Get window info error:', error);
      return { success: false, error: error.message };
    }
  });

  // Window control handlers (minimize, maximize, close)
  ipcMain.handle('window:minimize', async () => {
    try {
      if (mainWindow) {
        mainWindow.minimize();
        return { success: true };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Minimize window error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:maximize', async () => {
    try {
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        return { success: true, isMaximized: mainWindow.isMaximized() };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Maximize window error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:close', async () => {
    try {
      if (mainWindow) {
        mainWindow.close();
        return { success: true };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Close window error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:setAlwaysOnTop', async (event, alwaysOnTop = true) => {
    try {
      if (mainWindow) {
        mainWindow.setAlwaysOnTop(alwaysOnTop);
        return { success: true, alwaysOnTop };
      }
      return { success: false, error: 'Main window not found' };
    } catch (error) {
      console.error('Set always on top error:', error);
      return { success: false, error: error.message };
    }
  });

  // Cash drawer handlers
  ipcMain.handle('cashdrawer:open', async (event, options = {}) => {
    try {
      const { port = 'COM1', baudRate = 9600, timeout = 5000 } = options;
      
      // For Windows, we'll use a simple approach with serial port
      // This is a basic implementation - you may need to install additional packages
      let SerialPort;
      try {
        SerialPort = require('serialport').SerialPort;
      } catch (error) {
        console.warn('SerialPort not available:', error.message);
        return Promise.resolve({ success: false, message: 'SerialPort not available' });
      }
      
      const serialPort = new SerialPort({
        path: port,
        baudRate: baudRate,
        autoOpen: false
      });

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          serialPort.close();
          reject(new Error('Cash drawer timeout'));
        }, timeout);

        serialPort.open((err) => {
          if (err) {
            clearTimeout(timeoutId);
            reject(err);
            return;
          }

          // Send open command (ESC/POS command for cash drawer)
          // Different printers may use different commands
          const openCommand = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]); // ESC p 0 25 250
          
          port.write(openCommand, (err) => {
            clearTimeout(timeoutId);
            port.close();
            
            if (err) {
              reject(err);
            } else {
              resolve({ success: true, message: 'Cash drawer opened successfully' });
            }
          });
        });
      });
    } catch (error) {
      console.error('Cash drawer error:', error);
      throw error;
    }
  });

  ipcMain.handle('cashdrawer:test', async (event, options = {}) => {
    try {
      // Test if cash drawer is available
      const { port = 'COM1' } = options;
      
      // Check if port exists
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();
      
      const availablePort = ports.find(p => p.path === port);
      
      if (!availablePort) {
        return { 
          available: false, 
          message: `Port ${port} not found. Available ports: ${ports.map(p => p.path).join(', ')}` 
        };
      }

      return { 
        available: true, 
        message: `Port ${port} is available`,
        portInfo: availablePort
      };
    } catch (error) {
      console.error('Cash drawer test error:', error);
      return { 
        available: false, 
        message: `Error testing cash drawer: ${error.message}` 
      };
    }
  });

  ipcMain.handle('cashdrawer:listPorts', async () => {
    try {
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();
      
      return {
        success: true,
        ports: ports.map(port => ({
          path: port.path,
          manufacturer: port.manufacturer,
          serialNumber: port.serialNumber,
          pnpId: port.pnpId,
          locationId: port.locationId,
          vendorId: port.vendorId,
          productId: port.productId
        }))
      };
    } catch (error) {
      console.error('List ports error:', error);
      return {
        success: false,
        error: error.message,
        ports: []
      };
    }
  });
  
  console.log('✅ All IPC handlers registered successfully');
};

// Window configuration options
const windowConfigs = {
  // Standard window (default) - now transparent
  standard: {
    width: 1200,
    height: 800,
    transparent: true,
    frame: false,
    titleBarStyle: 'hiddenInset',
    minWidth: 1024,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    hasShadow: false, // No shadow for clean look
    backgroundColor: '#00000000', // Fully transparent background
    center: true, // Center window on screen
    show: false, // Don't show until ready
    skipTaskbar: false, // Show in taskbar
    alwaysOnTop: false, // Don't always stay on top
  },
  
  // Transparent window without frame
  transparent: {
    width: 1200,
    height: 800,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    minWidth: 1024,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    hasShadow: false, // Shadow disabled for transparent windows
    backgroundColor: '#00000000', // Fully transparent background
    center: true, // Center window on screen
    show: false, // Don't show until ready
    skipTaskbar: false, // Show in taskbar
    alwaysOnTop: false, // Don't always stay on top
    vibrancy: 'under-window', // macOS only
    visualEffectState: 'active', // macOS only
  },
  
  // Frameless window with custom title bar
  frameless: {
    width: 1200,
    height: 800,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    minWidth: 1024,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    hasShadow: true,
    backgroundColor: '#00000000', // Fully transparent background
    center: true, // Center window on screen
    show: false, // Don't show until ready
    skipTaskbar: false, // Show in taskbar
    alwaysOnTop: false, // Don't always stay on top
  },
  
  // Login window - completely transparent with floating card
  login: {
    width: 500,
    height: 600,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    minWidth: 400,
    minHeight: 500,
    resizable: false,
    maximizable: false,
    hasShadow: false, // No shadow for clean look
    backgroundColor: '#00000000', // Fully transparent background
    center: true, // Center window on screen
    show: false, // Don't show until ready
    skipTaskbar: false, // Show in taskbar
    alwaysOnTop: true, // Stay on top during login
  }
};

// Get window configuration from environment or default
const getWindowConfig = () => {
  const configType = process.env.WINDOW_TYPE || 'standard';
  return windowConfigs[configType] || windowConfigs.standard;
};

// Start Vite dev server for development
const startViteServer = () => {
  if (!isDev) return;
  
  console.log('🚀 Starting Vite dev server...');
  
  viteProcess = spawn('npm', ['run', 'dev:electron'], {
    stdio: 'pipe', // Hide console output
    shell: true,
    windowsHide: true, // Hide console window on Windows
    detached: false
  });

  // Handle Vite output silently
  viteProcess.stdout.on('data', (data) => {
    // Only log important messages, not all Vite output
    const output = data.toString();
    if (output.includes('ready in') || output.includes('Local:')) {
      console.log('✅ Vite server ready');
    }
  });

  viteProcess.stderr.on('data', (data) => {
    // Only log errors, not warnings
    const output = data.toString();
    if (output.includes('Error:') || output.includes('error:')) {
      console.error('❌ Vite server error:', output);
    }
  });

  viteProcess.on('error', (error) => {
    console.error('❌ Vite server error:', error);
  });

  viteProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log('🔄 Vite server exited with code:', code);
    }
  });
};

// Create splash screen
const createSplashScreen = () => {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false, // Borderless window
    alwaysOnTop: true,
    transparent: true, // Transparan agar background terlihat
    resizable: false,
    backgroundColor: '#00000000', // Background transparan
    hasShadow: true, // Ada shadow untuk depth
    skipTaskbar: true, // Don't show in taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    show: false,
    // Hide console window on Windows
    ...(process.platform === 'win32' && { windowsHide: true }),
  });

  // Load splash screen tanpa background berwarna
  const splashPath = path.join(__dirname, 'splash-clean.html');
  splashWindow.loadFile(splashPath);

  // Show splash screen when ready
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });

  return splashWindow;
};

// Create main window
const createWindow = () => {
  const config = getWindowConfig();
  
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // Development settings
      devTools: isDevelopment, // Enable DevTools in development
      webSecurity: true,
    },
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    show: false,
    // Window appearance
    transparent: config.transparent,
    frame: config.frame,
    titleBarStyle: config.titleBarStyle,
    hasShadow: config.hasShadow,
    vibrancy: config.vibrancy,
    visualEffectState: config.visualEffectState,
    
    // Window behavior
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    resizable: config.resizable,
    maximizable: config.maximizable,
    
    // Hide console window on Windows
    ...(process.platform === 'win32' && { windowsHide: true }),
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    
    // Development tools - always open in development mode
    if (isDevelopment) {
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
        // Try app.asar path
        const asarPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
        console.log('Trying asar path:', asarPath);
        if (require('fs').existsSync(asarPath)) {
          mainWindow.loadFile(asarPath);
        } else {
          console.error('❌ All paths failed');
          // Try resources path
          const resourcesPath = path.join(process.resourcesPath, 'dist', 'index.html');
          console.log('Trying resources path:', resourcesPath);
          if (require('fs').existsSync(resourcesPath)) {
            mainWindow.loadFile(resourcesPath);
          } else {
            console.error('❌ All paths failed');
            // Show error dialog
            const { dialog } = require('electron');
            dialog.showErrorBox('App Loading Error', 'Could not find application files. Please reinstall the application.');
          }
        }
      }
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    // Close splash screen if it exists
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    
    mainWindow.show();
    
    // Log only in development
    if (isDevelopment) {
      console.log('🎯 Main window ready');
      console.log('🔧 Development mode:', isDevelopment);
      console.log('📦 App packaged:', app.isPackaged);
      console.log('🛠️ DevTools enabled:', enableDevTools);
      console.log('📝 Logging enabled:', enableLogging);
      console.log('📂 App path:', app.getAppPath());
      console.log('📂 Resources path:', process.resourcesPath);
    }
    
    // Ensure DevTools are closed in production
    if (!isDevelopment && !isDev) {
      mainWindow.webContents.closeDevTools();
    }
  });

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', errorDescription, 'URL:', validatedURL);
  });

  // Handle console messages from renderer (only in development)
  if (isDevelopment) {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log('Renderer console:', level, message);
    });
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window minimize/restore events
  mainWindow.on('minimize', () => {
    console.log('Window minimized');
  });

  mainWindow.on('restore', () => {
    console.log('Window restored');
    // Ensure window is properly restored
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Handle when window is shown from taskbar
  mainWindow.on('show', () => {
    console.log('Window shown from taskbar');
    // Force window to be visible and focused
    if (mainWindow && mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });

  // Handle taskbar click (Windows)
  mainWindow.on('focus', () => {
    console.log('Window focused');
  });

  // Handle when window is hidden
  mainWindow.on('hide', () => {
    console.log('Window hidden');
  });
};

// App event handlers
app.whenReady().then(async () => {
  if (isDevelopment) {
    console.log('🚀 Starting Studio POS Electron app...');
  }
  
  // Start Vite dev server first if in development
  if (isDev) {
    startViteServer();
    // Wait a bit for Vite to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Setup IPC handlers FIRST - before anything else
  console.log('🔧 Setting up IPC handlers...');
  setupIpcHandlers();
  console.log('✅ IPC handlers registered successfully');
  
  // Show splash screen after handlers are registered
  createSplashScreen();
  
  // Initialize database
  const dbStatus = await initializeDatabase();
  if (isDevelopment) {
    console.log('Database status:', dbStatus);
  }
  
  if (dbStatus.connected) {
    // Create tables if they don't exist
    await createTables();
  }
  
  // Create window after everything is ready
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      // If window exists but is minimized, restore it
      if (mainWindow && mainWindow.isMinimized()) {
        mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      } else if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Kill Vite process when app closes
    if (viteProcess) {
      viteProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Kill Vite process
  if (viteProcess) {
    viteProcess.kill();
  }
  
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

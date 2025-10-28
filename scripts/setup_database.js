/**
 * Studio POS - Database Auto Setup
 * Description: Script untuk setup database otomatis saat aplikasi pertama kali dijalankan
 * Date: 2025-01-01
 * Version: 1.0.0
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseSetup {
    constructor() {
        this.postgresConfig = {
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'StudioPOS2024!',
            database: 'studio_pos'
        };
        
        this.setupStatus = {
            isSetup: false,
            error: null,
            steps: []
        };
    }

    /**
     * Check if database is already setup
     */
    async checkDatabaseSetup() {
        try {
            console.log('🔍 Checking database setup status...');
            
            // Check if database exists and has required tables
            const result = await this.executeQuery(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                ) as users_exists,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'transactions'
                ) as transactions_exists;
            `);

            if (result && result.rows && result.rows.length > 0) {
                const { users_exists, transactions_exists } = result.rows[0];
                return users_exists && transactions_exists;
            }
            
            return false;
        } catch (error) {
            console.log('❌ Database check failed:', error.message);
            return false;
        }
    }

    /**
     * Execute SQL query using psql
     */
    async executeQuery(query) {
        return new Promise((resolve, reject) => {
            const psqlPath = this.findPostgreSQLPath();
            if (!psqlPath) {
                reject(new Error('PostgreSQL not found. Please install PostgreSQL first.'));
                return;
            }

            const env = { ...process.env };
            env.PGPASSWORD = this.postgresConfig.password;

            const psql = spawn(psqlPath, [
                '-h', this.postgresConfig.host,
                '-p', this.postgresConfig.port.toString(),
                '-U', this.postgresConfig.username,
                '-d', this.postgresConfig.database,
                '-t', '-c', query
            ], { env });

            let output = '';
            let errorOutput = '';

            psql.stdout.on('data', (data) => {
                output += data.toString();
            });

            psql.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            psql.on('close', (code) => {
                if (code === 0) {
                    try {
                        // Parse psql output
                        const lines = output.trim().split('\n');
                        const rows = lines
                            .filter(line => line.trim() && !line.includes('rows)'))
                            .map(line => {
                                const values = line.split('|').map(v => v.trim());
                                return {
                                    users_exists: values[0] === 't',
                                    transactions_exists: values[1] === 't'
                                };
                            });
                        resolve({ rows });
                    } catch (parseError) {
                        resolve({ rows: [] });
                    }
                } else {
                    reject(new Error(`psql error: ${errorOutput}`));
                }
            });
        });
    }

    /**
     * Find PostgreSQL installation path
     */
    findPostgreSQLPath() {
        const possiblePaths = [
            'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
            'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe',
            'C:\\Program Files\\PostgreSQL\\13\\bin\\psql.exe',
            'C:\\Program Files\\PostgreSQL\\12\\bin\\psql.exe',
            'psql.exe' // If in PATH
        ];

        for (const psqlPath of possiblePaths) {
            if (fs.existsSync(psqlPath)) {
                return psqlPath;
            }
        }

        return null;
    }

    /**
     * Run database migration
     */
    async runMigration() {
        try {
            console.log('🚀 Starting database migration...');
            
            const migrationPath = path.join(__dirname, '..', 'db-migrations', 'apply_all_migrations.sql');
            
            if (!fs.existsSync(migrationPath)) {
                throw new Error('Migration file not found: ' + migrationPath);
            }

            const psqlPath = this.findPostgreSQLPath();
            if (!psqlPath) {
                throw new Error('PostgreSQL not found. Please install PostgreSQL first.');
            }

            const env = { ...process.env };
            env.PGPASSWORD = this.postgresConfig.password;

            return new Promise((resolve, reject) => {
                const psql = spawn(psqlPath, [
                    '-h', this.postgresConfig.host,
                    '-p', this.postgresConfig.port.toString(),
                    '-U', this.postgresConfig.username,
                    '-d', this.postgresConfig.database,
                    '-f', migrationPath
                ], { env });

                let output = '';
                let errorOutput = '';

                psql.stdout.on('data', (data) => {
                    const message = data.toString();
                    output += message;
                    console.log(message.trim());
                });

                psql.stderr.on('data', (data) => {
                    const message = data.toString();
                    errorOutput += message;
                    console.log('⚠️', message.trim());
                });

                psql.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Database migration completed successfully!');
                        resolve({ success: true, output });
                    } else {
                        console.log('❌ Database migration failed!');
                        reject(new Error(`Migration failed: ${errorOutput}`));
                    }
                });
            });

        } catch (error) {
            console.error('❌ Migration error:', error.message);
            throw error;
        }
    }

    /**
     * Create default admin user
     */
    async createDefaultUser() {
        try {
            console.log('👤 Creating default admin user...');
            
            const query = `
                INSERT INTO users (id, username, password, email, role, full_name, is_active) 
                VALUES ('admin', 'admin', 'admin123', 'admin@studio-pos.com', 'admin', 'Administrator', 1)
                ON CONFLICT (username) DO UPDATE SET
                    password = EXCLUDED.password,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    full_name = EXCLUDED.full_name,
                    is_active = EXCLUDED.is_active;
            `;

            await this.executeQuery(query);
            console.log('✅ Default admin user created/updated!');
            
        } catch (error) {
            console.error('❌ Failed to create default user:', error.message);
            throw error;
        }
    }

    /**
     * Setup database completely
     */
    async setupDatabase() {
        try {
            console.log('🗄️ Setting up Studio POS database...');
            console.log('=====================================');
            
            // Check if already setup
            const isSetup = await this.checkDatabaseSetup();
            if (isSetup) {
                console.log('✅ Database already setup!');
                this.setupStatus.isSetup = true;
                return this.setupStatus;
            }

            // Step 1: Run migration
            this.setupStatus.steps.push('Running database migration...');
            await this.runMigration();

            // Step 2: Create default user
            this.setupStatus.steps.push('Creating default admin user...');
            await this.createDefaultUser();

            // Step 3: Verify setup
            this.setupStatus.steps.push('Verifying database setup...');
            const verification = await this.checkDatabaseSetup();
            
            if (verification) {
                this.setupStatus.isSetup = true;
                console.log('🎉 Database setup completed successfully!');
                console.log('=====================================');
                console.log('Login credentials:');
                console.log('Username: admin');
                console.log('Password: admin123');
                console.log('=====================================');
            } else {
                throw new Error('Database setup verification failed');
            }

            return this.setupStatus;

        } catch (error) {
            console.error('❌ Database setup failed:', error.message);
            this.setupStatus.error = error.message;
            throw error;
        }
    }

    /**
     * Get database connection info
     */
    getConnectionInfo() {
        return {
            host: this.postgresConfig.host,
            port: this.postgresConfig.port,
            username: this.postgresConfig.username,
            password: this.postgresConfig.password,
            database: this.postgresConfig.database
        };
    }
}

module.exports = DatabaseSetup;


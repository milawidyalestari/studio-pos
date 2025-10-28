const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration - FIXED for your setup
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'studiopos',  // Your database name
  user: 'postgres',         // Your username
  password: '123',        // Your password
};

async function setupPostgreSQLSchema() {
  let pool;
  
  try {
    console.log('🔧 Connecting to PostgreSQL...');
    console.log('📊 Configuration:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });

    // Create connection pool
    pool = new Pool({
      ...dbConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'postgresql-schema-only.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading schema file...');
    console.log('📄 Schema file size:', schemaSQL.length, 'characters');
    
    // Execute schema
    console.log('🚀 Executing PostgreSQL schema...');
    await client.query(schemaSQL);
    
    console.log('✅ PostgreSQL schema created successfully!');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Verify indexes
    const indexesResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    `);
    
    console.log('🔍 Created indexes:');
    indexesResult.rows.forEach(row => {
      console.log(`  - ${row.indexname} on ${row.tablename}`);
    });
    
    // Verify specific tables for accounting
    console.log('🔍 Verifying accounting tables...');
    
    // Check journal_entries table structure
    const journalEntriesResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'journal_entries' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 journal_entries columns:');
    journalEntriesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check users table
    const usersResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 users columns:');
    usersResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check cash_accounts table
    const cashAccountsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cash_accounts' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 cash_accounts columns:');
    cashAccountsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check default data
    console.log('🔍 Checking default data...');
    
    const adminUserResult = await client.query(`SELECT * FROM users WHERE username = 'admin'`);
    console.log(`✅ Admin user created: ${adminUserResult.rows.length > 0 ? 'Yes' : 'No'}`);
    
    const primaryCashResult = await client.query(`SELECT * FROM cash_accounts WHERE is_primary = true`);
    console.log(`✅ Primary cash account created: ${primaryCashResult.rows.length > 0 ? 'Yes' : 'No'}`);
    
    const chartOfAccountsResult = await client.query(`SELECT COUNT(*) as count FROM chart_of_accounts`);
    console.log(`✅ Chart of accounts created: ${chartOfAccountsResult.rows[0].count} accounts`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error setting up PostgreSQL schema:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure PostgreSQL is running and accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Check the host address');
    } else if (error.code === '28P01') {
      console.error('💡 Check username and password');
    } else if (error.code === '3D000') {
      console.error('💡 Database does not exist. Create it first:');
      console.error(`   CREATE DATABASE ${dbConfig.database};`);
    } else if (error.code === '42P07') {
      console.error('💡 Table already exists. This is normal if you run the script multiple times.');
    }
    
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupPostgreSQLSchema()
    .then(() => {
      console.log('');
      console.log('🎉 PostgreSQL schema setup completed successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Start your Studio POS application');
      console.log('   2. Use the Database Setup Wizard to configure the connection');
      console.log('   3. The application will automatically detect the existing schema');
      console.log('');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupPostgreSQLSchema };

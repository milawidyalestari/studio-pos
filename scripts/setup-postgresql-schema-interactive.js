const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupPostgreSQLSchema() {
  let pool;
  
  try {
    console.log('🔧 Setting up PostgreSQL schema for Studio POS...');
    console.log('');

    // Get database configuration from user
    const host = await askQuestion('Enter PostgreSQL host [localhost]: ') || 'localhost';
    const port = parseInt(await askQuestion('Enter PostgreSQL port [5432]: ') || '5432');
    const database = await askQuestion('Enter database name [studio_pos]: ') || 'studio_pos';
    const user = await askQuestion('Enter PostgreSQL username [postgres]: ') || 'postgres';
    const password = await askQuestion('Enter PostgreSQL password: ');

    if (!password) {
      console.log('❌ Password is required');
      process.exit(1);
    }

    const dbConfig = {
      host,
      port,
      database,
      user,
      password,
    };

    console.log('');
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
    }
    
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
    rl.close();
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

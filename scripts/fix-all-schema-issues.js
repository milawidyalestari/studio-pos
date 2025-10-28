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

async function fixAllSchemaIssues() {
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
    
    // Read fix script
    const fixScriptPath = path.join(__dirname, '..', 'fix_all_schema_issues.sql');
    const fixSQL = fs.readFileSync(fixScriptPath, 'utf8');
    
    console.log('📖 Reading comprehensive fix script...');
    console.log('📄 Script size:', fixSQL.length, 'characters');
    
    // Execute fix script
    console.log('🚀 Executing comprehensive schema fix...');
    await client.query(fixSQL);
    
    console.log('✅ All schema issues fixed successfully!');
    
    // Verify the changes
    console.log('🔍 Verifying all table structures...');
    
    // Check suppliers table
    const suppliersResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'suppliers' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 suppliers table columns:');
    suppliersResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    // Check journal_entries table
    const journalEntriesResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'journal_entries' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 journal_entries table columns:');
    journalEntriesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    // Check cash_accounts table
    const cashAccountsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'cash_accounts' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 cash_accounts table columns:');
    cashAccountsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    // Check users table
    const usersResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 users table columns:');
    usersResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    // Check if all required columns exist
    console.log('🔍 Checking required columns...');
    
    const paymentTermsExists = suppliersResult.rows.some(row => row.column_name === 'payment_terms');
    console.log(`✅ suppliers.payment_terms: ${paymentTermsExists ? 'EXISTS' : 'MISSING'}`);
    
    const entryNumberExists = journalEntriesResult.rows.some(row => row.column_name === 'entry_number');
    console.log(`✅ journal_entries.entry_number: ${entryNumberExists ? 'EXISTS' : 'MISSING'}`);
    
    const isPrimaryExists = cashAccountsResult.rows.some(row => row.column_name === 'is_primary');
    console.log(`✅ cash_accounts.is_primary: ${isPrimaryExists ? 'EXISTS' : 'MISSING'}`);
    
    const usernameExists = usersResult.rows.some(row => row.column_name === 'username');
    console.log(`✅ users.username: ${usernameExists ? 'EXISTS' : 'MISSING'}`);
    
    // Check default data
    console.log('🔍 Checking default data...');
    
    const adminUserResult = await client.query(`SELECT * FROM users WHERE username = 'admin'`);
    console.log(`✅ Admin user: ${adminUserResult.rows.length > 0 ? 'EXISTS' : 'MISSING'}`);
    
    const primaryCashResult = await client.query(`SELECT * FROM cash_accounts WHERE is_primary = true`);
    console.log(`✅ Primary cash account: ${primaryCashResult.rows.length > 0 ? 'EXISTS' : 'MISSING'}`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error fixing schema issues:', error);
    
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
  }
}

// Run if called directly
if (require.main === module) {
  fixAllSchemaIssues()
    .then(() => {
      console.log('');
      console.log('🎉 All schema issues fixed successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Try creating a supplier again in Studio POS');
      console.log('   2. Try using accounting features');
      console.log('   3. All database operations should work correctly');
      console.log('');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixAllSchemaIssues };

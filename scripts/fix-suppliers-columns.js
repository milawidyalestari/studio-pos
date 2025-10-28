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

async function fixSuppliersColumns() {
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
    const fixScriptPath = path.join(__dirname, '..', 'fix_suppliers_columns.sql');
    const fixSQL = fs.readFileSync(fixScriptPath, 'utf8');
    
    console.log('📖 Reading fix script...');
    console.log('📄 Script size:', fixSQL.length, 'characters');
    
    // Execute fix script
    console.log('🚀 Executing suppliers table fix...');
    await client.query(fixSQL);
    
    console.log('✅ Suppliers table fixed successfully!');
    
    // Verify the changes
    console.log('🔍 Verifying suppliers table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'suppliers' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 suppliers table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    // Check if payment_terms column exists
    const paymentTermsExists = columnsResult.rows.some(row => row.column_name === 'payment_terms');
    console.log(`✅ payment_terms column: ${paymentTermsExists ? 'EXISTS' : 'MISSING'}`);
    
    // Check if credit_limit column exists
    const creditLimitExists = columnsResult.rows.some(row => row.column_name === 'credit_limit');
    console.log(`✅ credit_limit column: ${creditLimitExists ? 'EXISTS' : 'MISSING'}`);
    
    // Check if is_active column exists
    const isActiveExists = columnsResult.rows.some(row => row.column_name === 'is_active');
    console.log(`✅ is_active column: ${isActiveExists ? 'EXISTS' : 'MISSING'}`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error fixing suppliers table:', error);
    
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
  fixSuppliersColumns()
    .then(() => {
      console.log('');
      console.log('🎉 Suppliers table fix completed successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Try creating a supplier again in Studio POS');
      console.log('   2. The payment_terms column should now be available');
      console.log('   3. All supplier operations should work correctly');
      console.log('');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixSuppliersColumns };

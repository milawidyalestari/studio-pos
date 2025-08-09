#!/usr/bin/env node

/**
 * Import Script: Local File → Local Database
 * Imports exported data from JSON file to local PostgreSQL/MySQL database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg'; // PostgreSQL
// import mysql from 'mysql2/promise'; // Uncomment for MySQL

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Configuration
const DB_CONFIG = {
  // PostgreSQL Configuration
  postgresql: {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DB_PORT) || 5432,
    database: process.env.LOCAL_DB_NAME || 'studio_pos',
    user: process.env.LOCAL_DB_USER || 'postgres',
    password: process.env.LOCAL_DB_PASSWORD || '',
  },
  
  // MySQL Configuration (alternative)
  mysql: {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DB_PORT) || 3306,
    database: process.env.LOCAL_DB_NAME || 'studio_pos',
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || '',
  }
};

// Import order to handle foreign key dependencies
const IMPORT_ORDER = [
  'roles',
  'employees',
  'categories', 
  'groups',
  'units',
  'payment_types',
  'customers',
  'suppliers',
  'materials', 
  'products',
  'product_materials',
  'positions',
  'order_statuses',
  'orders',
  'order_items',
  'transactions', 
  'inventory_movements'
];

async function importToPostgreSQL(exportData) {
  console.log('🐘 Connecting to PostgreSQL...');
  
  const client = new Client(DB_CONFIG.postgresql);
  await client.connect();
  
  console.log(`✅ Connected to PostgreSQL: ${DB_CONFIG.postgresql.host}:${DB_CONFIG.postgresql.port}/${DB_CONFIG.postgresql.database}`);
  
  let totalImported = 0;
  const importResults = {};
  
  try {
    // Disable foreign key constraints temporarily
    console.log('🔓 Disabling foreign key constraints...');
    await client.query('SET session_replication_role = replica;');
    
    for (const tableName of IMPORT_ORDER) {
      const records = exportData.data[tableName];
      
      if (!records || records.length === 0) {
        console.log(`⏭️  Skipping ${tableName} (no data)`);
        importResults[tableName] = 0;
        continue;
      }
      
      console.log(`📥 Importing ${records.length} records to ${tableName}...`);
      
      let imported = 0;
      let errors = 0;
      
      for (const record of records) {
        try {
          const columns = Object.keys(record);
          const values = Object.values(record);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const query = `
            INSERT INTO ${tableName} (${columns.join(', ')}) 
            VALUES (${placeholders}) 
            ON CONFLICT DO NOTHING
          `;
          
          await client.query(query, values);
          imported++;
          
        } catch (error) {
          console.error(`   ❌ Error inserting record into ${tableName}:`, error.message);
          errors++;
          
          // Continue with other records
          continue;
        }
      }
      
      importResults[tableName] = imported;
      totalImported += imported;
      
      if (errors > 0) {
        console.log(`   ⚠️  ${tableName}: ${imported} imported, ${errors} errors`);
      } else {
        console.log(`   ✅ ${tableName}: ${imported} records imported successfully`);
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Re-enable foreign key constraints
    console.log('🔒 Re-enabling foreign key constraints...');
    await client.query('SET session_replication_role = DEFAULT;');
    
    // Update sequences for auto-increment fields
    console.log('🔄 Updating sequences...');
    await updateSequences(client);
    
  } finally {
    await client.end();
  }
  
  return { totalImported, importResults };
}

async function updateSequences(client) {
  const sequenceQueries = [
    `SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));`,
    `SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));`,
    `SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));`,
    `SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));`,
    `SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));`,
    `SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));`,
    `SELECT setval('materials_id_seq', (SELECT MAX(id) FROM materials));`,
    `SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));`,
    `SELECT setval('groups_id_seq', (SELECT MAX(id) FROM groups));`,
    `SELECT setval('units_id_seq', (SELECT MAX(id) FROM units));`,
    `SELECT setval('payment_types_id_seq', (SELECT MAX(id) FROM payment_types));`,
  ];
  
  for (const query of sequenceQueries) {
    try {
      await client.query(query);
    } catch (error) {
      // Sequence might not exist, continue
      console.log(`   ⚠️  Sequence update skipped: ${error.message}`);
    }
  }
}

async function importToMySQL(exportData) {
  console.log('🐬 MySQL import not implemented yet');
  console.log('Please use PostgreSQL or implement MySQL import logic');
  throw new Error('MySQL import not implemented');
}

async function importData(options = {}) {
  const dbType = options.dbType || 'postgresql';
  const inputFile = options.inputFile || findLatestExportFile();
  
  if (!inputFile || !fs.existsSync(inputFile)) {
    throw new Error(`Export file not found: ${inputFile}`);
  }
  
  console.log('📂 Loading export data...');
  console.log(`📁 Input file: ${inputFile}`);
  
  const exportData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  console.log(`📊 Export metadata:`);
  console.log(`   - Export date: ${exportData.metadata?.exportDate}`);
  console.log(`   - Source URL: ${exportData.metadata?.sourceUrl}`);
  console.log(`   - Version: ${exportData.metadata?.version}`);
  
  let result;
  
  switch (dbType) {
    case 'postgresql':
      result = await importToPostgreSQL(exportData);
      break;
    case 'mysql':
      result = await importToMySQL(exportData);
      break;
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
  
  // Generate import report
  generateImportReport(result, inputFile);
  
  console.log('\n🎉 Import completed successfully!');
  console.log(`📊 Total records imported: ${result.totalImported}`);
  
  return result;
}

function findLatestExportFile() {
  const files = fs.readdirSync(__dirname)
    .filter(file => file.startsWith('studio_pos_export_') && file.endsWith('.json'))
    .sort()
    .reverse();
    
  return files.length > 0 ? path.join(__dirname, files[0]) : null;
}

function generateImportReport(result, inputFile) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, `import_report_${timestamp}.txt`);
  
  let report = `Studio POS Data Import Report\n`;
  report += `=====================================\n\n`;
  report += `Import Date: ${new Date().toISOString()}\n`;
  report += `Source File: ${inputFile}\n`;
  report += `Total Imported: ${result.totalImported}\n\n`;
  
  report += `Table Details:\n`;
  report += `--------------\n`;
  
  for (const [tableName, count] of Object.entries(result.importResults)) {
    report += `${tableName.padEnd(20)} : ${count} records\n`;
  }
  
  report += `\nNext Steps:\n`;
  report += `-----------\n`;
  report += `1. Verify data integrity by checking key tables\n`;
  report += `2. Test application functionality\n`;
  report += `3. Update database configuration in settings\n`;
  report += `4. Backup the imported database\n`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`📋 Import report saved: ${reportPath}`);
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    dbType: process.argv[2] || 'postgresql',
    inputFile: process.argv[3] || findLatestExportFile()
  };
  
  console.log('🚀 Starting data import...');
  console.log(`🗄️  Target database: ${options.dbType}`);
  
  importData(options)
    .then((result) => {
      console.log('✅ Import process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error.message);
      process.exit(1);
    });
}

export { importData };

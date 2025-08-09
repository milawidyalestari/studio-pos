#!/usr/bin/env node

/**
 * Export Script: Supabase Cloud → Local File
 * Exports all data from Supabase to JSON file for migration
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oojmuyalhveuefjbwysj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

// Tables to export (in dependency order)
const TABLES_TO_EXPORT = [
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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportData() {
  console.log('🚀 Starting Supabase data export...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      sourceUrl: SUPABASE_URL,
      version: '1.0.0'
    },
    data: {}
  };
  
  let totalRecords = 0;
  
  for (const table of TABLES_TO_EXPORT) {
    try {
      console.log(`📊 Exporting table: ${table}...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('id', { ascending: true }); // Consistent ordering
        
      if (error) {
        console.error(`❌ Error exporting ${table}:`, error.message);
        
        // Try without ordering (some tables might not have 'id' column)
        const { data: retryData, error: retryError } = await supabase
          .from(table)
          .select('*');
          
        if (retryError) {
          console.error(`❌ Retry failed for ${table}:`, retryError.message);
          continue;
        }
        
        exportData.data[table] = retryData || [];
        console.log(`✅ Exported ${retryData?.length || 0} records from ${table} (retry success)`);
        totalRecords += retryData?.length || 0;
        continue;
      }
      
      exportData.data[table] = data || [];
      console.log(`✅ Exported ${data?.length || 0} records from ${table}`);
      totalRecords += data?.length || 0;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Unexpected error exporting ${table}:`, error.message);
      exportData.data[table] = [];
    }
  }
  
  // Save to multiple formats
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `studio_pos_export_${timestamp}`;
  
  // JSON format (main format)
  const jsonPath = path.join(__dirname, `${baseFilename}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2));
  
  // SQL format (for direct database import)
  const sqlPath = path.join(__dirname, `${baseFilename}.sql`);
  generateSQLFile(exportData.data, sqlPath);
  
  // Summary file
  const summaryPath = path.join(__dirname, `${baseFilename}_summary.txt`);
  generateSummaryFile(exportData, totalRecords, summaryPath);
  
  console.log('\n🎉 Export completed successfully!');
  console.log(`📁 Files created:`);
  console.log(`   - JSON: ${jsonPath}`);
  console.log(`   - SQL:  ${sqlPath}`);
  console.log(`   - Summary: ${summaryPath}`);
  console.log(`📊 Total records exported: ${totalRecords}`);
  
  return {
    success: true,
    totalRecords,
    files: { json: jsonPath, sql: sqlPath, summary: summaryPath }
  };
}

function generateSQLFile(data, filePath) {
  let sqlContent = `-- Studio POS Data Export\n-- Generated: ${new Date().toISOString()}\n\n`;
  
  // Disable foreign key checks
  sqlContent += `SET session_replication_role = replica;\n\n`;
  
  for (const [tableName, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;
    
    sqlContent += `-- Table: ${tableName}\n`;
    sqlContent += `DELETE FROM ${tableName};\n`;
    
    for (const record of records) {
      const columns = Object.keys(record).join(', ');
      const values = Object.values(record).map(val => {
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        return val;
      }).join(', ');
      
      sqlContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
    }
    
    sqlContent += `\n`;
  }
  
  // Re-enable foreign key checks
  sqlContent += `SET session_replication_role = DEFAULT;\n`;
  
  fs.writeFileSync(filePath, sqlContent);
}

function generateSummaryFile(exportData, totalRecords, filePath) {
  let summary = `Studio POS Data Export Summary\n`;
  summary += `=====================================\n\n`;
  summary += `Export Date: ${exportData.metadata.exportDate}\n`;
  summary += `Source URL: ${exportData.metadata.sourceUrl}\n`;
  summary += `Total Records: ${totalRecords}\n\n`;
  
  summary += `Table Details:\n`;
  summary += `--------------\n`;
  
  for (const [tableName, records] of Object.entries(exportData.data)) {
    summary += `${tableName.padEnd(20)} : ${records?.length || 0} records\n`;
  }
  
  summary += `\nUsage Instructions:\n`;
  summary += `------------------\n`;
  summary += `1. For JSON import: Use the JSON file with import-to-local.js script\n`;
  summary += `2. For SQL import: Run the SQL file directly in your PostgreSQL database\n`;
  summary += `3. Verify import: Check record counts match this summary\n`;
  
  fs.writeFileSync(filePath, summary);
}

// Execute export if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportData()
    .then((result) => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Export failed:', error);
      process.exit(1);
    });
}

export { exportData };

#!/usr/bin/env node

/**
 * Script to replace all hardcoded Supabase usage with databaseService
 * This script will:
 * 1. Remove supabase imports
 * 2. Replace supabase.from() calls with databaseService methods
 * 3. Update error handling
 * 4. Fix query patterns
 */

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'src/hooks/useProducts.ts',
  'src/hooks/useCategories.ts',
  'src/hooks/useUnits.ts',
  'src/hooks/useGroups.ts',
  'src/hooks/useMaterials.ts',
  'src/hooks/useTransactions.ts',
  'src/hooks/useTransactionMaster.ts',
  'src/hooks/usePaymentTypes.ts',
  'src/hooks/useOrderStatus.ts',
  'src/hooks/useNotifications.ts',
  'src/hooks/useDatabase.ts',
  'src/components/ProductForm.tsx',
  'src/components/order/ItemFormSection.tsx',
  'src/components/AddStockModal.tsx',
  'src/components/master-data/EmployeesTab.tsx',
  'src/components/settings/ProgramTools.tsx',
  'src/components/settings/UserSettings.tsx',
  'src/pages/MasterData.tsx',
  'src/pages/Inventory.tsx',
  'src/pages/Orderan.tsx',
  'src/pages/Suppliers.tsx',
  'src/services/accountingService.ts',
  'src/components/SupplierModal.tsx',
  'src/components/dashboard/OrdersTableContent.tsx'
];

// Patterns to replace
const replacements = [
  // Remove supabase imports
  {
    pattern: /import\s*{\s*supabase\s*}\s*from\s*['"]@\/integrations\/supabase\/client['"];?\s*\n?/g,
    replacement: ''
  },
  {
    pattern: /import\s*supabase\s*from\s*['"]@\/integrations\/supabase\/client['"];?\s*\n?/g,
    replacement: ''
  },
  
  // Replace supabase.from() query patterns
  {
    pattern: /const\s*{\s*data\s*,\s*error\s*}\s*=\s*await\s*supabase\s*\.from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.select\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.order\s*\(\s*['"]([^'"]+)['"]\s*\);?\s*\n?\s*if\s*\(\s*error\s*\)\s*throw\s*error;\s*\n?\s*return\s*data;?/g,
    replacement: 'return await databaseService.query(\'$1\', {\n    select: \'$2\',\n    orderBy: { column: \'$3\', direction: \'asc\' }\n  });'
  },
  
  // Replace simple select queries
  {
    pattern: /const\s*{\s*data\s*,\s*error\s*}\s*=\s*await\s*supabase\s*\.from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.select\s*\(\s*['"]([^'"]+)['"]\s*\);?\s*\n?\s*if\s*\(\s*error\s*\)\s*throw\s*error;\s*\n?\s*return\s*data;?/g,
    replacement: 'return await databaseService.query(\'$1\', {\n    select: \'$2\'\n  });'
  },
  
  // Replace insert operations
  {
    pattern: /const\s*{\s*data\s*,\s*error\s*}\s*=\s*await\s*supabase\s*\.from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.insert\s*\(\s*([^)]+)\s*\)\s*\.select\s*\(\)\s*\.single\s*\(\s*\);?\s*\n?\s*if\s*\(\s*error\s*\)\s*throw\s*error;\s*\n?\s*return\s*data;?/g,
    replacement: 'return await databaseService.create(\'$1\', $2);'
  },
  
  // Replace update operations
  {
    pattern: /const\s*{\s*data\s*,\s*error\s*}\s*=\s*await\s*supabase\s*\.from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.update\s*\(\s*([^)]+)\s*\)\s*\.eq\s*\(\s*['"]([^'"]+)['"]\s*,\s*([^)]+)\s*\)\s*\.select\s*\(\)\s*\.single\s*\(\s*\);?\s*\n?\s*if\s*\(\s*error\s*\)\s*throw\s*error;\s*\n?\s*return\s*data;?/g,
    replacement: 'return await databaseService.update(\'$1\', $4, $2);'
  },
  
  // Replace delete operations
  {
    pattern: /const\s*{\s*error\s*}\s*=\s*await\s*supabase\s*\.from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.delete\s*\(\s*\)\s*\.eq\s*\(\s*['"]([^'"]+)['"]\s*,\s*([^)]+)\s*\);?\s*\n?\s*if\s*\(\s*error\s*\)\s*throw\s*error;?/g,
    replacement: 'await databaseService.delete(\'$1\', $3);'
  }
];

function processFile(filePath) {
  try {
    console.log(`📝 Processing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Fixing all hardcoded Supabase usage...');
  
  filesToProcess.forEach(filePath => {
    processFile(filePath);
  });
  
  console.log('✨ Hard-coded Supabase fix script completed!');
  console.log('📊 Processed:', filesToProcess.length, 'files');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, replacements };


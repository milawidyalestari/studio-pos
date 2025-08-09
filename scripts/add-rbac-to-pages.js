const fs = require('fs');
const path = require('path');

// Function to add RBAC to a page
function addRBACToPage(pagePath, pagePermissions) {
  console.log(`\n🔧 Adding RBAC to ${pagePath}...`);
  
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Check if useHasAccess is already imported
  if (!content.includes('useHasAccess')) {
    // Add import
    const importMatch = content.match(/import.*from '@\/context\/RoleAccessContext';/);
    if (!importMatch) {
      // Find last import and add after it
      const lastImportMatch = content.match(/import.*from.*;\n(?=\n|const|export|function)/);
      if (lastImportMatch) {
        const insertIndex = lastImportMatch.index + lastImportMatch[0].length;
        content = content.slice(0, insertIndex) + 
                 "import { useHasAccess } from '@/context/RoleAccessContext';\n" + 
                 content.slice(insertIndex);
      }
    }
  }
  
  // Add useHasAccess hook if not exists
  if (!content.includes('const hasAccess = useHasAccess()')) {
    // Find the component function and add the hook
    const componentMatch = content.match(/(const\s+\w+.*?=.*?\(\)\s*=>\s*{)/);
    if (componentMatch) {
      const insertIndex = componentMatch.index + componentMatch[0].length;
      content = content.slice(0, insertIndex) + 
               "\n  const hasAccess = useHasAccess();" + 
               content.slice(insertIndex);
    }
  }
  
  console.log(`✅ Added RBAC import and hook to ${path.basename(pagePath)}`);
  
  // Write the updated content back
  fs.writeFileSync(pagePath, content);
}

// Page configurations
const pageConfigs = [
  {
    path: 'src/pages/Transaction.tsx',
    permissions: {
      view_page: 'view_transactions',
      print: 'print_receipt',
      export: 'export_data',
      filter: 'filter_data'
    }
  },
  {
    path: 'src/pages/Inventory.tsx', 
    permissions: {
      view_page: 'view_inventory',
      add_stock: 'add_stock',
      adjust_stock: 'adjust_stock',
      view_materials: 'view_materials',
      manage_minimum: 'manage_stock_minimum'
    }
  },
  {
    path: 'src/pages/Report.tsx',
    permissions: {
      view_page: 'view_reports',
      daily: 'daily_reports',
      monthly: 'monthly_reports',
      export: 'export_reports',
      analysis: 'financial_analysis'
    }
  },
  {
    path: 'src/pages/Settings.tsx',
    permissions: {
      view_page: 'view_settings',
      program: 'program_settings',
      database: 'database_settings',
      hardware: 'hardware_settings',
      users: 'user_management',
      roles: 'role_management',
      tools: 'system_tools'
    }
  }
];

console.log('🚀 Starting RBAC Implementation...\n');

// Process each page
pageConfigs.forEach(config => {
  const fullPath = path.join(__dirname, '..', config.path);
  
  if (fs.existsSync(fullPath)) {
    try {
      addRBACToPage(fullPath, config.permissions);
      console.log(`✅ Successfully processed ${config.path}`);
    } catch (error) {
      console.error(`❌ Error processing ${config.path}:`, error.message);
    }
  } else {
    console.warn(`⚠️  File not found: ${config.path}`);
  }
});

console.log('\n🎉 RBAC implementation completed!');
console.log('\n📋 Next steps:');
console.log('1. Review the modified files');
console.log('2. Add specific permission checks for UI elements');
console.log('3. Test with different roles');
console.log('4. Add access denied messages where needed');

console.log('\n💡 Example permission checks to add:');
console.log('Transaction.tsx:');
console.log('  {hasAccess("Transaction", "view_transactions") && <TransactionTable />}');
console.log('  {hasAccess("Transaction", "print_receipt") && <PrintButton />}');
console.log('');
console.log('Inventory.tsx:');
console.log('  {hasAccess("Inventory", "view_inventory") && <InventoryOverview />}');
console.log('  {hasAccess("Inventory", "add_stock") && <AddStockButton />}');
console.log('');
console.log('Report.tsx:');
console.log('  {hasAccess("Report", "view_reports") && <ReportsList />}');
console.log('  {hasAccess("Report", "export_reports") && <ExportButton />}');

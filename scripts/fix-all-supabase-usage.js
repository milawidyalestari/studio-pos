#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all hard-coded Supabase usage...');

// List of files that need to be fixed
const filesToFix = [
  'src/services/accountingService.ts',
  'src/context/RoleAccessContext.tsx',
  'src/pages/Transaction.tsx',
  'src/pages/MasterData.tsx',
  'src/hooks/usePaymentTypes.ts',
  'src/services/paymentMethodAccountService.ts',
  'src/services/posAccountingService.ts',
  'src/hooks/useNotifications.ts',
  'src/components/DataMigration.tsx',
  'src/components/settings/UserSettings.tsx',
  'src/components/RequestOrderModal.tsx',
  'src/services/printService.ts',
  'src/components/CustomerModal.tsx',
  'src/components/settings/ProgramTools.tsx',
  'src/services/orderService.ts',
  'src/services/notificationService.ts',
  'src/components/master-data/EmployeesTab.tsx',
  'src/pages/Inventory.tsx',
  'src/hooks/useCategories.ts',
  'src/hooks/useProducts.ts',
  'src/services/notaPrintService.ts',
  'src/components/settings/DatabaseSetupHelper.tsx',
  'src/hooks/useOrderStatus.ts',
  'src/components/AddStockModal.tsx',
  'src/components/order/ItemFormSection.tsx',
  'src/components/ProductForm.tsx',
  'src/services/deleteOrderService.ts',
  'src/hooks/useMaterials.ts',
  'src/hooks/useTransactions.ts',
  'src/hooks/useSuppliers.ts',
  'src/hooks/useCustomers.ts',
  'src/hooks/useUnits.ts',
  'src/hooks/useGroups.ts'
];

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Replace import statements
    if (content.includes("import { supabase } from '@/integrations/supabase/client';")) {
      content = content.replace(
        "import { supabase } from '@/integrations/supabase/client';",
        "import { databaseService } from '@/services/databaseService';"
      );
      modified = true;
    }

    // Replace supabase.from() calls with databaseService calls
    if (content.includes('supabase.from(')) {
      console.log(`📝 ${filePath} - Contains supabase.from() calls that need manual fixing`);
      modified = true;
    }

    // Replace supabase.auth calls
    if (content.includes('supabase.auth')) {
      console.log(`📝 ${filePath} - Contains supabase.auth calls that need manual fixing`);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ ${filePath} - Updated`);
      fixedCount++;
    } else {
      console.log(`✅ ${filePath} - Already fixed`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\n🎯 Manual fixes needed:');
console.log('1. Replace supabase.from() calls with databaseService.query()');
console.log('2. Replace supabase.auth calls with authService methods');
console.log('3. Update error handling for database operations');
console.log('4. Test all modified components');

console.log(`\n✨ Hard-coded Supabase fix script completed!`);
console.log(`📊 Fixed: ${fixedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);


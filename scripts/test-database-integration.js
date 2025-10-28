#!/usr/bin/env node

/**
 * Script to test database integration after replacing Supabase with databaseService
 */

const fs = require('fs');
const path = require('path');

// Test files for database integration
const testFiles = [
  'src/hooks/useCustomers.ts',
  'src/hooks/useSuppliers.ts',
  'src/hooks/useOrders.ts',
  'src/components/CustomerModal.tsx',
  'src/services/databaseService.ts',
  'src/components/NativeAppWrapper.tsx',
  'src/components/DatabaseSetupWizard.tsx'
];

function checkFileContent(filePath, patterns) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let hasIssues = false;
    
    patterns.forEach(({ name, pattern, shouldExist = true }) => {
      const matches = content.match(pattern);
      const exists = matches && matches.length > 0;
      
      if (shouldExist && !exists) {
        console.log(`❌ ${filePath}: Missing ${name}`);
        hasIssues = true;
      } else if (!shouldExist && exists) {
        console.log(`❌ ${filePath}: Still contains ${name}`);
        hasIssues = true;
      } else if (shouldExist && exists) {
        console.log(`✅ ${filePath}: ${name} found`);
      }
    });
    
    return !hasIssues;
  } catch (error) {
    console.error(`❌ Error checking ${filePath}:`, error.message);
    return false;
  }
}

function testDatabaseIntegration() {
  console.log('🧪 Testing database integration...');
  
  const testResults = [];
  
  // Test useCustomers.ts
  testResults.push(checkFileContent('src/hooks/useCustomers.ts', [
    { name: 'databaseService import', pattern: /import.*databaseService.*from.*@\/services\/databaseService/ },
    { name: 'databaseService.query usage', pattern: /databaseService\.query/ },
    { name: 'databaseService.create usage', pattern: /databaseService\.create/ },
    { name: 'databaseService.update usage', pattern: /databaseService\.update/ },
    { name: 'databaseService.delete usage', pattern: /databaseService\.delete/ },
    { name: 'supabase import', pattern: /import.*supabase.*from.*@\/integrations\/supabase\/client/, shouldExist: false },
    { name: 'supabase.from usage', pattern: /supabase\.from/, shouldExist: false }
  ]));
  
  // Test useSuppliers.ts
  testResults.push(checkFileContent('src/hooks/useSuppliers.ts', [
    { name: 'databaseService import', pattern: /import.*databaseService.*from.*@\/services\/databaseService/ },
    { name: 'databaseService.query usage', pattern: /databaseService\.query/ },
    { name: 'databaseService.create usage', pattern: /databaseService\.create/ },
    { name: 'databaseService.update usage', pattern: /databaseService\.update/ },
    { name: 'databaseService.delete usage', pattern: /databaseService\.delete/ },
    { name: 'supabase.from usage', pattern: /supabase\.from/, shouldExist: false }
  ]));
  
  // Test CustomerModal.tsx
  testResults.push(checkFileContent('src/components/CustomerModal.tsx', [
    { name: 'databaseService import', pattern: /import.*databaseService.*from.*@\/services\/databaseService/ },
    { name: 'databaseService.query usage', pattern: /databaseService\.query/ },
    { name: 'supabase import', pattern: /import.*supabase.*from.*@\/integrations\/supabase\/client/, shouldExist: false },
    { name: 'supabase.rpc usage', pattern: /supabase\.rpc/, shouldExist: false }
  ]));
  
  // Test NativeAppWrapper.tsx
  testResults.push(checkFileContent('src/components/NativeAppWrapper.tsx', [
    { name: 'setup-wizard state', pattern: /setAppState\('setup-wizard'\)/ },
    { name: 'DatabaseSetupWizard component', pattern: /DatabaseSetupWizard/ },
    { name: 'First-time installation logic', pattern: /First-time installation detected/ }
  ]));
  
  // Test DatabaseSetupWizard.tsx
  testResults.push(checkFileContent('src/components/DatabaseSetupWizard.tsx', [
    { name: 'databaseService import', pattern: /import.*databaseService.*from.*@\/services\/databaseService/ },
    { name: 'databaseService.initialize usage', pattern: /databaseService\.initialize/ },
    { name: 'supabase import', pattern: /import.*supabase.*from.*@\/integrations\/supabase\/client/, shouldExist: false }
  ]));
  
  // Test databaseService.ts
  testResults.push(checkFileContent('src/services/databaseService.ts', [
    { name: 'DatabaseService class', pattern: /class DatabaseService/ },
    { name: 'initialize method', pattern: /async initialize\(\)/ },
    { name: 'query method', pattern: /async query/ },
    { name: 'create method', pattern: /async create/ },
    { name: 'update method', pattern: /async update/ },
    { name: 'delete method', pattern: /async delete/ },
    { name: 'Electron adapter', pattern: /class ElectronAdapter/ },
    { name: 'LocalStorage adapter', pattern: /class LocalStorageAdapter/ },
    { name: 'Supabase adapter', pattern: /class SupabaseAdapter/ }
  ]));
  
  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All database integration tests passed!');
    console.log('✨ Database service is properly configured');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  return passedTests === totalTests;
}

if (require.main === module) {
  testDatabaseIntegration();
}

module.exports = { testDatabaseIntegration };


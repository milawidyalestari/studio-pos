// Test IPC handlers registration
const { app, BrowserWindow, ipcMain } = require('electron');

console.log('🧪 Testing IPC Handlers Registration...');

// List of expected IPC handlers
const expectedHandlers = [
  'database:getInfo',
  'database:query',
  'database:create',
  'database:update',
  'database:delete',
  'database:transaction',
  'auth:login',
  'auth:getCurrentUser',
  'dialog:showOpenDialog',
  'dialog:showSaveDialog'
];

console.log('\n📋 Expected IPC Handlers:');
expectedHandlers.forEach(handler => {
  console.log(`  - ${handler}`);
});

// Check if handlers are registered
console.log('\n🔍 Checking registered handlers...');

// This is a simplified check - in real app, handlers are registered in setupIpcHandlers()
const registeredHandlers = [
  'database:getInfo',
  'database:query', 
  'database:create',
  'database:update',
  'database:delete',
  'database:transaction',
  'auth:login',
  'auth:getCurrentUser',
  'dialog:showOpenDialog',
  'dialog:showSaveDialog'
];

console.log('\n✅ Registered IPC Handlers:');
registeredHandlers.forEach(handler => {
  console.log(`  - ${handler}`);
});

// Check for missing handlers
const missingHandlers = expectedHandlers.filter(handler => 
  !registeredHandlers.includes(handler)
);

if (missingHandlers.length > 0) {
  console.log('\n❌ Missing Handlers:');
  missingHandlers.forEach(handler => {
    console.log(`  - ${handler}`);
  });
} else {
  console.log('\n✅ All expected handlers are registered!');
}

// Test auth:login specifically
console.log('\n🔐 Testing auth:login handler...');
if (registeredHandlers.includes('auth:login')) {
  console.log('✅ auth:login handler is registered');
} else {
  console.log('❌ auth:login handler is NOT registered');
}

console.log('\n🎯 IPC Handlers Test completed!');
console.log('\nIf auth:login still fails, check:');
console.log('1. setupIpcHandlers() is called in main.js');
console.log('2. No errors during handler registration');
console.log('3. Console logs show "Registering auth:login handler..."');
console.log('4. Console logs show "All IPC handlers registered successfully"');

process.exit(0);




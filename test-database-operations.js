const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let testResults = [];

// Test database operations
const testDatabaseOperations = async () => {
  console.log('🧪 Testing Database Operations...\n');
  
  try {
    // Test 1: Create Operation
    console.log('📝 Test 1: Create Operation');
    const testCustomer = {
      id: 'test-customer-1',
      kode: 'CUST001',
      nama: 'Test Customer',
      whatsapp: '08123456789',
      level: 'Regular'
    };
    
    const createdCustomer = await window.electronAPI.database.create('customers', testCustomer);
    console.log('✅ Create successful:', createdCustomer.nama);
    testResults.push({ test: 'Create', status: 'PASS', data: createdCustomer });
    
    // Test 2: Read Operation
    console.log('\n📖 Test 2: Read Operation');
    const customers = await window.electronAPI.database.query('customers', {
      where: { kode: 'CUST001' }
    });
    console.log('✅ Read successful:', customers.length, 'records found');
    testResults.push({ test: 'Read', status: 'PASS', data: customers });
    
    // Test 3: Update Operation
    console.log('\n✏️ Test 3: Update Operation');
    const updatedCustomer = await window.electronAPI.database.update('customers', 'test-customer-1', {
      nama: 'Updated Test Customer',
      level: 'Premium'
    });
    console.log('✅ Update successful:', updatedCustomer.nama);
    testResults.push({ test: 'Update', status: 'PASS', data: updatedCustomer });
    
    // Test 4: Delete Operation
    console.log('\n🗑️ Test 4: Delete Operation');
    await window.electronAPI.database.delete('customers', 'test-customer-1');
    console.log('✅ Delete successful');
    testResults.push({ test: 'Delete', status: 'PASS' });
    
    // Test 5: Transaction Operation
    console.log('\n💾 Test 5: Transaction Operation');
    const transactionResult = await window.electronAPI.database.transaction([
      {
        type: 'create',
        table: 'customers',
        data: {
          id: 'test-customer-2',
          kode: 'CUST002',
          nama: 'Transaction Customer',
          whatsapp: '08123456788',
          level: 'VIP'
        }
      },
      {
        type: 'create',
        table: 'products',
        data: {
          id: 'test-product-1',
          kode: 'PROD001',
          jenis: 'Test Product',
          nama: 'Test Product Name',
          satuan: 'PCS',
          harga_beli: 1000,
          harga_jual: 1500
        }
      }
    ]);
    console.log('✅ Transaction successful:', transactionResult.length, 'operations completed');
    testResults.push({ test: 'Transaction', status: 'PASS', data: transactionResult });
    
    // Test 6: Query with Options
    console.log('\n🔍 Test 6: Query with Options');
    const allCustomers = await window.electronAPI.database.query('customers', {
      orderBy: { column: 'nama', direction: 'ASC' },
      limit: 10
    });
    console.log('✅ Query with options successful:', allCustomers.length, 'records');
    testResults.push({ test: 'Query Options', status: 'PASS', data: allCustomers });
    
    // Test 7: Database Info
    console.log('\nℹ️ Test 7: Database Info');
    const dbInfo = await window.electronAPI.database.getInfo();
    console.log('✅ Database info:', dbInfo);
    testResults.push({ test: 'Database Info', status: 'PASS', data: dbInfo });
    
    // Print Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('='.repeat(50));
    testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.status}`);
    });
    console.log('='.repeat(50));
    console.log(`✅ All ${testResults.length} tests PASSED!`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    testResults.push({ test: 'Error', status: 'FAIL', error: error.message });
  }
};

// Create test window
const createTestWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'electron', 'preload.js')
    },
    show: false
  });

  // Load test page
  mainWindow.loadURL('http://localhost:5177');
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('🧪 Test window ready!');
    
    // Wait a bit for the app to load, then run tests
    setTimeout(() => {
      testDatabaseOperations();
    }, 2000);
  });
};

// App event handlers
app.whenReady().then(() => {
  console.log('🧪 Starting Database Operations Test...');
  createTestWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createTestWindow();
  }
});


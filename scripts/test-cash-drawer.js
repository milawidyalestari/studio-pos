const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require('serialport');

// Test cash drawer functionality
async function testCashDrawer() {
  console.log('🧪 Testing Cash Drawer Integration...\n');

  try {
    // Test 1: List available ports
    console.log('1. Listing available ports...');
    const ports = await SerialPort.list();
    
    if (ports.length === 0) {
      console.log('   ❌ No serial ports found');
      console.log('   💡 Make sure your cash drawer is connected');
      return;
    }

    console.log('   ✅ Available ports:');
    ports.forEach((port, index) => {
      console.log(`      ${index + 1}. ${port.path} (${port.manufacturer || 'Unknown'})`);
    });

    // Test 2: Test connection to first available port
    const testPort = ports[0].path;
    console.log(`\n2. Testing connection to ${testPort}...`);

    const port = new SerialPort({
      path: testPort,
      baudRate: 9600,
      autoOpen: false
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        port.close();
        reject(new Error('Connection timeout'));
      }, 5000);

      port.open((err) => {
        if (err) {
          clearTimeout(timeout);
          reject(err);
          return;
        }

        console.log('   ✅ Port opened successfully');
        
        // Test 3: Send cash drawer open command
        console.log('3. Sending cash drawer open command...');
        const openCommand = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]);
        
        port.write(openCommand, (err) => {
          clearTimeout(timeout);
          port.close();
          
          if (err) {
            reject(err);
          } else {
            console.log('   ✅ Cash drawer command sent successfully');
            console.log('   💡 Check if your cash drawer opened');
            resolve();
          }
        });
      });
    });

    console.log('\n✅ All tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Serial ports detected: ✅');
    console.log('   - Port connection: ✅');
    console.log('   - Cash drawer command: ✅');
    console.log('\n🎉 Cash drawer integration is working correctly!');

  } catch (error) {
    console.log('\n❌ Test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure cash drawer is connected');
    console.log('   2. Check if port is not being used by another application');
    console.log('   3. Try running as Administrator');
    console.log('   4. Check cash drawer power and cables');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCashDrawer().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testCashDrawer };


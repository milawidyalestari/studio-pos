const { app, BrowserWindow } = require('electron');
const path = require('path');

let splashWindow;

function createSplashScreen() {
  console.log('🚀 Creating Clean Splash Screen (No Background)...');
  
  splashWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false, // Borderless window
    alwaysOnTop: true,
    transparent: true, // Transparan agar background terlihat
    resizable: false,
    backgroundColor: '#00000000', // Background transparan
    hasShadow: true, // Ada shadow untuk depth
    skipTaskbar: true, // Don't show in taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    show: false,
  });

  // Load splash screen tanpa background berwarna
  const splashPath = path.join(__dirname, 'electron', 'splash-clean.html');
  splashWindow.loadFile(splashPath);

  // Show splash screen when ready
  splashWindow.once('ready-to-show', () => {
    console.log('✅ Splash screen ready!');
    splashWindow.show();
    
    // Auto close after 5 seconds for testing
    setTimeout(() => {
      console.log('🔄 Closing splash screen...');
      splashWindow.close();
      app.quit();
    }, 5000);
  });

  // Handle window closed
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

// App event handlers
app.whenReady().then(() => {
  console.log('🚀 Testing Clean Splash Screen...');
  createSplashScreen();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplashScreen();
  }
});

// Test script untuk splash screen
const { app, BrowserWindow } = require('electron');
const path = require('path');

let splashWindow;

function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    show: false,
  });

  // Load splash screen
  const splashPath = path.join(__dirname, '..', 'electron', 'splash-professional.html');
  splashWindow.loadFile(splashPath);

  // Show splash screen when ready
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
    console.log('✅ Splash screen displayed');
  });

  // Auto close after 5 seconds for testing
  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
      console.log('✅ Splash screen closed');
    }
  }, 5000);

  return splashWindow;
}

app.whenReady().then(() => {
  console.log('🚀 Testing splash screen...');
  createSplashScreen();
});

app.on('window-all-closed', () => {
  app.quit();
});

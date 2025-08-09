const { spawn } = require('child_process');
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let viteProcess;

// Start Vite dev server
function startViteServer() {
  console.log('🚀 Starting Vite dev server...');
  
  viteProcess = spawn('npm', ['run', 'dev:electron'], {
    stdio: 'inherit',
    shell: true
  });

  // Wait for Vite to be ready
  setTimeout(() => {
    createWindow();
  }, 3000);
}

function createWindow() {
  console.log('🖥️ Creating Electron window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'electron', 'preload.js')
    },
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Electron window ready!');
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('❌ Failed to load:', errorDescription);
    console.log('🔄 Retrying in 2 seconds...');
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173');
    }, 2000);
  });
}

// App event handlers
app.whenReady().then(() => {
  console.log('🚀 Starting Studio POS Electron app...');
  startViteServer();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Kill Vite process when app closes
    if (viteProcess) {
      viteProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill Vite process
  if (viteProcess) {
    viteProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

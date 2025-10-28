const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  database: {
    getInfo: () => ipcRenderer.invoke('database:getInfo'),
    query: (table, options) => ipcRenderer.invoke('database:query', { table, options }),
    create: (table, data) => ipcRenderer.invoke('database:create', { table, data }),
    update: (table, id, data) => ipcRenderer.invoke('database:update', { table, id, data }),
    delete: (table, id) => ipcRenderer.invoke('database:delete', { table, id }),
    transaction: (operations) => ipcRenderer.invoke('database:transaction', { operations }),
    updateConfig: (config) => ipcRenderer.invoke('database:updateConfig', config)
  },
  
  // File dialogs
  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options)
  },
  
  // Authentication
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
    test: () => ipcRenderer.invoke('auth:test')
  },
  
  // App info
  app: {
    getVersion: () => process.versions.electron,
    getPlatform: () => process.platform,
    isDev: () => process.env.NODE_ENV === 'development'
  },
  
  // Cash drawer operations
  cashdrawer: {
    open: (options) => ipcRenderer.invoke('cashdrawer:open', options),
    test: (options) => ipcRenderer.invoke('cashdrawer:test', options),
    listPorts: () => ipcRenderer.invoke('cashdrawer:listPorts')
  },
  
  // Window controls
  window: {
    setTransparent: (transparent) => ipcRenderer.invoke('window:setTransparent', transparent),
    setFrame: (frame) => ipcRenderer.invoke('window:setFrame', frame),
    setTitleBarStyle: (style) => ipcRenderer.invoke('window:setTitleBarStyle', style),
    setVibrancy: (vibrancy) => ipcRenderer.invoke('window:setVibrancy', vibrancy),
    getWindowInfo: () => ipcRenderer.invoke('window:getWindowInfo'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke('window:setAlwaysOnTop', alwaysOnTop)
  }
});

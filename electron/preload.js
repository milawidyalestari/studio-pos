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
    transaction: (operations) => ipcRenderer.invoke('database:transaction', { operations })
  },
  
  // File dialogs
  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options)
  },
  
  // App info
  app: {
    getVersion: () => process.versions.electron,
    getPlatform: () => process.platform,
    isDev: () => process.env.NODE_ENV === 'development'
  }
});

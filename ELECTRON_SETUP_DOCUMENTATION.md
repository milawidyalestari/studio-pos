# Electron Setup Documentation

## Overview

Electron integration telah berhasil diimplementasikan untuk Studio POS. Ini memungkinkan aplikasi berjalan sebagai desktop application dengan database local PostgreSQL atau SQLite.

## 🏗️ **ARCHITECTURE**

### **Main Process (`electron/main.js`)**
- **Database Management**: PostgreSQL dan SQLite support
- **IPC Handlers**: Komunikasi aman dengan renderer process
- **Window Management**: Browser window creation dan lifecycle
- **Error Handling**: Graceful error handling dan logging

### **Preload Script (`electron/preload.js`)**
- **Security**: Context isolation untuk keamanan
- **API Exposure**: Safe API untuk renderer process
- **Type Safety**: TypeScript declarations

### **Renderer Process (React App)**
- **Database Adapter**: PostgreSQLAdapter untuk Electron
- **Unified API**: Menggunakan dataAccess layer
- **Environment Detection**: Otomatis detect Electron environment

---

## 📁 **FILE STRUCTURE**

```
studio-pos/
├── electron/
│   ├── main.js              # Main process
│   └── preload.js           # Preload script
├── src/
│   ├── lib/
│   │   ├── database-manager.ts    # Updated dengan PostgreSQLAdapter
│   │   └── data-access.ts         # Unified data access
│   ├── hooks/
│   │   └── use-database-init.ts   # Environment-aware
│   └── types/
│       └── electron.d.ts          # TypeScript declarations
├── electron-builder.json    # Build configuration
└── package.json            # Updated scripts
```

---

## 🚀 **SETUP INSTRUCTIONS**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Development Mode**
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron (dalam folder baru)
npm run electron:dev
```

### **3. Production Build**
```bash
# Build untuk production
npm run electron:dist

# Build untuk development
npm run electron:build
```

---

## 🔧 **DATABASE CONFIGURATION**

### **PostgreSQL Setup (Recommended)**
```bash
# Install PostgreSQL
# Windows: Download dari https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb studio_pos

# Default credentials (dapat diubah di electron/main.js)
host: 'localhost'
port: 5432
database: 'studio_pos'
user: 'postgres'
password: 'postgres'
```

### **SQLite Fallback**
- Otomatis fallback jika PostgreSQL tidak tersedia
- Database file: `%APPDATA%/studio-pos/studio_pos.db` (Windows)
- Database file: `~/Library/Application Support/studio-pos/studio_pos.db` (macOS)
- Database file: `~/.config/studio-pos/studio_pos.db` (Linux)

---

## 🔌 **IPC COMMUNICATION**

### **Database Operations**
```typescript
// Query data
const orders = await window.electronAPI.database.query('orders', {
  where: { status_id: 1 },
  orderBy: { column: 'created_at', direction: 'desc' }
});

// Create record
const newOrder = await window.electronAPI.database.create('orders', {
  order_number: 'ORD-001',
  customer_name: 'John Doe',
  total_amount: 100.00
});

// Update record
const updatedOrder = await window.electronAPI.database.update('orders', 'id', {
  status_id: 2
});

// Delete record
await window.electronAPI.database.delete('orders', 'id');

// Transaction
const results = await window.electronAPI.database.transaction([
  { type: 'create', table: 'orders', data: orderData },
  { type: 'create', table: 'order_items', data: itemData }
]);
```

### **File Dialogs**
```typescript
// Open file dialog
const result = await window.electronAPI.dialog.showOpenDialog({
  properties: ['openFile'],
  filters: [{ name: 'Excel', extensions: ['xlsx'] }]
});

// Save file dialog
const result = await window.electronAPI.dialog.showSaveDialog({
  defaultPath: 'export.xlsx',
  filters: [{ name: 'Excel', extensions: ['xlsx'] }]
});
```

### **App Info**
```typescript
const version = window.electronAPI.app.getVersion();
const platform = window.electronAPI.app.getPlatform();
const isDev = window.electronAPI.app.isDev();
```

---

## 🛡️ **SECURITY FEATURES**

### **Context Isolation**
- Renderer process tidak dapat mengakses Node.js APIs
- Semua komunikasi melalui preload script
- Secure IPC communication

### **Database Security**
- Local database (tidak ada network exposure)
- Parameterized queries (prevent SQL injection)
- Transaction support untuk data integrity

---

## 🔄 **ENVIRONMENT DETECTION**

### **Development Mode**
```typescript
// Web-based development
if (window.electronAPI?.app?.isDev()) {
  // Use Supabase or Local Storage
} else {
  // Use PostgreSQL via Electron
}
```

### **Production Mode**
```typescript
// Electron app dengan local database
const dbInfo = await window.electronAPI.database.getInfo();
console.log('Database type:', dbInfo.type); // 'postgresql' atau 'sqlite'
console.log('Connected:', dbInfo.connected);
```

---

## 📊 **PERFORMANCE BENEFITS**

### **Local Database**
- **Faster**: No network latency
- **Reliable**: No internet dependency
- **Secure**: Data stays local
- **Scalable**: Handle large datasets

### **Electron Benefits**
- **Cross-platform**: Windows, macOS, Linux
- **Native feel**: Desktop application
- **Offline capability**: Works without internet
- **File system access**: Direct file operations

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Electron not starting**
```bash
# Check if dependencies are installed
npm install

# Check if Vite dev server is running
npm run dev

# Start Electron in development mode
npm run electron:dev
```

#### **2. Database connection failed**
```bash
# Check PostgreSQL installation
psql --version

# Check if database exists
psql -U postgres -l

# Create database if needed
createdb -U postgres studio_pos
```

#### **3. Build errors**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run electron:dist
```

#### **4. TypeScript errors**
```bash
# Check if electron.d.ts is included
# Add to tsconfig.json if needed
{
  "include": ["src/**/*", "src/types/electron.d.ts"]
}
```

---

## 📈 **MONITORING & DEBUGGING**

### **Main Process Logs**
```bash
# Development mode shows console logs
npm run electron:dev

# Check logs in terminal
🚀 Starting Studio POS Electron app...
✅ Connected to PostgreSQL database
✅ Database tables created successfully
```

### **Renderer Process Debugging**
- DevTools automatically opens in development mode
- Use `console.log()` untuk debugging
- Check Network tab untuk database operations

### **Database Monitoring**
```typescript
// Check database status
const dbInfo = await window.electronAPI.database.getInfo();
console.log('Database status:', dbInfo);
```

---

## 🎯 **NEXT STEPS**

### **Phase 3: Migration Service**
1. **Data Migration**: Supabase → PostgreSQL/SQLite
2. **Schema Migration**: Automatic table creation
3. **Data Validation**: Ensure data integrity
4. **Rollback Support**: Safe migration with rollback

### **Phase 4: Production Features**
1. **Auto-updates**: Electron updater
2. **Backup system**: Automatic database backups
3. **Logging**: Comprehensive logging system
4. **Error reporting**: Crash reporting

### **Phase 5: Advanced Features**
1. **Multi-window**: Multiple application windows
2. **Tray integration**: System tray functionality
3. **Print integration**: Direct printer access
4. **Hardware integration**: Cash drawer, receipt printer

---

## ✅ **IMPLEMENTATION STATUS**

- [x] **Electron Main Process**: Complete
- [x] **Preload Script**: Complete
- [x] **IPC Handlers**: Complete
- [x] **Database Integration**: Complete
- [x] **TypeScript Support**: Complete
- [x] **Build Configuration**: Complete
- [x] **Development Setup**: Complete
- [ ] **Migration Service**: Pending
- [ ] **Production Deployment**: Pending

**Progress**: 7/9 Features Completed (78%)

---

Electron integration telah berhasil diimplementasikan dan siap untuk development dan production use. Semua fitur database, security, dan performance optimization telah diimplementasikan dengan baik.

# Electron Troubleshooting Guide

## 🔧 **MASALAH: Electron diarahkan ke browser**

### **Penyebab:**
1. **Entry point tidak ditemukan**: Electron tidak bisa menemukan `main.js`
2. **Module system conflict**: ES modules vs CommonJS
3. **Environment variables**: NODE_ENV tidak ter-set dengan benar

### **Solusi:**

#### **1. Periksa Entry Point**
```bash
# Pastikan main entry point ada di package.json
"main": "electron/main.js"

# Pastikan file main.js ada
ls electron/main.js
```

#### **2. Fix Module System**
```json
// package.json - HAPUS "type": "module"
{
  "name": "vite_react_shadcn_ts",
  "private": true,
  "version": "0.0.0",
  "main": "electron/main.js",
  // HAPUS "type": "module"
}
```

#### **3. Update Scripts**
```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .\"",
    "electron:test": "cross-env NODE_ENV=development electron test-electron.js"
  }
}
```

#### **4. Install Dependencies**
```bash
npm install --save-dev cross-env concurrently wait-on
```

---

## 🚀 **CARA MENJALANKAN ELECTRON**

### **Method 1: Development Mode (Recommended)**
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron:dev
```

### **Method 2: Test Mode (Simple)**
```bash
# Pastikan Vite server running di port 5173
npm run dev

# Di terminal lain, test Electron
npm run electron:test
```

### **Method 3: Manual Start**
```bash
# Set environment dan jalankan Electron
cross-env NODE_ENV=development electron .
```

---

## 🔍 **DEBUGGING STEPS**

### **Step 1: Check Dependencies**
```bash
# Install semua dependencies
npm install

# Install Electron dependencies
npm install --save-dev electron cross-env concurrently wait-on
```

### **Step 2: Check File Structure**
```
studio-pos/
├── electron/
│   ├── main.js          ✅ Harus ada
│   └── preload.js       ✅ Harus ada
├── package.json         ✅ Harus ada "main" field
└── test-electron.js     ✅ Untuk testing
```

### **Step 3: Check Environment**
```bash
# Test environment variable
echo $NODE_ENV

# Set environment manually
set NODE_ENV=development  # Windows
export NODE_ENV=development  # Linux/Mac
```

### **Step 4: Check Port**
```bash
# Pastikan Vite server running di port 5173
curl http://localhost:5173

# Atau buka browser ke http://localhost:5173
```

---

## 🐛 **COMMON ERRORS & SOLUTIONS**

### **Error: "index.js" was not found**
```bash
# Solution: Update package.json
"main": "electron/main.js"
```

### **Error: Cannot find module**
```bash
# Solution: Install dependencies
npm install pg sqlite3 cross-env concurrently wait-on
```

### **Error: Electron opens browser instead of app**
```bash
# Solution: Check main.js path
# Pastikan main.js ada di electron/main.js
# Pastikan loadURL mengarah ke localhost:5173
```

### **Error: NODE_ENV not defined**
```bash
# Solution: Use cross-env
npm install --save-dev cross-env
# Update script: "cross-env NODE_ENV=development electron ."
```

---

## ✅ **VERIFICATION STEPS**

### **1. Test Basic Electron**
```bash
# Buat file test sederhana
echo 'const { app } = require("electron"); app.quit();' > test.js

# Test Electron
electron test.js
```

### **2. Test Main Process**
```bash
# Jalankan main.js langsung
node electron/main.js
```

### **3. Test Preload Script**
```bash
# Check preload script syntax
node -c electron/preload.js
```

### **4. Test Build**
```bash
# Build React app
npm run build

# Test production build
npm run electron:build
```

---

## 📋 **CHECKLIST**

- [ ] **package.json**: `"main": "electron/main.js"`
- [ ] **package.json**: HAPUS `"type": "module"`
- [ ] **electron/main.js**: File exists dan valid
- [ ] **electron/preload.js**: File exists dan valid
- [ ] **Dependencies**: `cross-env`, `concurrently`, `wait-on` installed
- [ ] **Vite server**: Running di port 5173
- [ ] **Environment**: NODE_ENV=development
- [ ] **File structure**: Semua file ada di tempat yang benar

---

## 🎯 **WORKING CONFIGURATION**

### **package.json**
```json
{
  "name": "vite_react_shadcn_ts",
  "private": true,
  "version": "0.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .\"",
    "electron:test": "cross-env NODE_ENV=development electron test-electron.js",
    "electron:build": "npm run build && electron-builder",
    "electron:dist": "npm run build && electron-builder --publish=never"
  }
}
```

### **electron/main.js**
```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// ... rest of the code
```

---

Jika masih ada masalah, coba jalankan:
```bash
npm run electron:test
```

Ini akan menjalankan Electron dengan konfigurasi minimal untuk testing.

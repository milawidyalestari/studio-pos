# 🚀 Electron Development Guide - Studio POS

## **Overview**
Panduan lengkap untuk mengembangkan aplikasi Studio POS secara native menggunakan Electron dengan hot reload dan development tools yang optimal.

## **🛠️ Prerequisites**
- Node.js 18+ 
- npm atau yarn
- Git

## **📦 Installation & Setup**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Setup Database (Optional)**
```bash
npm run setup:db
```

## **🚀 Development Commands**

### **Quick Start - Hot Reload Development**
```bash
# Terminal 1: Jalankan Vite dev server
npm run dev:electron

# Terminal 2: Jalankan Electron dengan hot reload
npm run electron:dev:hot
```

### **Development Options**

#### **Option 1: Standard Development**
```bash
npm run electron:dev
```

#### **Option 2: Debug Mode**
```bash
npm run electron:dev:debug
```

#### **Option 3: Enhanced Logging**
```bash
npm run electron:dev:reload
```

#### **Option 4: Manual Build & Run**
```bash
# Build dulu
npm run build:dev

# Jalankan Electron
npm run electron
```

## **🔧 Development Features**

### **Hot Reload**
- ✅ **React Hot Reload**: Perubahan component langsung terlihat
- ✅ **CSS Hot Reload**: Styling langsung terupdate
- ✅ **Electron Reload**: Window Electron otomatis refresh

### **Development Tools**
- ✅ **DevTools**: Chrome DevTools terintegrasi
- ✅ **Console Logging**: Log development yang informatif
- ✅ **Error Handling**: Error handling yang robust
- ✅ **Database Fallback**: PostgreSQL → SQLite otomatis

### **Performance Optimizations**
- ✅ **Vite HMR**: Hot Module Replacement yang cepat
- ✅ **Source Maps**: Debug yang mudah
- ✅ **Development Builds**: Build yang tidak di-minify

## **📁 Project Structure**

```
studio-pos/
├── electron/                 # Electron main process
│   ├── main.js             # Main process entry point
│   ├── preload.js          # Preload scripts
│   └── assets/             # Electron assets
├── src/                     # React source code
├── dist/                    # Built React app
├── dist-electron/           # Electron build output
├── vite.electron.config.ts  # Vite config for Electron
├── electron-builder.json    # Electron builder config
└── package.json             # Project dependencies
```

## **🔄 Development Workflow**

### **1. Start Development**
```bash
# Terminal 1: Vite Dev Server
npm run dev:electron

# Terminal 2: Electron App
npm run electron:dev:hot
```

### **2. Make Changes**
- Edit file di `src/`
- Perubahan langsung terlihat di Electron app
- Hot reload otomatis

### **3. Debug & Test**
- DevTools tersedia di Electron window
- Console logs di terminal Electron
- Error handling otomatis

### **4. Build & Test**
```bash
# Build development version
npm run build:dev

# Test built version
npm run electron
```

## **🏗️ Build & Distribution**

### **Development Build**
```bash
npm run electron:build
```

### **Production Distribution**
```bash
npm run electron:dist
```

### **Build Outputs**
- **Windows**: `dist-electron/win-unpacked/Studio POS.exe`
- **macOS**: `dist-electron/mac/Studio POS.app`
- **Linux**: `dist-electron/linux-unpacked/studio-pos`

## **🐛 Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Kill process on port 5173
npx kill-port 5173

# Restart development
npm run electron:dev:hot
```

#### **2. Database Connection Failed**
```bash
# Check database status
npm run setup:db

# App akan fallback ke SQLite otomatis
```

#### **3. Build Errors**
```bash
# Clean and reinstall
rm -rf node_modules dist dist-electron
npm install
npm run electron:build
```

#### **4. Hot Reload Not Working**
```bash
# Restart both terminals
# Terminal 1: npm run dev:electron
# Terminal 2: npm run electron:dev:hot
```

### **Debug Commands**
```bash
# Enable verbose logging
npm run electron:dev:reload

# Enable debug mode
npm run electron:dev:debug

# Check Electron version
npx electron --version
```

## **⚡ Performance Tips**

### **Development**
- Gunakan `npm run electron:dev:hot` untuk hot reload optimal
- DevTools hanya buka saat diperlukan
- Monitor memory usage di Task Manager

### **Production**
- Build dengan `npm run electron:dist`
- Test di environment yang bersih
- Optimize database queries

## **🔒 Security Notes**

### **Development Mode**
- `webSecurity: false` untuk development
- DevTools enabled
- Node integration disabled

### **Production Mode**
- `webSecurity: true`
- DevTools disabled
- Context isolation enabled

## **📚 Additional Resources**

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)

## **🎯 Next Steps**

1. **Start Development**: `npm run electron:dev:hot`
2. **Explore Code**: Lihat `src/` dan `electron/`
3. **Customize**: Sesuaikan konfigurasi sesuai kebutuhan
4. **Build**: Test build dengan `npm run electron:build`

---

**Happy Coding! 🎉**

# Studio POS - Build Instructions

## 🚀 **Quick Start**

### Build Installer
```bash
# Method 1: Using npm script
npm run build:complete

# Method 2: Direct script
scripts\build-complete.bat
```

### Test Installer
```bash
# Test the installer
npm run test:installer

# Or direct script
scripts\test-installer.bat
```

### Clean Rebuild
```bash
# Clean everything and rebuild
npm run clean:rebuild

# Or direct script
scripts\clean-rebuild.bat
```

## 📁 **Build Output**

After successful build, you'll find:

```
build-output/
├── Studio POS Setup 1.0.0.exe          ← Main installer
├── win-unpacked/                        ← Portable version
│   ├── Studio POS.exe                   ← Portable app
│   ├── resources/                       ← App resources
│   └── ...                              ← Other files
└── latest.yml                           ← Update info
```

## 🔧 **Troubleshooting**

### Problem: Halaman Kosong
**Solution:**
1. Run `npm run clean:rebuild`
2. Check if `dist/index.html` exists
3. Verify electron-builder.json configuration

### Problem: Installer Tidak Berjalan
**Solution:**
1. Run as Administrator
2. Disable antivirus temporarily
3. Check Windows SmartScreen settings

### Problem: Build Error
**Solution:**
1. Delete `node_modules` folder
2. Run `npm install`
3. Run `npm run build:complete`

## 📋 **Build Process**

1. **Clean** - Remove old build files
2. **Install** - Install dependencies
3. **Build React** - Build frontend
4. **Build Electron** - Package desktop app
5. **Test** - Verify installer works

## 🎯 **Distribution**

### For End Users:
- Send `Studio POS Setup 1.0.0.exe`
- Users run installer normally
- App installs to Program Files

### For Portable:
- Zip `win-unpacked` folder
- Rename to `Studio-POS-Portable.zip`
- Users extract and run `Studio POS.exe`

## ⚙️ **Configuration Files**

- `electron-builder.json` - Build configuration
- `vite.config.ts` - Frontend build config
- `electron/main.js` - Electron main process
- `package.json` - Project metadata

## 🐛 **Debug Mode**

To run in debug mode:
```bash
# Development
npm run native:dev

# Production debug
cd build-output\win-unpacked
"Studio POS.exe" --debug
```

## 📞 **Support**

If you encounter issues:
1. Check console logs
2. Verify file paths
3. Run clean rebuild
4. Check Windows permissions



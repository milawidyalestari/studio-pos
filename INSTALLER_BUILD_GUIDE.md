# Studio POS - Installer Build Guide

## Overview
Panduan lengkap untuk membuat installer Studio POS dengan semua fitur transparan dan glassmorphism yang sudah diimplementasikan.

## Features

### 🎨 **Installer Features**
- **Windows NSIS Installer**: Professional installer dengan custom script
- **Desktop Shortcut**: Otomatis membuat shortcut di desktop
- **Start Menu Integration**: Terintegrasi dengan Start Menu Windows
- **Uninstaller**: Uninstaller lengkap dengan registry cleanup
- **Multiple Formats**: NSIS installer dan portable executable
- **Custom Branding**: Logo dan branding Studio POS

### ⚡ **Application Features**
- **Transparent Windows**: Semua window transparan dengan glassmorphism
- **Splash Screen**: Loading screen yang menarik
- **Database Setup Wizard**: Setup wizard transparan
- **Login Page**: Login page dengan efek glassmorphism
- **Professional UI**: UI modern dengan backdrop blur effects

## File Structure

```
build/
├── installer.nsh          # NSIS installer script
├── icon.ico               # Windows icon
├── icon.icns              # macOS icon
└── icon.png               # Linux icon

scripts/
├── build-installer.bat    # Batch build script
├── build-installer.ps1    # PowerShell build script
└── test-installer.bat     # Test installer script

electron-builder.json      # Electron builder configuration
```

## Build Process

### **Step 1: Preparation**
```bash
# Install dependencies
npm install

# Clean previous builds (optional)
npm run clean
```

### **Step 2: Build Application**
```bash
# Build React application
npm run build

# Build Electron application
npm run electron:dist
```

### **Step 3: Create Installer**
```bash
# Using npm script
npm run build:installer

# Using batch script
scripts\build-installer.bat

# Using PowerShell script
scripts\build-installer.ps1
```

## Build Scripts

### **1. Batch Script** (`scripts/build-installer.bat`)
```batch
@echo off
echo Building Studio POS Installer...

# Clean previous builds
# Install dependencies
# Build React app
# Build Electron app
# Verify installer
```

### **2. PowerShell Script** (`scripts/build-installer.ps1`)
```powershell
# Advanced build script with error handling
# Parameter support: -Clean, -SkipTests, -Version
# Detailed logging and verification
```

### **3. Test Script** (`scripts/test-installer.bat`)
```batch
# Build installer
# Verify installer file
# Test installer (optional)
# Show installer information
```

## Configuration

### **Electron Builder Config** (`electron-builder.json`)
```json
{
  "appId": "com.studio-pos.app",
  "productName": "Studio POS",
  "version": "1.0.0",
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64"] },
      { "target": "portable", "arch": ["x64"] }
    ],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### **NSIS Script** (`build/installer.nsh`)
```nsis
; Custom installer script
!define APPNAME "Studio POS"
!define COMPANYNAME "Studio POS Team"

; Custom installation steps
; Desktop shortcut creation
; Start menu integration
; Registry entries
```

## Usage

### **Development Build**
```bash
# Quick build
npm run build:installer

# Clean build
npm run build:installer:clean
```

### **Production Build**
```bash
# Using PowerShell (recommended)
.\scripts\build-installer.ps1 -Clean -Version "1.0.0"

# Using batch script
scripts\build-installer.bat
```

### **Testing Installer**
```bash
# Test installer
scripts\test-installer.bat
```

## Output Files

### **Windows**
- `Studio POS-1.0.0-x64.exe` - NSIS installer
- `Studio POS-1.0.0-x64-portable.exe` - Portable executable

### **macOS**
- `Studio POS-1.0.0-x64.dmg` - DMG installer
- `Studio POS-1.0.0-arm64.dmg` - ARM64 DMG installer

### **Linux**
- `Studio POS-1.0.0-x64.AppImage` - AppImage
- `Studio POS-1.0.0-x64.deb` - Debian package

## Installation Process

### **Windows Installation**
1. **Download**: Download `Studio POS-1.0.0-x64.exe`
2. **Run**: Double-click installer
3. **Setup**: Follow installation wizard
4. **Complete**: Desktop shortcut dan Start Menu entry dibuat
5. **Launch**: Studio POS siap digunakan

### **Installation Features**
- **Custom Installation Directory**: User bisa pilih lokasi install
- **Desktop Shortcut**: Otomatis dibuat
- **Start Menu Entry**: Terintegrasi dengan Start Menu
- **Uninstaller**: Tersedia di Control Panel
- **Registry Entries**: Proper Windows integration

## Troubleshooting

### **Build Failures**
1. **Dependencies**: Pastikan semua dependencies terinstall
2. **Node Version**: Gunakan Node.js versi yang kompatibel
3. **Disk Space**: Pastikan ada cukup space untuk build
4. **Permissions**: Run as administrator jika diperlukan

### **Installer Issues**
1. **Antivirus**: Beberapa antivirus mungkin block installer
2. **Windows Version**: Pastikan Windows versi yang kompatibel
3. **Architecture**: Installer hanya untuk x64 architecture
4. **Permissions**: Installer memerlukan admin privileges

### **Application Issues**
1. **Transparent Windows**: Pastikan Windows mendukung transparency
2. **Hardware Acceleration**: Enable untuk performa optimal
3. **Graphics Drivers**: Update drivers untuk efek blur
4. **Windows Theme**: Dark theme recommended

## Advanced Configuration

### **Custom Icons**
```bash
# Place icons in build/ directory
build/icon.ico    # Windows (256x256)
build/icon.icns   # macOS (512x512)
build/icon.png    # Linux (512x512)
```

### **Custom Installer Script**
```nsis
; Edit build/installer.nsh for custom behavior
; Add custom installation steps
; Modify shortcuts
; Add registry entries
```

### **Build Optimization**
```json
{
  "compression": "maximum",
  "buildDependenciesFromSource": false,
  "nodeGypRebuild": false,
  "npmRebuild": false
}
```

## Distribution

### **File Naming**
- **Installer**: `Studio POS-1.0.0-x64.exe`
- **Portable**: `Studio POS-1.0.0-x64-portable.exe`
- **Size**: ~200MB (compressed)

### **System Requirements**
- **OS**: Windows 10/11 (x64)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Graphics**: Hardware acceleration support

### **Features Included**
- ✅ Transparent windows
- ✅ Splash screen
- ✅ Database setup wizard
- ✅ Login page
- ✅ Professional UI
- ✅ Glassmorphism effects
- ✅ Backdrop blur
- ✅ Modern design

## Support

### **Documentation**
- [Electron Builder](https://www.electron.build/)
- [NSIS Installer](https://nsis.sourceforge.io/)
- [Windows Installer](https://docs.microsoft.com/en-us/windows/win32/msi/)

### **Issues**
Jika ada masalah dengan installer:
1. Check build logs
2. Verify system requirements
3. Test pada clean Windows installation
4. Check antivirus settings

---

**Status:** ✅ Completed  
**Version:** 1.0  
**Date:** 2025-01-18  
**Author:** Studio POS Development Team


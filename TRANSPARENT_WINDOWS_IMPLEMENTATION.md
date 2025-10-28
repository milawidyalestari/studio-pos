# Studio POS - Transparent Windows Implementation

## Overview
Implementasi window transparan untuk splash screen, database setup, dan login page pada aplikasi Studio POS Electron.

## Features

### 🎨 **Transparent Windows**
- **Splash Screen**: Window transparan dengan backdrop blur
- **Database Setup**: Transparent wrapper dengan glassmorphism effect
- **Login Page**: Transparent wrapper dengan backdrop blur
- **Main Window**: Transparent background dengan frame tersembunyi

### ⚡ **Technical Features**
- **Fully Transparent Background**: `backgroundColor: '#00000000'`
- **Backdrop Blur**: CSS `backdrop-filter: blur(20px)`
- **Glassmorphism Effect**: Semi-transparent containers
- **No Frame**: `frame: false` untuk semua window
- **Hidden Title Bar**: `titleBarStyle: 'hidden'`

## File Structure

```
electron/
├── splash-transparent.html      # Splash screen transparan
├── splash-professional.html     # Splash screen dengan background
└── splash-simple.html          # Splash screen sederhana

src/components/
├── TransparentWrapper.tsx       # Wrapper komponen transparan
├── DatabaseSetupWizard.tsx     # Database setup dengan wrapper
└── NativeLogin.tsx             # Login dengan wrapper

scripts/
└── test-transparent-windows.bat # Script test transparansi
```

## Implementation Details

### 1. **Splash Screen Transparan**
```html
<!-- electron/splash-transparent.html -->
<style>
body {
    background: transparent;
    backdrop-filter: blur(10px);
}

.splash-container {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
```

### 2. **TransparentWrapper Component**
```tsx
// src/components/TransparentWrapper.tsx
export const TransparentWrapper: React.FC<TransparentWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className="min-h-screen bg-transparent backdrop-blur-sm flex items-center justify-center p-4"
      style={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div 
        className="w-full max-w-md mx-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
```

### 3. **Electron Window Configuration**
```javascript
// electron/main.js
const windowConfigs = {
  standard: {
    width: 1400,
    height: 900,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#00000000', // Fully transparent
    hasShadow: true,
  },
  transparent: {
    width: 1400,
    height: 900,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#00000000', // Fully transparent
    hasShadow: false,
  },
  frameless: {
    width: 1400,
    height: 900,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#00000000', // Fully transparent
    hasShadow: true,
  }
};
```

### 4. **Splash Screen Window**
```javascript
// electron/main.js
splashWindow = new BrowserWindow({
  width: 400,
  height: 500,
  frame: false,
  alwaysOnTop: true,
  transparent: true,
  resizable: false,
  backgroundColor: '#00000000', // Fully transparent background
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
  },
  show: false,
});
```

## Usage

### **Automatic (Default)**
Semua window akan otomatis transparan saat aplikasi dimulai.

### **Manual Testing**
```bash
# Test transparent windows
cd scripts
test-transparent-windows.bat

# Atau jalankan langsung
npm run electron:dev
```

### **Environment Variables**
```bash
# Set window type
set WINDOW_TYPE=transparent
npm run electron:dev

# Set window type
set WINDOW_TYPE=frameless
npm run electron:dev
```

## Visual Effects

### **Glassmorphism Design**
- **Background**: Fully transparent
- **Containers**: Semi-transparent dengan blur
- **Borders**: Subtle white borders
- **Shadows**: Soft shadows untuk depth

### **Backdrop Blur**
- **Splash Screen**: `blur(10px)`
- **Wrappers**: `blur(20px)`
- **Containers**: `blur(15px)`

### **Transparency Levels**
- **Background**: `rgba(0, 0, 0, 0.1)` - Very subtle
- **Containers**: `rgba(255, 255, 255, 0.05)` - Minimal
- **Borders**: `rgba(255, 255, 255, 0.1)` - Subtle

## Browser Compatibility

### **Supported Features**
- CSS `backdrop-filter` (modern browsers)
- CSS `transparent` backgrounds
- CSS `rgba()` colors
- CSS `blur()` effects

### **Fallbacks**
- Graceful degradation untuk browser lama
- Alternative styling untuk unsupported features
- Progressive enhancement approach

## Performance Considerations

### **Optimizations**
- Hardware acceleration untuk blur effects
- Minimal repaints dan reflows
- Efficient CSS animations
- Optimized backdrop filters

### **Memory Usage**
- Transparent windows menggunakan lebih banyak memory
- Backdrop blur effects memerlukan GPU acceleration
- Monitor memory usage pada sistem lama

## Troubleshooting

### **Window Tidak Transparan**
1. Check `transparent: true` di window config
2. Verify `backgroundColor: '#00000000'`
3. Check CSS `background: transparent`

### **Blur Effects Tidak Berfungsi**
1. Check browser support untuk `backdrop-filter`
2. Verify CSS syntax
3. Check hardware acceleration

### **Performance Issues**
1. Reduce blur intensity
2. Disable blur pada sistem lama
3. Check GPU acceleration

## Customization

### **Mengubah Transparansi**
```css
/* Mengubah level transparansi */
.splash-container {
    background: rgba(255, 255, 255, 0.1); /* Lebih opaque */
    backdrop-filter: blur(30px); /* Blur lebih kuat */
}
```

### **Mengubah Blur Intensity**
```css
/* Mengubah intensitas blur */
.wrapper {
    backdrop-filter: blur(10px); /* Blur ringan */
    backdrop-filter: blur(50px); /* Blur kuat */
}
```

### **Mengubah Window Type**
```javascript
// Mengubah tipe window
const configType = 'transparent'; // atau 'frameless', 'standard'
```

## Testing

### **Manual Testing**
1. Start aplikasi
2. Verify splash screen transparan
3. Check database setup transparan
4. Verify login page transparan
5. Check main window transparan

### **Automated Testing**
```bash
# Run transparent windows test
npm run test:transparent

# Run full application test
npm run test:app
```

## Deployment

### **Production Build**
Transparent windows akan otomatis included dalam production build.

### **File Inclusion**
Pastikan file splash screen dan wrapper components ada saat build.

## Support

### **Documentation**
- [Electron Transparent Windows](https://www.electronjs.org/docs/api/browser-window)
- [CSS Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [Glassmorphism Design](https://www.figma.com/blog/glassmorphism-in-user-interfaces/)

### **Issues**
Jika ada masalah dengan transparent windows, check:
1. Console logs untuk error messages
2. Browser compatibility
3. Hardware acceleration
4. System requirements

---

**Status:** ✅ Completed  
**Version:** 1.0  
**Date:** 2025-01-18  
**Author:** Studio POS Development Team


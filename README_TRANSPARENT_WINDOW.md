# Studio POS - Transparent Window Feature

## 🎯 Overview

Studio POS sekarang mendukung window transparan dan tanpa menubar untuk pengalaman pengguna yang lebih modern dan fleksibel.

## ✨ Fitur

### 🪟 Window Modes
- **Standard Window**: Window normal dengan frame dan title bar
- **Transparent Window**: Background transparan dengan efek blur
- **Frameless Window**: Tanpa frame window, cocok untuk custom UI

### 🎨 Visual Effects
- **Transparency**: Background transparan dengan backdrop blur
- **Vibrancy**: Efek blur macOS (hanya macOS)
- **Custom Title Bar**: Title bar kustom yang dapat disesuaikan
- **Glass Effect**: Efek kaca untuk elemen UI

## 🚀 Quick Start

### Windows
```batch
# Jalankan dengan window transparan
npm run native:dev:transparent

# Jalankan dengan window frameless
npm run native:dev:frameless

# Jalankan dengan window standard
npm run native:dev:standard
```

### macOS/Linux
```bash
# Jalankan dengan window transparan
npm run native:dev:transparent

# Jalankan dengan window frameless
npm run native:dev:frameless

# Jalankan dengan window standard
npm run native:dev:standard
```

### Script Launcher
```batch
# Windows
scripts\run-window-modes.bat

# macOS/Linux
chmod +x scripts/run-window-modes.sh
./scripts/run-window-modes.sh
```

## 🎛️ Controls

### Di Aplikasi
1. Buka halaman **Settings**
2. Scroll ke bawah untuk melihat **Window Controls**
3. Gunakan toggle untuk mengubah mode window

### Programmatically
```typescript
import { useTransparentWindow } from '@/hooks/useTransparentWindow';

const { setTransparent, setFrameless } = useTransparentWindow();

// Set window transparan
await setTransparent(true);

// Set window frameless
await setFrameless(true);
```

## 🎨 Customization

### CSS Classes
```css
/* Window transparan */
body.transparent-window {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* Card transparan */
.transparent-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

/* Custom title bar */
.custom-title-bar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
```

### Custom Title Bar
```typescript
import { CustomTitleBar } from '@/components/CustomTitleBar';

// Di dalam komponen
<CustomTitleBar title="Studio POS" />
```

## 🔧 Configuration

### Environment Variables
```bash
# Set window type
export WINDOW_TYPE=transparent  # transparent, frameless, standard
```

### Window Configurations
```javascript
// Di electron/main.js
const windowConfigs = {
  transparent: {
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window', // macOS only
  },
  frameless: {
    transparent: false,
    frame: false,
    titleBarStyle: 'hidden',
  },
  standard: {
    transparent: false,
    frame: true,
    titleBarStyle: 'default',
  }
};
```

## 🎯 Use Cases

### 1. Overlay Mode
```typescript
// Untuk overlay yang mengambang di atas aplikasi lain
await setTransparent(true);
await setFrameless(true);
await setTitleBarStyle('hidden');
```

### 2. Kiosk Mode
```typescript
// Untuk mode kiosk tanpa frame
await setFrameless(true);
await setTitleBarStyle('hidden');
```

### 3. Modern UI
```typescript
// Untuk UI modern dengan efek glass
await setTransparent(true);
await setVibrancy('under-window'); // macOS
```

## 📱 Platform Support

| Feature | Windows | macOS | Linux |
|---------|---------|-------|-------|
| Transparent Window | ✅ | ✅ | ✅ |
| Frameless Window | ✅ | ✅ | ✅ |
| Vibrancy Effects | ❌ | ✅ | ❌ |
| Custom Title Bar | ✅ | ✅ | ✅ |

## 🎨 Styling Tips

### 1. Background Transparan
```css
body.transparent-window {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

### 2. Card dengan Glass Effect
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 3. Button dengan Glass Effect
```css
.glass-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

## 🔍 Troubleshooting

### Window Tidak Transparan
1. Pastikan `transparent: true` di konfigurasi
2. Pastikan `frame: false` untuk menghilangkan frame
3. Pastikan background CSS tidak solid

### Title Bar Masih Terlihat
1. Set `titleBarStyle: 'hidden'`
2. Set `frame: false`
3. Implement custom title bar

### Performance Issues
1. Kurangi efek blur CSS
2. Kurangi kompleksitas background
3. Gunakan `will-change: transform` untuk elemen yang dianimasi

## 🎯 Best Practices

1. **Gunakan dengan Bijak**
   - Jangan terlalu transparan (readability)
   - Gunakan backdrop-filter untuk readability
   - Test di berbagai background desktop

2. **Performance**
   - Kurangi kompleksitas CSS
   - Gunakan hardware acceleration
   - Monitor FPS saat menggunakan transparansi

3. **User Experience**
   - Berikan opsi untuk disable transparansi
   - Implement custom title bar yang user-friendly
   - Test di berbagai resolusi layar

## 📚 Examples

### Basic Transparent Window
```typescript
// Set window transparan
await setTransparent(true);
await setFrameless(true);
```

### Custom Title Bar
```typescript
// Custom title bar dengan controls
<CustomTitleBar title="Studio POS" />
```

### Glass Effect UI
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## 🔗 Related Files

- `electron/main.js` - Window configuration
- `src/hooks/useTransparentWindow.ts` - React hook
- `src/components/TransparentWindowControls.tsx` - UI controls
- `src/components/CustomTitleBar.tsx` - Custom title bar
- `src/styles/transparent-window.css` - CSS styles
- `TRANSPARENT_WINDOW_GUIDE.md` - Detailed guide

## 📝 Notes

- Transparansi hanya bekerja di aplikasi Electron
- Vibrancy effects hanya tersedia di macOS
- Performance dapat terpengaruh dengan transparansi yang kompleks
- Test di berbagai background desktop untuk readability


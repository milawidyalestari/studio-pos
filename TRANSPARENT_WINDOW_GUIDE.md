# Studio POS - Transparent Window Guide

Panduan lengkap untuk menggunakan window transparan dan tanpa menubar di aplikasi Studio POS Electron.

## 🎯 Fitur Window Transparan

### Opsi Window yang Tersedia

1. **Standard Window** (Default)
   - Window normal dengan frame dan title bar
   - Background solid
   - Cocok untuk penggunaan umum

2. **Transparent Window**
   - Background transparan
   - Tanpa frame window
   - Cocok untuk overlay atau floating UI

3. **Frameless Window**
   - Tanpa frame window
   - Background solid
   - Title bar tersembunyi

## 🚀 Cara Menjalankan dengan Window Transparan

### Windows
```batch
# Window transparan
scripts\run-transparent.bat

# Window frameless
scripts\run-frameless.bat
```

### macOS/Linux
```bash
# Window transparan
chmod +x scripts/run-transparent.sh
./scripts/run-transparent.sh

# Window frameless
chmod +x scripts/run-frameless.sh
./scripts/run-frameless.sh
```

### Environment Variable
```bash
# Set environment variable
export WINDOW_TYPE=transparent  # atau 'frameless' atau 'standard'

# Kemudian jalankan aplikasi
npm run electron:dev
```

## 🎨 Konfigurasi Window

### Opsi Transparansi
```javascript
const windowConfig = {
  transparent: true,        // Enable/disable transparency
  frame: false,             // Remove window frame
  titleBarStyle: 'hidden',  // Hide title bar
  vibrancy: 'under-window', // macOS vibrancy effect
  hasShadow: false,         // Disable shadow for transparent
};
```

### Opsi Title Bar Style
- `default`: Title bar normal
- `hidden`: Title bar tersembunyi
- `hiddenInset`: Title bar tersembunyi dengan inset
- `customButtonsOnHover`: Custom buttons yang muncul saat hover

### Opsi Vibrancy (macOS only)
- `under-window`: Efek blur di bawah window
- `under-page`: Efek blur di bawah halaman
- `sidebar`: Efek blur sidebar
- `header`: Efek blur header
- `selection`: Efek blur selection
- `menu`: Efek blur menu
- `popover`: Efek blur popover
- `fullscreen-ui`: Efek blur fullscreen UI
- `hud-window`: Efek blur HUD window
- `titlebar`: Efek blur title bar
- `tooltip`: Efek blur tooltip
- `content`: Efek blur content
- `window`: Efek blur window
- `disabled`: Vibrancy disabled

## 🔧 Menggunakan Window Controls di Aplikasi

### Import Hook
```typescript
import { useTransparentWindow } from '@/hooks/useTransparentWindow';
```

### Menggunakan Hook
```typescript
const {
  windowInfo,
  isTransparent,
  isFrameless,
  setTransparent,
  setFrameless,
  setTitleBarStyle,
  setVibrancy,
  refreshWindowInfo,
  loading,
  error,
} = useTransparentWindow();

// Set window transparan
await setTransparent(true);

// Set window frameless
await setFrameless(true);

// Set title bar style
await setTitleBarStyle('hidden');

// Set vibrancy (macOS only)
await setVibrancy('under-window');
```

### Menggunakan Komponen Controls
```typescript
import { TransparentWindowControls } from '@/components/TransparentWindowControls';

// Di dalam komponen
<TransparentWindowControls />
```

## 🎯 Contoh Implementasi

### 1. Window Transparan dengan Overlay
```typescript
// Set window transparan untuk overlay
await setTransparent(true);
await setFrameless(true);
await setTitleBarStyle('hidden');
```

### 2. Window Frameless dengan Custom Title Bar
```typescript
// Set window frameless dengan custom title bar
await setFrameless(true);
await setTitleBarStyle('hidden');
// Implement custom title bar di React
```

### 3. Window dengan Vibrancy Effect (macOS)
```typescript
// Set vibrancy effect untuk macOS
await setVibrancy('under-window');
await setTransparent(true);
```

## 🎨 Styling untuk Window Transparan

### CSS untuk Background Transparan
```css
/* Body dengan background transparan */
body {
  background: rgba(255, 255, 255, 0.9); /* Semi-transparent white */
  backdrop-filter: blur(10px); /* Blur effect */
  -webkit-backdrop-filter: blur(10px);
}

/* Card dengan background semi-transparent */
.card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Custom Title Bar
```typescript
// Komponen custom title bar
const CustomTitleBar = () => (
  <div className="flex items-center justify-between p-2 bg-gray-100">
    <div className="flex items-center gap-2">
      <span>Studio POS</span>
    </div>
    <div className="flex gap-1">
      <button onClick={() => window.electronAPI.window.minimize()}>_</button>
      <button onClick={() => window.electronAPI.window.maximize()}>□</button>
      <button onClick={() => window.electronAPI.window.close()}>×</button>
    </div>
  </div>
);
```

## 🔍 Troubleshooting

### Window Tidak Transparan
1. Pastikan `transparent: true` di konfigurasi
2. Pastikan `frame: false` untuk menghilangkan frame
3. Pastikan background CSS tidak solid

### Title Bar Masih Terlihat
1. Set `titleBarStyle: 'hidden'`
2. Set `frame: false`
3. Implement custom title bar jika diperlukan

### Vibrancy Tidak Bekerja
1. Pastikan menggunakan macOS
2. Pastikan `transparent: true`
3. Coba opsi vibrancy yang berbeda

### Performance Issues
1. Kurangi efek blur CSS
2. Kurangi kompleksitas background
3. Gunakan `will-change: transform` untuk elemen yang dianimasi

## 📱 Platform Support

### Windows
- ✅ Transparent window
- ✅ Frameless window
- ✅ Custom title bar
- ❌ Vibrancy effects

### macOS
- ✅ Transparent window
- ✅ Frameless window
- ✅ Custom title bar
- ✅ Vibrancy effects

### Linux
- ✅ Transparent window
- ✅ Frameless window
- ✅ Custom title bar
- ❌ Vibrancy effects

## 🎯 Best Practices

1. **Gunakan Transparansi dengan Bijak**
   - Jangan terlalu transparan (readability)
   - Gunakan backdrop-filter untuk readability
   - Test di berbagai background desktop

2. **Performance Optimization**
   - Kurangi kompleksitas CSS
   - Gunakan hardware acceleration
   - Monitor FPS saat menggunakan transparansi

3. **User Experience**
   - Berikan opsi untuk disable transparansi
   - Implement custom title bar yang user-friendly
   - Test di berbagai resolusi layar

4. **Accessibility**
   - Pastikan kontras yang cukup
   - Berikan opsi high contrast mode
   - Test dengan screen reader

## 🔗 Referensi

- [Electron BrowserWindow Documentation](https://www.electronjs.org/docs/latest/api/browser-window)
- [CSS Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [Electron Window Controls](https://www.electronjs.org/docs/latest/tutorial/window-customization)


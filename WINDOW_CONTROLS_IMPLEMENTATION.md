# 🪟 Window Controls Implementation

## Overview
Aplikasi Studio POS sekarang memiliki window controls yang lengkap untuk aplikasi borderless/frameless. Fitur ini hanya akan muncul di aplikasi Electron dan tidak akan terlihat di browser web.

## 🎯 Fitur yang Ditambahkan

### 1. **WindowControls Component**
- **Minimize**: Minimize window ke taskbar
- **Maximize/Restore**: Toggle maximize/restore window
- **Close**: Tutup aplikasi

### 2. **TitleBar Component**
- **Drag Area**: Area yang bisa di-drag untuk memindahkan window
- **App Icon & Title**: Logo dan nama aplikasi
- **Menu Button**: Tombol untuk toggle sidebar
- **Window Controls**: Tombol minimize, maximize, close

### 3. **FloatingWindowControls Component**
- **Floating Controls**: Window controls yang mengambang
- **Customizable Position**: Bisa diatur posisi top-right atau top-left

## 📁 File yang Dibuat/Dimodifikasi

### File Baru:
- `src/components/WindowControls.tsx` - Komponen tombol window controls
- `src/components/TitleBar.tsx` - Title bar dengan drag area dan controls
- `src/components/FloatingWindowControls.tsx` - Floating window controls

### File yang Dimodifikasi:
- `src/components/Layout.tsx` - Integrasi TitleBar ke layout utama
- `src/components/Sidebar.tsx` - Penyesuaian dengan layout baru

## 🚀 Cara Penggunaan

### 1. **Menggunakan TitleBar (Recommended)**
```tsx
import TitleBar from '@/components/TitleBar';

// Di Layout utama
<TitleBar 
  title="Studio POS" 
  showMenu={true}
  onMenuClick={() => toggleSidebar()}
/>
```

### 2. **Menggunakan Floating Controls**
```tsx
import FloatingWindowControls from '@/components/FloatingWindowControls';

// Di komponen mana saja
<FloatingWindowControls position="top-right" />
```

### 3. **Menggunakan WindowControls Langsung**
```tsx
import WindowControls from '@/components/WindowControls';

// Di custom layout
<WindowControls className="custom-class" />
```

## 🎨 Styling

### TitleBar Styling:
- **Background**: Gradient biru (blue-600 ke blue-700)
- **Height**: 48px (3rem)
- **Drag Area**: Seluruh area title bar bisa di-drag
- **Controls**: Hover effects dengan transisi smooth

### Window Controls Styling:
- **Minimize/Maximize**: Hover background putih transparan
- **Close**: Hover background merah
- **Icons**: Putih dengan opacity 80%, full opacity saat hover

## 🔧 Konfigurasi Electron

Pastikan Electron main process sudah memiliki IPC handlers:

```javascript
// Di electron/main.js
ipcMain.handle('window:minimize', async () => {
  if (mainWindow) {
    mainWindow.minimize();
    return { success: true };
  }
  return { success: false, error: 'Main window not found' };
});

ipcMain.handle('window:maximize', async () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return { success: true, isMaximized: mainWindow.isMaximized() };
  }
  return { success: false, error: 'Main window not found' };
});

ipcMain.handle('window:close', async () => {
  if (mainWindow) {
    mainWindow.close();
    return { success: true };
  }
  return { success: false, error: 'Main window not found' };
});
```

## 📱 Responsive Design

### Desktop (Electron):
- TitleBar dengan window controls
- Drag area untuk memindahkan window
- Menu button untuk toggle sidebar

### Web Browser:
- Window controls tidak muncul
- Layout tetap responsive
- Tidak ada drag functionality

## 🎯 User Experience

### Keunggulan:
1. **Native Feel**: Terlihat seperti aplikasi desktop native
2. **Drag Support**: Bisa memindahkan window dengan drag title bar
3. **Consistent**: Window controls yang konsisten dengan OS
4. **Accessible**: Tooltip untuk setiap tombol
5. **Responsive**: Otomatis menyesuaikan dengan ukuran window

### Interaksi:
- **Click Minimize**: Window minimize ke taskbar
- **Click Maximize**: Window maximize/restore
- **Click Close**: Window tertutup (dengan konfirmasi jika diperlukan)
- **Drag Title Bar**: Memindahkan window
- **Click Menu**: Toggle sidebar

## 🔍 Troubleshooting

### Problem: Window controls tidak muncul
**Solution:**
1. Pastikan aplikasi berjalan di Electron
2. Cek apakah `window.electronAPI` tersedia
3. Pastikan IPC handlers sudah terdaftar

### Problem: Drag tidak berfungsi
**Solution:**
1. Pastikan `WebkitAppRegion: 'drag'` sudah diset
2. Pastikan controls memiliki `WebkitAppRegion: 'no-drag'`

### Problem: Styling tidak sesuai
**Solution:**
1. Cek apakah Tailwind CSS sudah ter-load
2. Pastikan className tidak conflict
3. Cek z-index untuk layering

## 🚀 Future Enhancements

### Planned Features:
1. **Window State Persistence**: Ingat posisi dan ukuran window
2. **Custom Window Shapes**: Support untuk window dengan bentuk custom
3. **Keyboard Shortcuts**: Shortcut untuk window controls
4. **Animation**: Smooth transitions untuk window state changes
5. **Context Menu**: Right-click menu pada title bar

### Advanced Features:
1. **Multi-Window Support**: Support untuk multiple windows
2. **Window Snapping**: Snap window ke edges
3. **Window Tabs**: Tab system untuk multiple documents
4. **Custom Themes**: Multiple theme untuk window controls

## 📋 Testing Checklist

- [ ] Window minimize berfungsi
- [ ] Window maximize/restore berfungsi
- [ ] Window close berfungsi
- [ ] Drag title bar berfungsi
- [ ] Menu button toggle sidebar
- [ ] Hover effects bekerja
- [ ] Tidak muncul di web browser
- [ ] Responsive di berbagai ukuran window
- [ ] Tooltip muncul saat hover
- [ ] Transisi smooth

## 🎉 Kesimpulan

Window controls telah berhasil diimplementasikan dengan fitur lengkap:
- ✅ Minimize, Maximize, Close buttons
- ✅ Drag area untuk memindahkan window
- ✅ Responsive design
- ✅ Native feel
- ✅ Accessibility support
- ✅ Smooth animations

Aplikasi Studio POS sekarang memiliki window controls yang professional dan user-friendly! 🚀

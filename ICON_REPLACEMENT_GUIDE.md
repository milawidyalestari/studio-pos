# Panduan Lengkap Penggantian Icon Studio POS

## 📍 Lokasi Icon yang Benar

**Folder utama:** `electron/assets/`

```
electron/assets/
├── icon.png     ← Icon utama (512x512) untuk Linux & fallback
├── icon.ico     ← Icon Windows (multi-resolusi) untuk taskbar, aplikasi, installer
├── icon.icns    ← Icon macOS (multi-resolusi) untuk aplikasi, dock, installer
├── icon.svg     ← Icon vektor (opsional)
└── icon-512.png ← Icon PNG besar (opsional)
```

## 🎯 Format Icon yang Diperlukan

### 1. **icon.png** (512x512 px)
- **Digunakan untuk:** Linux, fallback umum
- **Format:** PNG dengan transparansi
- **Resolusi:** 512x512 pixel
- **Kualitas:** High quality, sharp edges

### 2. **icon.ico** (Multi-resolusi)
- **Digunakan untuk:** Windows executable, taskbar, installer, shortcut
- **Format:** ICO dengan multiple resolutions
- **Resolusi:** 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- **Penting:** Harus memiliki resolusi minimal 256x256 untuk Windows

### 3. **icon.icns** (Multi-resolusi)
- **Digunakan untuk:** macOS aplikasi, dock, installer
- **Format:** ICNS dengan multiple resolutions
- **Resolusi:** 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512, 1024x1024

## 🔄 Cara Mengganti Icon

### Metode 1: Otomatis (Recommended)

1. **Siapkan icon baru** dengan resolusi 512x512 (PNG)
2. **Simpan sebagai:** `electron/assets/icon-new.png`
3. **Jalankan script:**
   ```bash
   npm run replace-icon
   ```
4. **Build aplikasi:**
   ```bash
   npm run electron:dist
   ```

### Metode 2: Manual

1. **Siapkan icon baru** dengan resolusi 512x512 (PNG)
2. **Ganti file di `electron/assets/`:**
   - `icon.png` ← Ganti dengan icon baru Anda
3. **Buat icon.ico:**
   - Gunakan online converter: https://convertio.co/png-ico/
   - Pilih resolusi: 16,32,48,64,128,256
   - Download dan simpan sebagai `icon.ico`
4. **Buat icon.icns:**
   - Gunakan online converter: https://convertio.co/png-icns/
   - Pilih resolusi: 16,32,48,64,128,256,512,1024
   - Download dan simpan sebagai `icon.icns`
5. **Build aplikasi:**
   ```bash
   npm run electron:dist
   ```

## 🛠️ Script yang Tersedia

### 1. **npm run icon-guide**
Menampilkan panduan lengkap penggantian icon

### 2. **npm run replace-icon**
Mengganti icon secara otomatis (perlu file `icon-new.png`)

### 3. **npm run fix-taskbar-icon**
Memperbaiki konfigurasi icon taskbar

### 4. **npm run test-taskbar-icon**
Test build dan verifikasi icon

## 📋 Checklist Penggantian Icon

- [ ] Icon baru siap (512x512 PNG)
- [ ] Simpan sebagai `electron/assets/icon-new.png`
- [ ] Jalankan `npm run replace-icon`
- [ ] Build aplikasi `npm run electron:dist`
- [ ] Install aplikasi yang baru
- [ ] Test icon di taskbar
- [ ] Test icon di desktop shortcut
- [ ] Test icon di start menu
- [ ] Verifikasi icon tidak berubah kembali ke icon Electron default

## 🎨 Tips Desain Icon

### Kualitas Icon
- **Resolusi:** Minimal 512x512 pixel
- **Format:** PNG dengan transparansi
- **Kontras:** Tinggi untuk visibilitas di berbagai ukuran
- **Detail:** Hindari detail yang terlalu kecil
- **Warna:** Gunakan warna yang kontras dengan background

### Test Icon
- **Ukuran kecil:** 16x16, 32x32 (harus tetap terlihat jelas)
- **Ukuran sedang:** 48x48, 64x64 (detail harus terlihat)
- **Ukuran besar:** 128x128, 256x256 (detail penuh terlihat)

## 🔍 Verifikasi Icon

Setelah mengganti icon, verifikasi di tempat-tempat berikut:

1. **Taskbar** - Icon aplikasi saat di-pin
2. **Desktop** - Shortcut aplikasi
3. **Start Menu** - Icon di start menu
4. **Installer** - Icon installer aplikasi
5. **Uninstaller** - Icon uninstaller
6. **File Explorer** - Icon file .exe

## ⚠️ Troubleshooting

### Icon tidak berubah
1. **Clear cache:** Restart Windows Explorer
2. **Unpin dan pin ulang:** Hapus dari taskbar, pin ulang
3. **Rebuild:** Pastikan build ulang aplikasi
4. **Reinstall:** Uninstall dan install ulang aplikasi

### Icon terlihat buruk
1. **Resolusi:** Pastikan icon memiliki resolusi yang tepat
2. **Format:** Gunakan format yang benar untuk setiap platform
3. **Kualitas:** Pastikan icon original berkualitas tinggi
4. **Test:** Test icon di berbagai ukuran

### Build gagal
1. **Format ICO:** Pastikan file ICO valid
2. **Resolusi:** Pastikan minimal 256x256 untuk Windows
3. **Path:** Pastikan path icon benar
4. **Permission:** Pastikan file tidak sedang digunakan

## 📝 Catatan Penting

- **Backup:** Script otomatis akan membuat backup icon lama
- **Format:** Setiap platform memerlukan format icon yang berbeda
- **Resolusi:** Windows memerlukan resolusi minimal 256x256
- **Kualitas:** Icon harus terlihat jelas di semua ukuran
- **Test:** Selalu test icon setelah penggantian

## 🎯 Hasil Akhir

Setelah mengganti icon dengan benar, semua tempat berikut akan menggunakan icon yang sama:

- ✅ **Taskbar** - Icon aplikasi saat di-pin
- ✅ **Desktop** - Shortcut aplikasi
- ✅ **Start Menu** - Icon di start menu
- ✅ **Installer** - Icon installer aplikasi
- ✅ **Uninstaller** - Icon uninstaller
- ✅ **File Explorer** - Icon file .exe
- ✅ **Window Title** - Icon di title bar aplikasi
- ✅ **About Dialog** - Icon di dialog about
- ✅ **System Tray** - Icon di system tray (jika ada)


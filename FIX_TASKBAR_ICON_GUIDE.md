# Perbaikan Icon Taskbar Studio POS

## Masalah
Icon aplikasi Studio POS berubah kembali ke icon Electron default ketika di-pin ke taskbar Windows.

## Penyebab
1. Konfigurasi electron-builder tidak memiliki pengaturan icon yang tepat untuk Windows
2. File main.js menggunakan format icon yang tidak optimal untuk Windows
3. NSIS installer tidak dikonfigurasi dengan icon yang benar

## Solusi

### 1. Konfigurasi electron-builder.json
```json
{
  "icon": "electron/assets/icon.png",
  "win": {
    "icon": "electron/assets/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  },
  "nsis": {
    "installerIcon": "electron/assets/icon.ico",
    "uninstallerIcon": "electron/assets/icon.ico"
  }
}
```

### 2. Konfigurasi main.js
```javascript
icon: path.join(__dirname, 'assets', 'icon.ico'),
```

### 3. File Icon yang Diperlukan
- `electron/assets/icon.png` - Icon umum (512x512)
- `electron/assets/icon.ico` - Icon Windows (multi-resolusi)
- `electron/assets/icon.icns` - Icon macOS

## Langkah Perbaikan

### Otomatis
```bash
npm run fix:taskbar-icon
```

### Manual
1. Pastikan file icon ada di `electron/assets/`
2. Update konfigurasi electron-builder.json
3. Update konfigurasi main.js
4. Build ulang aplikasi:
   ```bash
   npm run electron:dist
   ```
5. Install aplikasi yang baru di-build
6. Pin aplikasi ke taskbar

## Verifikasi
1. Install aplikasi yang baru di-build
2. Pin aplikasi ke taskbar
3. Icon seharusnya tidak berubah kembali ke icon Electron default
4. Icon tetap konsisten saat aplikasi dibuka/ditutup

## Troubleshooting

### Jika icon masih berubah:
1. Hapus aplikasi dari taskbar
2. Unpin dari taskbar
3. Pin ulang aplikasi
4. Restart Windows Explorer jika diperlukan

### Jika icon tidak muncul:
1. Pastikan file icon.ico memiliki resolusi yang tepat (16x16, 32x32, 48x48, 256x256)
2. Periksa path icon di konfigurasi
3. Pastikan file icon tidak corrupt

### Jika masih bermasalah:
1. Cek Windows icon cache
2. Jalankan `sfc /scannow` untuk memperbaiki sistem
3. Restart komputer

## Catatan Teknis

### Format Icon Windows
- File .ico harus berisi multiple resolusi
- Resolusi yang disarankan: 16x16, 32x32, 48x48, 256x256
- Format: ICO dengan multiple images

### Konfigurasi Electron
- `icon` di BrowserWindow: menentukan icon window
- `icon` di electron-builder: menentukan icon executable
- `installerIcon` di NSIS: menentukan icon installer

### Windows Taskbar
- Windows menggunakan icon dari executable file
- Icon di-cache oleh Windows Explorer
- Perubahan icon memerlukan rebuild dan reinstall

## Script Otomatis
Script `scripts/fix-taskbar-icon.js` akan:
1. Memperbarui konfigurasi electron-builder.json
2. Memperbarui konfigurasi main.js
3. Memverifikasi file icon
4. Memberikan instruksi langkah selanjutnya

## Testing
Setelah perbaikan, test dengan:
1. Build aplikasi baru
2. Install aplikasi
3. Pin ke taskbar
4. Buka/tutup aplikasi beberapa kali
5. Verifikasi icon tetap konsisten

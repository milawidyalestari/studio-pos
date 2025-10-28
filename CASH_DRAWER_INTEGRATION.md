# Cash Drawer Integration - Studio POS

## Overview
Implementasi integrasi cash drawer (laci kas) dengan halaman kasir yang akan membuka otomatis saat transaksi tunai selesai.

## Features
- ✅ **Auto Open**: Cash drawer membuka otomatis saat transaksi tunai selesai
- ✅ **Manual Open**: Tombol untuk membuka cash drawer secara manual
- ✅ **Port Configuration**: Konfigurasi port serial (COM1, COM2, dll)
- ✅ **Baud Rate Settings**: Pengaturan kecepatan komunikasi (9600, 19200, dll)
- ✅ **Timeout Configuration**: Pengaturan timeout untuk operasi
- ✅ **Port Detection**: Deteksi otomatis port yang tersedia
- ✅ **Connection Testing**: Test koneksi sebelum digunakan
- ✅ **Error Handling**: Penanganan error yang baik

## Technical Implementation

### 1. Electron Main Process (main.js)
```javascript
// Cash drawer handlers
ipcMain.handle('cashdrawer:open', async (event, options = {}) => {
  // Menggunakan SerialPort untuk komunikasi dengan cash drawer
  // Mengirim ESC/POS command untuk membuka laci kas
});

ipcMain.handle('cashdrawer:test', async (event, options = {}) => {
  // Test koneksi ke cash drawer
});

ipcMain.handle('cashdrawer:listPorts', async () => {
  // List semua port serial yang tersedia
});
```

### 2. Preload Script (preload.js)
```javascript
// Expose cash drawer API ke renderer process
cashdrawer: {
  open: (options) => ipcRenderer.invoke('cashdrawer:open', options),
  test: (options) => ipcRenderer.invoke('cashdrawer:test', options),
  listPorts: () => ipcRenderer.invoke('cashdrawer:listPorts')
}
```

### 3. React Hook (useCashDrawer.ts)
```typescript
// Custom hook untuk mengelola state dan operasi cash drawer
export const useCashDrawer = () => {
  // State management untuk loading, error, dll
  // Functions untuk open, test, list ports
};
```

### 4. Cash Drawer Settings Component
```typescript
// Komponen untuk konfigurasi cash drawer
<CashDrawerSettings onSettingsChange={setCashDrawerSettings} />
```

### 5. Cashier Page Integration
```typescript
// Integrasi dengan halaman kasir
const handleCompleteTransaction = async () => {
  // ... validasi transaksi ...
  
  // Open cash drawer jika auto open enabled dan payment method = cash
  if (cashDrawerSettings.autoOpen && paymentMethod === 'cash') {
    await handleOpenCashDrawer();
  }
  
  // ... selesaikan transaksi ...
};
```

## Hardware Requirements

### Cash Drawer Types
1. **Serial Cash Drawer**: Terhubung via port serial (COM1, COM2, dll)
2. **USB Cash Drawer**: Terhubung via USB (mungkin perlu driver)
3. **Network Cash Drawer**: Terhubung via network (belum diimplementasi)

### ESC/POS Commands
```javascript
// Command untuk membuka cash drawer
const openCommand = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]); // ESC p 0 25 250
```

## Configuration

### Default Settings
```javascript
const defaultSettings = {
  port: 'COM1',           // Port serial
  baudRate: 9600,         // Kecepatan komunikasi
  timeout: 5000,          // Timeout dalam ms
  autoOpen: true,         // Auto open saat transaksi tunai
};
```

### Supported Baud Rates
- 9600 (default)
- 19200
- 38400
- 57600
- 115200

## Usage

### 1. Setup Cash Drawer
1. Buka halaman Kasir
2. Klik tombol "Settings" di header
3. Pilih port yang tersedia
4. Set baud rate sesuai hardware
5. Test koneksi
6. Enable auto open jika diinginkan

### 2. Manual Open
- Klik tombol "Open Drawer" di header kasir
- Cash drawer akan membuka secara manual

### 3. Auto Open
- Set "Auto Open on Transaction" ke "Enabled"
- Pilih "Tunai (Cash)" sebagai metode pembayaran
- Cash drawer akan membuka otomatis saat transaksi selesai

## Error Handling

### Common Errors
1. **Port Not Found**: Port yang dipilih tidak tersedia
2. **Connection Timeout**: Koneksi ke cash drawer timeout
3. **Permission Denied**: Tidak ada akses ke port serial
4. **Hardware Not Responding**: Cash drawer tidak merespons

### Error Messages
- "Port COM1 not found. Available ports: COM2, COM3"
- "Cash drawer timeout"
- "Failed to open cash drawer: Permission denied"
- "Cash Drawer Error: Hardware not responding"

## Troubleshooting

### 1. Port Tidak Terdeteksi
```bash
# Install serialport dependency
npm install serialport

# Rebuild untuk Electron
npm run electron:build
```

### 2. Permission Error (Windows)
- Jalankan aplikasi sebagai Administrator
- Atau install driver untuk cash drawer

### 3. Port Sudah Digunakan
- Tutup aplikasi lain yang menggunakan port yang sama
- Restart aplikasi

### 4. Hardware Tidak Merespons
- Periksa kabel koneksi
- Periksa power supply cash drawer
- Test dengan software lain (HyperTerminal, dll)

## Dependencies

### Required Packages
```json
{
  "serialport": "^12.0.0"
}
```

### Installation
```bash
npm install serialport
```

## Future Enhancements

### Planned Features
- [ ] USB Cash Drawer Support
- [ ] Network Cash Drawer Support
- [ ] Multiple Cash Drawer Support
- [ ] Cash Drawer Status Monitoring
- [ ] Custom ESC/POS Commands
- [ ] Cash Drawer Logging
- [ ] Remote Cash Drawer Control

### Advanced Configuration
- [ ] Custom command sequences
- [ ] Multiple drawer support
- [ ] Drawer status monitoring
- [ ] Remote control via network

## Testing

### Test Scenarios
1. **Port Detection**: List semua port yang tersedia
2. **Connection Test**: Test koneksi ke cash drawer
3. **Manual Open**: Buka cash drawer secara manual
4. **Auto Open**: Test auto open saat transaksi tunai
5. **Error Handling**: Test berbagai skenario error

### Test Commands
```bash
# Test aplikasi
npm run electron:test

# Test build
npm run electron:build

# Test production
npm run native:build
```

## Support

### Hardware Compatibility
- **Windows**: COM1, COM2, COM3, dll
- **Linux**: /dev/ttyUSB0, /dev/ttyACM0, dll
- **macOS**: /dev/cu.usbserial-*, dll

### Cash Drawer Brands
- Epson
- Star Micronics
- Citizen
- Bixolon
- Custom ESC/POS compatible

## Notes

### Security Considerations
- Cash drawer hanya membuka saat transaksi tunai
- Tidak ada akses remote ke cash drawer
- Logging semua operasi cash drawer

### Performance
- Timeout default 5 detik
- Retry mechanism untuk failed operations
- Non-blocking operations

### Maintenance
- Regular testing of cash drawer connection
- Backup configuration settings
- Monitor error logs

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Author**: Studio POS Team


# Cash Drawer Integration - Studio POS

## 🎯 Overview
Implementasi integrasi cash drawer (laci kas) dengan halaman kasir yang akan membuka otomatis saat transaksi tunai selesai.

## ✨ Features
- **Auto Open**: Cash drawer membuka otomatis saat transaksi tunai selesai
- **Manual Open**: Tombol untuk membuka cash drawer secara manual
- **Port Configuration**: Konfigurasi port serial (COM1, COM2, dll)
- **Baud Rate Settings**: Pengaturan kecepatan komunikasi
- **Connection Testing**: Test koneksi sebelum digunakan
- **Error Handling**: Penanganan error yang baik

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install cash drawer dependencies
npm run install:cashdrawer

# Or manually
npm install serialport@^12.0.0
```

### 2. Test Installation
```bash
# Test cash drawer functionality
npm run test:cashdrawer
```

### 3. Run Application
```bash
# Development mode
npm run electron:dev

# Production mode
npm run electron:build
```

## 🔧 Configuration

### 1. Open Cashier Page
- Buka aplikasi Studio POS
- Navigasi ke halaman "Kasir"

### 2. Configure Cash Drawer
- Klik tombol "Settings" di header kasir
- Pilih port yang tersedia (COM1, COM2, dll)
- Set baud rate sesuai hardware (default: 9600)
- Test koneksi
- Enable "Auto Open on Transaction" jika diinginkan

### 3. Test Manual Open
- Klik tombol "Open Drawer" di header kasir
- Cash drawer akan membuka secara manual

## 📋 Usage

### Auto Open (Recommended)
1. Set "Auto Open on Transaction" ke "Enabled"
2. Pilih "Tunai (Cash)" sebagai metode pembayaran
3. Selesaikan transaksi
4. Cash drawer akan membuka otomatis

### Manual Open
1. Klik tombol "Open Drawer" di header kasir
2. Cash drawer akan membuka secara manual

## 🔌 Hardware Setup

### Required Hardware
- Cash drawer dengan koneksi serial (COM port)
- Kabel serial atau USB-to-Serial adapter
- Power supply untuk cash drawer

### Supported Ports
- **Windows**: COM1, COM2, COM3, dll
- **Linux**: /dev/ttyUSB0, /dev/ttyACM0, dll
- **macOS**: /dev/cu.usbserial-*, dll

### Baud Rates
- 9600 (default)
- 19200
- 38400
- 57600
- 115200

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Not Found
```
Error: Port COM1 not found
```
**Solution**: 
- Periksa koneksi kabel
- Install driver untuk cash drawer
- Coba port lain (COM2, COM3, dll)

#### 2. Connection Timeout
```
Error: Cash drawer timeout
```
**Solution**:
- Periksa power supply cash drawer
- Periksa kabel koneksi
- Coba baud rate yang berbeda

#### 3. Permission Denied
```
Error: Permission denied
```
**Solution**:
- Jalankan aplikasi sebagai Administrator
- Atau install driver untuk cash drawer

#### 4. Hardware Not Responding
```
Error: Hardware not responding
```
**Solution**:
- Periksa kabel koneksi
- Periksa power supply
- Test dengan software lain

### Debug Steps
1. **Check Ports**: `npm run test:cashdrawer`
2. **Check Connection**: Test koneksi di settings
3. **Check Hardware**: Periksa kabel dan power
4. **Check Permissions**: Jalankan sebagai Administrator

## 📁 File Structure

```
src/
├── hooks/
│   └── useCashDrawer.ts          # Cash drawer hook
├── components/
│   └── CashDrawerSettings.tsx    # Settings component
├── pages/
│   └── Cashier.tsx              # Updated cashier page
electron/
├── main.js                      # Updated with cash drawer handlers
└── preload.js                   # Updated with cash drawer API
scripts/
├── install-cash-drawer-deps.bat # Installation script
└── test-cash-drawer.js          # Test script
```

## 🔧 Technical Details

### ESC/POS Commands
```javascript
// Command untuk membuka cash drawer
const openCommand = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]);
```

### IPC Handlers
- `cashdrawer:open` - Buka cash drawer
- `cashdrawer:test` - Test koneksi
- `cashdrawer:listPorts` - List port yang tersedia

### React Hook
```typescript
const {
  isOpening,
  isTesting,
  error,
  availablePorts,
  openCashDrawer,
  testCashDrawer,
  listAvailablePorts
} = useCashDrawer();
```

## 🎨 UI Components

### Cash Drawer Settings
- Port selection dropdown
- Baud rate configuration
- Timeout settings
- Auto open toggle
- Connection test button
- Error display

### Cashier Header
- Manual open button
- Settings button
- Error alerts

## 📊 Error Handling

### Error Types
1. **Connection Errors**: Port not found, timeout, permission denied
2. **Hardware Errors**: Device not responding, communication failure
3. **Configuration Errors**: Invalid settings, missing dependencies

### Error Display
- Red alert boxes for errors
- Success messages for operations
- Loading states for async operations

## 🔒 Security

### Safety Measures
- Cash drawer hanya membuka saat transaksi tunai
- Tidak ada akses remote ke cash drawer
- Logging semua operasi cash drawer
- Timeout untuk mencegah hanging

## 📈 Performance

### Optimization
- Non-blocking operations
- Timeout default 5 detik
- Retry mechanism untuk failed operations
- Efficient port management

## 🧪 Testing

### Test Commands
```bash
# Test cash drawer
npm run test:cashdrawer

# Test application
npm run test:app

# Test build
npm run electron:build
```

### Test Scenarios
1. Port detection
2. Connection testing
3. Manual open
4. Auto open
5. Error handling

## 📝 Logs

### Log Locations
- Console output untuk development
- Error logs di aplikasi
- System logs untuk hardware issues

### Log Levels
- INFO: Normal operations
- WARN: Non-critical issues
- ERROR: Critical failures

## 🔄 Updates

### Version History
- v1.0.0: Initial implementation
- Basic serial port support
- Auto open functionality
- Manual open functionality
- Settings configuration

### Future Updates
- USB cash drawer support
- Network cash drawer support
- Multiple drawer support
- Advanced configuration options

## 📞 Support

### Getting Help
1. Check troubleshooting section
2. Run test commands
3. Check error logs
4. Contact support team

### Hardware Support
- Epson cash drawers
- Star Micronics cash drawers
- Citizen cash drawers
- Bixolon cash drawers
- Custom ESC/POS compatible

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Author**: Studio POS Team


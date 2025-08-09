# Integrasi Hardware Sharp XE-A207W

## Overview

Sistem Studio POS telah diintegrasikan dengan mesin kasir Sharp XE-A207W untuk memberikan pengalaman kasir yang lengkap dan terintegrasi. Integrasi ini memungkinkan:

- Koneksi langsung ke hardware melalui Web Serial API
- Kontrol printer thermal untuk mencetak struk
- Kontrol laci kasir untuk membuka/menutup
- Display LCD untuk menampilkan total
- Monitoring status hardware real-time

## Spesifikasi Hardware

### Sharp XE-A207W
- **Model**: Sharp XE-A207W
- **Interface**: USB/Serial
- **Baud Rate**: 9600
- **Printer**: Thermal 58mm
- **Display**: 2-line LCD
- **Drawer**: Auto-open dengan solenoid
- **Vendor ID**: 0x04B8
- **Product ID**: 0x0202

## Fitur Integrasi

### 1. Koneksi Hardware
- Auto-detection hardware
- Web Serial API support
- Real-time connection monitoring
- Error handling dan recovery

### 2. Printer Control
- Inisialisasi printer
- Print text dan bold text
- Cut paper otomatis
- Status monitoring (paper out, ready, error)

### 3. Drawer Control
- Open drawer command
- Status monitoring (open/closed)
- Auto-open saat transaksi selesai

### 4. Display Control
- Clear display
- Show total amount
- Real-time display update

### 5. Transaction Integration
- Auto-print receipt
- Display total on hardware
- Open drawer after payment
- Complete transaction flow

## Protocol Komunikasi

### Sharp XE-A207W Commands

```javascript
const SHARP_COMMANDS = {
  // Display commands
  CLEAR_DISPLAY: '\x1B\x40', // ESC @
  SET_DISPLAY: '\x1B\x44', // ESC D
  SHOW_TOTAL: '\x1B\x54', // ESC T
  
  // Printer commands
  INIT_PRINTER: '\x1B\x40', // ESC @
  PRINT_TEXT: '\x1B\x50', // ESC P
  PRINT_BOLD: '\x1B\x45\x01', // ESC E 1
  PRINT_NORMAL: '\x1B\x45\x00', // ESC E 0
  CUT_PAPER: '\x1B\x69', // ESC i
  
  // Drawer commands
  OPEN_DRAWER: '\x1B\x70\x00\x19\xFA', // ESC p 0 25 250ms
  OPEN_DRAWER_ALT: '\x07', // BEL character
  
  // Status commands
  GET_STATUS: '\x1B\x76', // ESC v
  GET_PAPER_STATUS: '\x1B\x75', // ESC u
  
  // Transaction commands
  START_TRANSACTION: '\x1B\x54\x01', // ESC T 1
  END_TRANSACTION: '\x1B\x54\x00', // ESC T 0
  ADD_ITEM: '\x1B\x49', // ESC I
  SET_TOTAL: '\x1B\x54', // ESC T
};
```

## Cara Penggunaan

### 1. Setup Hardware
1. Hubungkan Sharp XE-A207W ke komputer via USB
2. Pastikan driver terinstall dengan benar
3. Buka aplikasi Studio POS di browser Chrome/Edge
4. Navigasi ke halaman Cashier

### 2. Koneksi Hardware
1. Klik tab "Hardware" di halaman Cashier
2. Klik tombol "Connect" untuk menghubungkan ke hardware
3. Browser akan meminta izin untuk mengakses port serial
4. Pilih Sharp XE-A207W dari daftar device
5. Status koneksi akan ditampilkan di dashboard

### 3. Testing Hardware
1. **Test Display**: Klik "Test Display" untuk menampilkan total di LCD
2. **Test Print**: Klik "Test Print" untuk mencetak struk test
3. **Open Drawer**: Klik "Buka Laci" untuk membuka laci kasir
4. **Get Status**: Klik "Get Status" untuk cek status hardware

### 4. Transaksi dengan Hardware
1. Tambahkan item di terminal
2. Pilih metode pembayaran
3. Klik "Complete Transaction"
4. Hardware akan otomatis:
   - Mencetak struk
   - Menampilkan total di display
   - Membuka laci kasir

## Struktur Komponen

### 1. Hook: useCashierHardware
```typescript
interface UseCashierHardwareReturn {
  hardwareStatus: HardwareStatus;
  isConnecting: boolean;
  connectionLog: string[];
  connectToHardware: () => Promise<void>;
  disconnectFromHardware: () => Promise<void>;
  sendCommand: (command: string) => Promise<boolean>;
  printReceipt: (transaction: TransactionData) => Promise<void>;
  displayTotal: (amount: number) => Promise<void>;
  openDrawer: () => Promise<void>;
  clearDisplay: () => Promise<void>;
  initializeHardware: () => Promise<void>;
  addLog: (message: string) => void;
}
```

### 2. Component: CashierHardwareIntegration
- Status monitoring
- Control panel
- Connection log
- Hardware information

### 3. Page: Cashier
- Terminal interface
- Hardware integration
- Settings management

## Error Handling

### 1. Connection Errors
- Web Serial API tidak tersedia
- Hardware tidak terdeteksi
- Port access denied
- Connection timeout

### 2. Hardware Errors
- Printer paper out
- Drawer stuck
- Display error
- Communication timeout

### 3. Recovery Actions
- Auto-reconnect
- Status monitoring
- Error logging
- User notification

## Browser Compatibility

### Supported Browsers
- **Chrome**: 89+ (Web Serial API)
- **Edge**: 89+ (Web Serial API)
- **Opera**: 76+ (Web Serial API)

### Not Supported
- Firefox (tidak mendukung Web Serial API)
- Safari (tidak mendukung Web Serial API)
- Mobile browsers

## Troubleshooting

### 1. Hardware Tidak Terdeteksi
- Pastikan kabel USB terhubung dengan benar
- Cek driver Sharp XE-A207W terinstall
- Restart browser dan aplikasi
- Coba port USB yang berbeda

### 2. Koneksi Gagal
- Pastikan browser mendukung Web Serial API
- Cek permission untuk akses port serial
- Restart hardware
- Coba browser Chrome/Edge

### 3. Printer Error
- Cek kertas thermal
- Pastikan printer tidak stuck
- Restart hardware
- Cek koneksi kabel

### 4. Drawer Tidak Buka
- Cek solenoid drawer
- Pastikan laci tidak terkunci
- Restart hardware
- Cek koneksi kabel

## Development Notes

### 1. Web Serial API
```javascript
// Request port access
const port = await navigator.serial.requestPort({
  filters: [
    { usbVendorId: 0x04B8 }, // Sharp vendor ID
    { usbProductId: 0x0202 }, // XE-A207W product ID
  ]
});

// Open port
await port.open({ baudRate: 9600 });

// Create reader
const textDecoder = new TextDecoderStream();
const reader = textDecoder.readable.getReader();

// Send command
const encoder = new TextEncoder();
const writer = port.writable.getWriter();
await writer.write(encoder.encode(command));
```

### 2. Command Sending
```javascript
const sendCommand = async (command: string) => {
  if (!serialPort) return false;
  
  try {
    const encoder = new TextEncoder();
    const writer = serialPort.writable.getWriter();
    await writer.write(encoder.encode(command));
    writer.releaseLock();
    return true;
  } catch (error) {
    console.error('Command error:', error);
    return false;
  }
};
```

### 3. Response Parsing
```javascript
const parseHardwareResponse = (response: string) => {
  if (response.includes('STATUS')) {
    if (response.includes('PAPER_OUT')) {
      setPrinterStatus('paper_out');
    } else if (response.includes('READY')) {
      setPrinterStatus('ready');
    }
  }
};
```

## Security Considerations

### 1. Port Access
- Web Serial API memerlukan user permission
- Hanya HTTPS yang diizinkan
- User harus explicit grant access

### 2. Data Protection
- Tidak ada data sensitif yang dikirim ke hardware
- Hanya command control yang dikirim
- Log komunikasi untuk debugging

### 3. Error Recovery
- Graceful degradation jika hardware offline
- Fallback ke software-only mode
- User notification untuk error

## Future Enhancements

### 1. Additional Hardware Support
- Support untuk mesin kasir lain
- Multiple hardware connection
- Hardware switching

### 2. Advanced Features
- Barcode scanner integration
- Card reader integration
- Weight scale integration

### 3. Monitoring & Analytics
- Hardware usage analytics
- Performance monitoring
- Predictive maintenance

## Support

Untuk bantuan teknis atau pertanyaan tentang integrasi hardware:

1. Cek log koneksi di tab Hardware
2. Restart hardware dan aplikasi
3. Cek browser compatibility
4. Hubungi support team

---

**Note**: Integrasi ini memerlukan hardware Sharp XE-A207W yang kompatibel dan browser yang mendukung Web Serial API.

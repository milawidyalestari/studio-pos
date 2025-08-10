# Cash Register Integration Guide

## Overview
Halaman Kasir telah diintegrasikan dengan pengaturan mesin cash register untuk memberikan pengalaman yang lebih baik dalam mengelola transaksi dan hardware.

## Fitur yang Ditambahkan

### 1. Tab Hardware Settings
- **Hardware Connection Status**: Menampilkan status koneksi dan tombol untuk connect/disconnect
- **Cash Register Configuration**: Pengaturan preset dan konfigurasi hardware
- **Test Hardware**: Fungsi untuk menguji semua komponen hardware

### 2. Preset Cash Register
Sistem mendukung berbagai preset untuk mesin cash register populer:

#### Sharp XE-A207W
- Type: All-in-One
- Connection: USB
- Protocol: ESC/POS
- Features: Printer, Cash Drawer, Customer Display, Buzzer, LED Indicator

#### Epson TM-T20
- Type: Thermal Printer
- Connection: USB
- Protocol: ESC/POS
- Features: Printer, Cash Drawer, Receipt Cutter

#### Star TSP143
- Type: Thermal Printer
- Connection: USB
- Protocol: ESC/POS
- Features: Printer, Cash Drawer, Receipt Cutter

#### Brother QL-820NWB
- Type: Thermal Label Printer
- Connection: Network
- Protocol: Custom
- Features: Printer, Receipt Cutter
- Ideal untuk studio printing

#### Epson TM-T88VI
- Type: Thermal Printer
- Connection: USB
- Protocol: ESC/POS
- Features: Printer, Cash Drawer, Receipt Cutter

#### Citizen CT-S310II
- Type: Thermal Printer
- Connection: USB
- Protocol: Citizen Commands
- Features: Printer, Cash Drawer, Receipt Cutter

### 3. Tipe Koneksi yang Didukung
- **USB**: Koneksi langsung via USB
- **Serial/RS-232**: Koneksi serial dengan pengaturan baud rate
- **Network/Ethernet**: Koneksi jaringan dengan IP address dan port
- **Bluetooth**: Koneksi wireless via Bluetooth
- **WiFi**: Koneksi wireless via WiFi

### 4. Pengaturan Hardware
- **Auto Print**: Otomatis print receipt setelah transaksi
- **Auto Cut**: Otomatis potong kertas setelah print
- **Auto Open Drawer**: Otomatis buka laci setelah transaksi
- **Customer Display**: Tampilkan total di display customer
- **Receipt Header/Footer**: Kustomisasi header dan footer receipt

### 5. Produk Studio Printing
Ditambahkan produk-produk yang umum untuk studio printing:

#### Printing Services
- Photo Print A4: $3.50
- Photo Print A3: $7.00
- Canvas Print: $45.00
- T-Shirt Print: $12.00

#### Digital Services
- Document Scan: $2.00
- CD/DVD Burn: $8.00
- USB Transfer: $5.00
- Design Service: $25.00

## Cara Penggunaan

### 1. Setup Hardware
1. Buka tab "Hardware Settings"
2. Pilih preset cash register yang sesuai
3. Atur tipe koneksi (USB, Network, dll)
4. Konfigurasi pengaturan koneksi (IP, Port, dll)
5. Klik "Connect" untuk menghubungkan

### 2. Test Hardware
1. Setelah terhubung, klik "Test" untuk menguji hardware
2. Sistem akan menguji:
   - Printer
   - Cash Drawer
   - Customer Display
   - Barcode Scanner
   - Card Reader

### 3. Transaksi dengan Hardware
1. Buka tab "Transaction"
2. Tambahkan item ke keranjang
3. Proses pembayaran
4. Sistem akan otomatis:
   - Print receipt (jika auto print aktif)
   - Buka laci (jika auto open drawer aktif)
   - Update display customer (jika aktif)

### 4. Simpan Konfigurasi
1. Atur semua pengaturan sesuai kebutuhan
2. Klik "Save" untuk menyimpan konfigurasi
3. Konfigurasi akan tersimpan di localStorage
4. Gunakan "Load" untuk memuat konfigurasi yang tersimpan

## Struktur File

### `src/pages/Cashier.tsx`
- Halaman utama dengan integrasi cash register
- Tab untuk transaksi dan hardware settings
- State management untuk koneksi hardware

### `src/types/cashRegister.ts`
- Interface dan tipe data untuk cash register
- Preset konfigurasi untuk berbagai model
- Tipe koneksi dan protokol yang didukung

### `src/services/cashRegisterService.ts`
- Service untuk mengelola koneksi hardware
- Fungsi test dan validasi hardware
- Manajemen preset dan konfigurasi

## Troubleshooting

### Hardware Tidak Terdeteksi
1. Periksa koneksi fisik (USB, Network, dll)
2. Pastikan driver sudah terinstall
3. Cek pengaturan port/IP address
4. Gunakan fungsi test untuk debugging

### Print Tidak Berfungsi
1. Periksa status printer di hardware test
2. Pastikan kertas tidak habis
3. Cek pengaturan paper width dan type
4. Verifikasi command ESC/POS

### Cash Drawer Tidak Buka
1. Periksa koneksi kabel drawer
2. Test dengan tombol test hardware
3. Cek pengaturan auto open drawer
4. Verifikasi command open drawer

## Pengembangan Selanjutnya

### Fitur yang Direncanakan
- **Multi-device Support**: Dukungan untuk multiple cash register
- **Remote Management**: Pengaturan hardware dari jarak jauh
- **Advanced Printing**: Template receipt yang lebih fleksibel
- **Hardware Monitoring**: Monitoring real-time status hardware
- **Backup Configuration**: Export/import konfigurasi hardware

### Integrasi dengan Sistem Lain
- **Inventory Management**: Update stok otomatis
- **Customer Database**: Integrasi dengan database customer
- **Payment Gateway**: Integrasi dengan payment processor
- **Reporting System**: Laporan hardware dan transaksi

## Kesimpulan

Integrasi cash register dengan halaman Kasir memberikan:
- **Efisiensi**: Transaksi lebih cepat dengan hardware otomatis
- **Akurasi**: Mengurangi kesalahan manual
- **Professional**: Tampilan yang lebih profesional untuk customer
- **Flexibility**: Dukungan berbagai tipe hardware dan koneksi
- **Scalability**: Mudah dikembangkan untuk kebutuhan masa depan

Sistem ini dirancang untuk studio printing modern dengan kebutuhan hardware yang bervariasi dan kemudahan dalam pengelolaan transaksi.

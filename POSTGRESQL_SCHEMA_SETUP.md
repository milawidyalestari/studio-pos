# PostgreSQL Schema Setup untuk Studio POS

Script ini akan membuat struktur database PostgreSQL untuk Studio POS tanpa data.

## 📋 Prerequisites

1. **PostgreSQL** harus sudah terinstall dan berjalan
2. **Node.js** harus sudah terinstall
3. **Database** `studio_pos` harus sudah dibuat

## 🚀 Cara Menggunakan

### Opsi 1: Menggunakan Batch File (Windows)
```bash
# Jalankan file batch
setup-postgresql-schema.bat
```

### Opsi 2: Menggunakan PowerShell (Windows)
```powershell
# Jalankan script PowerShell
.\setup-postgresql-schema.ps1
```

### Opsi 3: Menggunakan Node.js Langsung
```bash
# Set environment variables
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=studio_pos
set DB_USER=postgres
set DB_PASSWORD=your_password

# Jalankan script
node scripts/setup-postgresql-schema.js
```

## 📊 Konfigurasi Database

Script akan meminta konfigurasi berikut:
- **Host**: Alamat server PostgreSQL (default: localhost)
- **Port**: Port PostgreSQL (default: 5432)
- **Database**: Nama database (default: studio_pos)
- **Username**: Username PostgreSQL (default: postgres)
- **Password**: Password PostgreSQL

## 🗃️ Tabel yang Dibuat

Script akan membuat tabel-tabel berikut:

### Tabel Master
- `groups` - Grup kategori
- `categories` - Kategori produk
- `units` - Satuan
- `customers` - Data pelanggan
- `suppliers` - Data supplier
- `materials` - Data bahan/material
- `products` - Data produk
- `employees` - Data karyawan

### Tabel Transaksi
- `orders` - Data pesanan
- `order_items` - Item pesanan
- `order_statuses` - Status pesanan
- `transactions` - Data transaksi
- `payment_types` - Jenis pembayaran

### Tabel Inventory
- `inventory_movements` - Pergerakan stok

### Tabel Akuntansi
- `transaction_master` - Master transaksi
- `chart_of_accounts` - Chart of accounts
- `cash_accounts` - Akun kas
- `journal_entries` - Jurnal akuntansi
- `pos_accounting` - Integrasi POS dengan akuntansi

### Tabel Sistem
- `notifications` - Notifikasi sistem

## 🔍 Index dan Trigger

Script juga akan membuat:
- **Index** untuk performa query yang lebih baik
- **Trigger** untuk update timestamp otomatis
- **Foreign Key** constraints untuk integritas data

## 📝 Data Default

Script akan mengisi data default:
- **Order Statuses**: Pending, Processing, Completed, Cancelled
- **Payment Types**: Cash, Card, Transfer, QRIS
- **Groups**: Bahan Baku, Produk Jadi, Jasa
- **Categories**: Kain, Benang, Baju, Celana, Jahit, Potong
- **Units**: Pcs, Meter, Yard, Kg, Gram
- **Chart of Accounts**: Struktur akun dasar
- **Cash Accounts**: Akun kas default
- **Admin Employee**: User administrator default

## 🔧 Troubleshooting

### Error: Connection Refused
```
❌ Error: connect ECONNREFUSED
```
**Solusi**: Pastikan PostgreSQL service berjalan

### Error: Database Does Not Exist
```
❌ Error: database "studio_pos" does not exist
```
**Solusi**: Buat database terlebih dahulu:
```sql
CREATE DATABASE studio_pos;
```

### Error: Authentication Failed
```
❌ Error: password authentication failed
```
**Solusi**: Periksa username dan password PostgreSQL

### Error: Permission Denied
```
❌ Error: permission denied for database
```
**Solusi**: Pastikan user memiliki akses ke database

## 📋 Langkah Selanjutnya

Setelah schema berhasil dibuat:

1. **Start Studio POS Application**
   ```bash
   npx electron .
   ```

2. **Gunakan Database Setup Wizard**
   - Pilih "PostgreSQL" sebagai database type
   - Masukkan konfigurasi yang sama dengan yang digunakan untuk membuat schema
   - Klik "Test Koneksi" untuk memverifikasi
   - Lanjutkan setup

3. **Verifikasi Setup**
   - Aplikasi akan mendeteksi schema yang sudah ada
   - Tidak perlu membuat tabel lagi
   - Langsung bisa digunakan

## 🎯 Keuntungan

- **Struktur Lengkap**: Semua tabel dan relasi sudah dibuat
- **Index Optimized**: Query akan lebih cepat
- **Data Default**: Status dan konfigurasi dasar sudah tersedia
- **Ready to Use**: Langsung bisa digunakan tanpa setup tambahan

## 📞 Support

Jika mengalami masalah:
1. Periksa log error untuk detail masalah
2. Pastikan PostgreSQL berjalan dengan benar
3. Verifikasi konfigurasi database
4. Cek permission user PostgreSQL

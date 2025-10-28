# Studio POS - Native Application Setup Guide

## Overview

Studio POS sekarang mendukung mode native dengan sistem deteksi database otomatis dan setup pertama kali yang mudah. Aplikasi akan secara otomatis mendeteksi database yang tersedia dan melakukan setup awal jika diperlukan.

## Fitur Native Mode

### 1. Auto Database Detection
- **PostgreSQL**: Jika tersedia, aplikasi akan menggunakan PostgreSQL
- **SQLite**: Fallback ke SQLite jika PostgreSQL tidak tersedia
- **Local Storage**: Fallback terakhir untuk mode web

### 2. First Run Setup
- Deteksi otomatis apakah ini pertama kali menjalankan aplikasi
- Setup database dan tabel secara otomatis
- Buat user admin default (admin/admin123)
- Inisialisasi kategori dan data sample

### 3. User Management
- Login dengan user admin default
- Sistem autentikasi terintegrasi dengan database
- Session management untuk keamanan

## Cara Menjalankan

### Development Mode
```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

### Production Build
```bash
# Windows
scripts/build-native.bat

# Linux/Mac
chmod +x scripts/build-native.sh
./scripts/build-native.sh
```

## First Run Experience

### 1. Database Detection
Saat pertama kali menjalankan aplikasi, sistem akan:
- Mencoba koneksi ke PostgreSQL
- Jika gagal, fallback ke SQLite
- Jika tidak ada database, gunakan Local Storage

### 2. Setup Wizard
Jika ini first run, aplikasi akan menampilkan:
- Status deteksi database
- Opsi setup otomatis
- Progress setup

### 3. Login Screen
Setelah setup selesai:
- Login dengan admin/admin123
- Atau gunakan tombol "Use Default Credentials"

## Default Credentials

- **Username**: admin
- **Password**: admin123
- **Role**: admin
- **Email**: admin@studio-pos.com

## Database Schema

### Tables Created
- `users` - User management
- `categories` - Transaction categories
- `transactions` - Financial transactions
- `orders` - Order management
- `products` - Product inventory
- `customers` - Customer data
- `suppliers` - Supplier data
- `employees` - Employee data

### Default Data
- Admin user (admin/admin123)
- Default categories (Penjualan, Jasa, Bahan Baku, Operasional)
- Sample products dan customers

## Troubleshooting

### Database Connection Issues
1. Pastikan PostgreSQL running (jika menggunakan)
2. Cek koneksi database di Settings
3. Reset aplikasi jika diperlukan

### First Run Problems
1. Clear localStorage: `localStorage.clear()`
2. Restart aplikasi
3. Jalankan setup ulang

### Login Issues
1. Pastikan menggunakan credentials yang benar
2. Cek apakah user aktif
3. Reset password jika diperlukan

## File Structure

```
src/
├── services/
│   └── nativeDatabaseService.ts    # Database detection & setup
├── components/
│   ├── NativeAppWrapper.tsx        # Main wrapper component
│   ├── NativeDatabaseStatus.tsx    # Database status display
│   └── NativeLogin.tsx             # Login component
├── AppNative.tsx                   # Native app entry point
└── main.tsx                        # Updated to use AppNative

electron/
├── main.js                         # Updated with auth & database setup
└── preload.js                      # Updated with auth API

database/
└── sqlite-schema.sql               # Updated with users table
```

## Development Notes

### Adding New Features
1. Update database schema di `sqlite-schema.sql`
2. Update IPC handlers di `main.js`
3. Update preload API di `preload.js`
4. Update service layer di `nativeDatabaseService.ts`

### Testing
1. Test first run scenario
2. Test database detection
3. Test login/logout flow
4. Test data persistence

## Production Deployment

### Windows
- Installer akan dibuat di `dist-electron/`
- Database SQLite akan disimpan di `%APPDATA%/studio-pos/`
- Logs tersimpan di `%APPDATA%/studio-pos/logs/`

### Linux
- AppImage atau deb package
- Database di `~/.config/studio-pos/`
- Logs di `~/.config/studio-pos/logs/`

### macOS
- DMG installer
- Database di `~/Library/Application Support/studio-pos/`
- Logs di `~/Library/Logs/studio-pos/`

## Security Considerations

1. **Password Hashing**: Di production, password harus di-hash
2. **Database Encryption**: Pertimbangkan enkripsi database
3. **Session Management**: Implementasi session timeout
4. **Input Validation**: Validasi semua input user
5. **Error Handling**: Jangan expose sensitive information

## Support

Jika mengalami masalah:
1. Cek console logs
2. Cek database connection
3. Reset aplikasi jika diperlukan
4. Hubungi support team



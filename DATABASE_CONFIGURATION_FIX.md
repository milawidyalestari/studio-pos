# Perbaikan Konfigurasi Database - Force Local Database

## Masalah
Setelah initial setup database, aplikasi masih menggunakan database Supabase meskipun sudah ada database lokal yang sudah di-setup.

## Solusi yang Diimplementasikan

### 1. **Perbaikan DatabaseFactory** (`src/lib/database.ts`)
- Menambahkan deteksi environment Electron
- Memprioritaskan database lokal untuk aplikasi Electron
- Fallback ke Supabase hanya untuk web development

### 2. **Perbaikan DatabaseManager** (`src/lib/database-manager.ts`)
- Electron: Gunakan Local Storage secara default
- Web: Coba Supabase dulu, fallback ke Local Storage
- Logging yang lebih jelas untuk debugging

### 3. **Perbaikan use-database-init** (`src/hooks/use-database-init.ts`)
- Electron: Gunakan local storage secara default
- Web: Gunakan environment config atau local storage
- Menghilangkan prioritas PostgreSQL untuk Electron

### 4. **Komponen DatabaseConfiguration** (`src/components/settings/DatabaseConfiguration.tsx`)
- Interface baru untuk mengatur konfigurasi database
- Support untuk Local Storage, Supabase, dan PostgreSQL
- Validasi dan error handling yang lebih baik

### 5. **Script Force Local Database** (`scripts/force-local-database.html`)
- Tool untuk memaksa aplikasi menggunakan database lokal
- Interface web untuk mengatur konfigurasi
- Check dan clear configuration

## Cara Menggunakan

### Opsi 1: Menggunakan Script HTML
1. Buka file `scripts/force-local-database.html` di browser
2. Klik "Force Local Database"
3. Refresh aplikasi Studio POS

### Opsi 2: Menggunakan Settings
1. Buka aplikasi Studio POS
2. Pergi ke Settings → Database
3. Pilih "Local Storage"
4. Klik "Save Configuration"
5. Refresh aplikasi

### Opsi 3: Manual Configuration
Jalankan di console browser:
```javascript
// Set local database configuration
localStorage.setItem('database_config', JSON.stringify({
  mode: 'development',
  type: 'local',
  connection: {}
}));
localStorage.setItem('database_setup_completed', 'true');
localStorage.setItem('use_local_database', 'true');

// Refresh aplikasi
window.location.reload();
```

## Verifikasi Perbaikan

### 1. **Check Console Logs**
Aplikasi akan menampilkan log seperti:
```
🖥️ Electron detected - prioritizing local database
💾 Development (Electron): Using Local Storage
```

### 2. **Check Database Info**
Di Settings → Database, pastikan:
- Database Type: Local Storage
- Status: Connected
- Mode: Development

### 3. **Test Functionality**
- Coba buat jurnal umum
- Coba buat transaksi
- Data seharusnya tersimpan di localStorage

## Troubleshooting

### Masalah: Masih menggunakan Supabase
**Solusi:**
1. Clear browser cache dan localStorage
2. Jalankan script force-local-database.html
3. Restart aplikasi

### Masalah: Data hilang setelah switch
**Solusi:**
1. Data Supabase dan Local Storage terpisah
2. Export data dari Supabase terlebih dahulu
3. Import data ke Local Storage

### Masalah: Error saat switch database
**Solusi:**
1. Check console untuk error details
2. Pastikan localStorage tersedia
3. Restart aplikasi

## File yang Dimodifikasi

1. `src/lib/database.ts` - DatabaseFactory
2. `src/lib/database-manager.ts` - DatabaseManager
3. `src/hooks/use-database-init.ts` - Database initialization
4. `src/components/settings/DatabaseConfiguration.tsx` - New component
5. `src/components/settings/DatabaseSettings.tsx` - Updated to use new component
6. `scripts/force-local-database.html` - Configuration tool

## Konfigurasi Database yang Didukung

### 1. **Local Storage** (Default untuk Electron)
- Data tersimpan di browser localStorage
- Offline-capable
- Cepat dan responsif
- Cocok untuk single-user

### 2. **Supabase** (Default untuk Web)
- Cloud database
- Real-time features
- Multi-user support
- Memerlukan internet

### 3. **PostgreSQL** (Production)
- Local database server
- High performance
- Multi-user support
- Memerlukan setup server

## Testing

### Test Database Switching
1. Start dengan Supabase
2. Switch ke Local Storage
3. Verify data persistence
4. Switch kembali ke Supabase
5. Verify data consistency

### Test Error Handling
1. Simulate network error
2. Test fallback mechanism
3. Verify error messages
4. Test recovery

## Monitoring

### Console Logs
Monitor console untuk:
- Database initialization messages
- Connection status
- Error messages
- Configuration changes

### Performance
Monitor:
- Database query performance
- Memory usage
- Storage usage
- Network requests

---

**Status:** ✅ Completed  
**Version:** 1.0  
**Date:** 2025-01-18

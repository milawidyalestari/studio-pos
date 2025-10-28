# 🚨 COMPLETE FIX - Error 400 & Data Tidak Muncul

## Masalah yang Dialami
1. Error 400 saat mengakses tabel akuntansi
2. Data tidak muncul meskipun sudah ada di database
3. Error saat menambahkan akun baru

## Solusi Lengkap

### 🔧 **Langkah 1: Jalankan Script Fix Lengkap**

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda
   - Klik "SQL Editor" di sidebar kiri
   - Klik "New Query"

2. **Jalankan Script Fix Lengkap**
   - Copy **seluruh isi** file `scripts/complete-accounting-fix.sql`
   - Paste ke SQL Editor
   - Klik "Run" untuk menjalankan script

### 🔧 **Langkah 2: Verifikasi Hasil**

Script akan menampilkan output seperti ini:
```
test                           | 
-------------------------------| 
Testing chart_of_accounts query... | 
id                             | account_code | account_name | account_type
-------------------------------|--------------|--------------|-------------
uuid-here                      | 1000         | ASET         | asset
uuid-here                      | 1100         | Aset Lancar  | asset
...

table_name        | record_count
------------------|-------------
chart_of_accounts | 20
cash_accounts     | 1
journal_entries   | 0
journal_entry_lines| 0
```

### 🔧 **Langkah 3: Test di Aplikasi**

1. **Refresh halaman aplikasi** (Ctrl+F5)
2. **Buka `/accounting` atau tab "Akuntansi" di Finance**
3. **Periksa console browser** - tidak ada error 400
4. **Coba tambah akun baru** - seharusnya berhasil

### 🔧 **Langkah 4: Jika Masih Error**

Jalankan script test untuk diagnosis:
```bash
node scripts/test-accounting-access.js
```

## Troubleshooting Detail

### Jika Error 400 Masih Muncul:

**Kemungkinan 1: RLS Policies**
```sql
-- Disable RLS sementara untuk test
ALTER TABLE chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines DISABLE ROW LEVEL SECURITY;
```

**Kemungkinan 2: Tabel Belum Dibuat**
- Periksa di Supabase Dashboard → Database → Tables
- Pastikan tabel `chart_of_accounts`, `cash_accounts`, dll ada

**Kemungkinan 3: Authentication Issue**
- Pastikan user sudah login
- Periksa apakah API key benar
- Clear browser cache dan cookies

### Jika Data Tidak Muncul:

**Kemungkinan 1: RLS Policies Terlalu Ketat**
```sql
-- Buat policy yang lebih permisif
CREATE POLICY "Allow all operations" ON chart_of_accounts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations" ON cash_accounts
    FOR ALL USING (true);
```

**Kemungkinan 2: Cache Browser**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Coba di incognito mode

**Kemungkinan 3: Data Kosong**
- Periksa di Supabase Dashboard → Database → Tables
- Lihat apakah ada data di tabel

### Jika Error Saat Menambah Akun:

**Kemungkinan 1: Constraint Violation**
- Periksa apakah `account_code` sudah ada
- Pastikan `account_type` sesuai dengan enum

**Kemungkinan 2: Foreign Key Error**
- Pastikan `parent_account_id` valid (jika digunakan)
- Pastikan `account_id` valid untuk cash accounts

## Verifikasi Lengkap

### 1. Periksa di Supabase Dashboard:
- Database → Tables → chart_of_accounts (ada 20 records)
- Database → Tables → cash_accounts (ada 1 record)
- Database → Tables → journal_entries (ada 0 records)
- Database → Tables → journal_entry_lines (ada 0 records)

### 2. Periksa di Browser:
- Console tidak ada error 400
- Network tab tidak ada failed requests
- Halaman akuntansi bisa dibuka
- Data ditampilkan dengan benar

### 3. Test Functionality:
- Bisa lihat daftar akun
- Bisa tambah akun baru
- Bisa edit akun existing
- Bisa lihat akun kas
- Bisa tambah akun kas baru

## File yang Dibutuhkan

- `scripts/complete-accounting-fix.sql` - Script fix lengkap
- `scripts/test-accounting-access.js` - Script test (opsional)
- `COMPLETE_FIX_INSTRUCTIONS.md` - Panduan ini

## Support

Jika masih mengalami masalah:

1. **Screenshot error di console browser**
2. **Screenshot hasil query di Supabase Dashboard**
3. **Screenshot halaman akuntansi yang tidak menampilkan data**
4. **Periksa Network tab untuk request/response detail**

## Catatan Penting

- Script fix akan menghapus semua data existing (jika ada)
- Data default akan dibuat otomatis
- RLS akan diaktifkan dengan policies yang permisif
- Semua tabel akan dibuat dengan struktur yang benar


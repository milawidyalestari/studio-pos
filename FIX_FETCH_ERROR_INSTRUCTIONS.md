# 🚨 FIX FETCH ERROR 400 - chart_of_accounts?select=*

## Masalah
Error 400 saat fetch ke `chart_of_accounts?select=*` yang muncul di Network tab browser.

## Solusi Langsung

### 🔧 **Langkah 1: Jalankan Script Fix Fetch**

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda
   - Klik "SQL Editor" di sidebar kiri
   - Klik "New Query"

2. **Jalankan Script Fix Fetch**
   - Copy **seluruh isi** file `scripts/fix-fetch-error.sql`
   - Paste ke SQL Editor
   - Klik "Run" untuk menjalankan script

### 🔧 **Langkah 2: Verifikasi Hasil**

Script akan menampilkan output seperti ini:
```
test                           | 
-------------------------------| 
Testing the exact query that was failing... | 
id                             | account_code | account_name | account_type | parent_account_id | is_active | description | created_at | updated_at
-------------------------------|--------------|--------------|--------------|-------------------|-----------|-------------|------------|------------
uuid-here                      | 1000         | ASET         | asset        | null              | true      | Kategori Aset | 2025-01-18 | 2025-01-18
...

table_name        | record_count
------------------|-------------
chart_of_accounts | 20
cash_accounts     | 1
journal_entries   | 0
journal_entry_lines| 0
```

### 🔧 **Langkah 3: Test di Browser**

1. **Refresh halaman aplikasi** (Ctrl+F5)
2. **Buka Developer Tools** (F12)
3. **Buka Network tab**
4. **Buka halaman Akuntansi** (`/accounting`)
5. **Periksa apakah masih ada error 400**

### 🔧 **Langkah 4: Jika Masih Error**

Jalankan script test untuk diagnosis:
```bash
node scripts/test-fetch-directly.js
```

## Troubleshooting Detail

### Jika Error 400 Masih Muncul:

**Kemungkinan 1: Tabel Belum Dibuat**
```sql
-- Cek apakah tabel ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'chart_of_accounts';
```

**Kemungkinan 2: RLS Masih Aktif**
```sql
-- Disable RLS sementara
ALTER TABLE chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts DISABLE ROW LEVEL SECURITY;
```

**Kemungkinan 3: Permissions Issue**
```sql
-- Grant permissions
GRANT ALL ON chart_of_accounts TO anon;
GRANT ALL ON cash_accounts TO anon;
GRANT ALL ON journal_entries TO anon;
GRANT ALL ON journal_entry_lines TO anon;
```

### Jika Data Tidak Muncul:

**Kemungkinan 1: Cache Browser**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Coba di incognito mode

**Kemungkinan 2: Data Kosong**
```sql
-- Cek apakah ada data
SELECT COUNT(*) FROM chart_of_accounts;
SELECT COUNT(*) FROM cash_accounts;
```

**Kemungkinan 3: RLS Policies**
```sql
-- Buat policy yang sangat permisif
CREATE POLICY "Allow all operations" ON chart_of_accounts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations" ON cash_accounts
    FOR ALL USING (true);
```

## Verifikasi Lengkap

### 1. Periksa di Supabase Dashboard:
- Database → Tables → chart_of_accounts (ada 20 records)
- Database → Tables → cash_accounts (ada 1 record)
- Database → Tables → journal_entries (ada 0 records)
- Database → Tables → journal_entry_lines (ada 0 records)

### 2. Periksa di Browser Network Tab:
- Tidak ada request dengan status 400
- Request ke `chart_of_accounts?select=*` berhasil (status 200)
- Request ke `cash_accounts?select=*%2Cchart_of_accounts%28*%29` berhasil (status 200)

### 3. Periksa di Console Browser:
- Tidak ada error JavaScript
- Tidak ada error fetch
- Data ditampilkan dengan benar

## File yang Dibutuhkan

- `scripts/fix-fetch-error.sql` - Script fix fetch error
- `scripts/test-fetch-directly.js` - Script test fetch (opsional)
- `FIX_FETCH_ERROR_INSTRUCTIONS.md` - Panduan ini

## Catatan Penting

- Script ini akan **menghapus semua data existing** dan membuat ulang
- RLS akan **dinonaktifkan sementara** untuk testing
- Data default akan dibuat otomatis
- Semua tabel akan dibuat dengan struktur yang benar

## Support

Jika masih mengalami masalah:

1. **Screenshot error di Network tab**
2. **Screenshot hasil query di Supabase Dashboard**
3. **Screenshot console browser**
4. **Periksa apakah tabel benar-benar dibuat di Supabase Dashboard**

## Mengapa Error Ini Terjadi?

1. **Tabel belum dibuat** - Migration belum dijalankan
2. **RLS policies terlalu ketat** - Akses ditolak
3. **Struktur tabel salah** - Ada masalah dengan schema
4. **Permissions issue** - User tidak memiliki akses
5. **Cache browser** - Data lama masih di-cache


# 🚨 CLEAN SQL SCRIPT - Fix Error 400

## Masalah
Error syntax karena SQL Editor Supabase tidak bisa menjalankan komentar markdown (`#`).

## Solusi

### 🔧 **Langkah 1: Buka Supabase Dashboard**
1. Login ke [supabase.com](https://supabase.com)
2. Pilih project Anda
3. Klik "SQL Editor" di sidebar kiri
4. Klik "New Query"

### 🔧 **Langkah 2: Jalankan Script SQL Bersih**
1. Copy **seluruh isi** file `scripts/clean-accounting-fix.sql`
2. Paste ke SQL Editor
3. Klik "Run" untuk menjalankan script

### 🔧 **Langkah 3: Verifikasi Hasil**
Script akan menampilkan output seperti ini:
```
test                           | 
-------------------------------| 
Testing chart_of_accounts query... | 
id                             | account_code | account_name | account_type | ...
-------------------------------|--------------|--------------|--------------| ...
uuid-here                      | 1000         | ASET         | asset        | ...

table_name        | record_count
------------------|-------------
chart_of_accounts | 20
cash_accounts     | 1
journal_entries   | 0
journal_entry_lines| 0
```

### 🔧 **Langkah 4: Test di Browser**
1. Refresh halaman aplikasi (Ctrl+F5)
2. Buka Developer Tools (F12) → Network tab
3. Buka halaman Akuntansi (`/accounting`)
4. Periksa apakah masih ada error 400

## Yang Akan Dibuat

- ✅ Tabel `chart_of_accounts` (20 records)
- ✅ Tabel `cash_accounts` (1 record)
- ✅ Tabel `journal_entries` (0 records)
- ✅ Tabel `journal_entry_lines` (0 records)
- ✅ Indexes untuk performa
- ✅ Triggers untuk updated_at
- ✅ RLS dinonaktifkan untuk testing

## Troubleshooting

### Jika masih error syntax:
- Pastikan tidak ada karakter markdown (`#`, `*`, dll)
- Pastikan semua SQL statement diakhiri dengan `;`
- Pastikan tidak ada komentar markdown

### Jika masih error 400:
- Periksa di Supabase Dashboard → Database → Tables
- Pastikan tabel benar-benar dibuat
- Refresh browser dengan hard refresh (Ctrl+F5)

### Jika data tidak muncul:
- Clear browser cache (Ctrl+Shift+Delete)
- Coba di incognito mode
- Periksa console browser untuk error

## File yang Dibutuhkan

- `scripts/clean-accounting-fix.sql` - Script SQL bersih tanpa markdown
- `CLEAN_SQL_INSTRUCTIONS.md` - Panduan ini

## Catatan Penting

- Script ini akan menghapus semua data existing
- RLS akan dinonaktifkan untuk testing
- Data default akan dibuat otomatis
- Semua tabel akan dibuat dengan struktur yang benar

## Verifikasi Berhasil

Setelah script berhasil:
1. ✅ Tidak ada error syntax
2. ✅ Tabel dibuat dengan data default
3. ✅ Error 400 hilang di browser
4. ✅ Halaman akuntansi bisa dibuka
5. ✅ Data ditampilkan dengan benar


# 🚨 FIX ERROR 400 - Tabel Akuntansi

## Masalah
Error 400 saat mengakses tabel `chart_of_accounts` dan `cash_accounts` menunjukkan bahwa tabel belum dibuat atau ada masalah dengan RLS policies.

## Solusi Langsung

### 🔧 **Langkah 1: Buka Supabase Dashboard**
1. Login ke [supabase.com](https://supabase.com)
2. Pilih project Anda
3. Klik "SQL Editor" di sidebar kiri
4. Klik "New Query"

### 🔧 **Langkah 2: Jalankan Script Fix**
1. Copy **seluruh isi** file `scripts/fix-accounting-400-error.sql`
2. Paste ke SQL Editor
3. Klik "Run" untuk menjalankan script

### 🔧 **Langkah 3: Verifikasi**
Script akan:
- ✅ Menghapus tabel lama (jika ada)
- ✅ Membuat tabel baru dengan struktur yang benar
- ✅ Mengaktifkan RLS (Row Level Security)
- ✅ Membuat policies untuk akses
- ✅ Menambahkan data default
- ✅ Menampilkan jumlah record di setiap tabel

### 🔧 **Langkah 4: Test di Aplikasi**
1. Refresh halaman aplikasi
2. Buka `/accounting` atau tab "Akuntansi" di Finance
3. Error 400 seharusnya hilang
4. Halaman akuntansi akan menampilkan data default

## Alternatif: Manual Fix

Jika script di atas tidak berhasil, jalankan perintah SQL ini satu per satu:

```sql
-- 1. Hapus tabel lama
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS cash_accounts CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;

-- 2. Buat tabel chart_of_accounts
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat tabel cash_accounts
CREATE TABLE cash_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    is_primary BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Aktifkan RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;

-- 5. Buat policies
CREATE POLICY "Allow all operations for authenticated users" ON chart_of_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON cash_accounts
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Tambah data default
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
('1110', 'Kas', 'asset', 'Uang tunai dan setara kas'),
('1120', 'Bank', 'asset', 'Saldo rekening bank'),
('4100', 'Pendapatan Penjualan', 'income', 'Pendapatan dari penjualan'),
('5100', 'Harga Pokok Penjualan', 'expense', 'Biaya langsung produksi');
```

## Troubleshooting

### Jika masih error 400:
1. **Periksa Console Browser** - Lihat error detail di Network tab
2. **Periksa Supabase Dashboard** - Pastikan tabel benar-benar dibuat
3. **Periksa Authentication** - Pastikan user sudah login
4. **Clear Browser Cache** - Refresh hard (Ctrl+F5)

### Jika error "relation does not exist":
- Tabel belum dibuat, jalankan script fix di atas

### Jika error "permission denied":
- RLS policies belum dibuat, jalankan script fix di atas

### Jika error "invalid input syntax":
- Ada masalah dengan data, jalankan script fix di atas

## Verifikasi Berhasil

Setelah menjalankan script, Anda akan melihat:
```
table_name        | record_count
------------------|-------------
chart_of_accounts | 20
cash_accounts     | 1
journal_entries   | 0
journal_entry_lines| 0
```

Dan di aplikasi:
- ✅ Tidak ada error 400 di console
- ✅ Halaman akuntansi bisa dibuka
- ✅ Data default ditampilkan
- ✅ Bisa menambah/edit data

## File yang Dibutuhkan

- `scripts/fix-accounting-400-error.sql` - Script fix lengkap
- `scripts/diagnose-accounting-error.js` - Script diagnosis (opsional)

## Support

Jika masih mengalami masalah:
1. Screenshot error di console browser
2. Screenshot hasil query di Supabase Dashboard
3. Periksa Network tab untuk request/response detail


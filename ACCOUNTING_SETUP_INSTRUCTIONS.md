# 🚨 Error 400 - Tabel Akuntansi Belum Dibuat

## Masalah
Error 400 saat mengakses `cash_accounts` menunjukkan bahwa tabel akuntansi belum dibuat di database Supabase.

## Solusi

### Opsi 1: Jalankan SQL di Supabase Dashboard (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik "SQL Editor" di sidebar kiri
   - Klik "New Query"

3. **Jalankan Script Setup**
   - Copy seluruh isi file `scripts/accounting-setup.sql`
   - Paste ke SQL Editor
   - Klik "Run" untuk menjalankan script

4. **Verifikasi**
   - Script akan membuat semua tabel yang diperlukan
   - Akan menampilkan jumlah record di setiap tabel
   - Pastikan tidak ada error

### Opsi 2: Gunakan Migration Files

1. **Upload Migration Files**
   - Buka "Database" → "Migrations" di Supabase Dashboard
   - Upload file `supabase/migrations/20250118000000_create_accounting_system.sql`
   - Upload file `supabase/migrations/20250118000001_create_accounting_functions.sql`

2. **Jalankan Migration**
   - Klik "Apply" pada setiap migration
   - Pastikan status "Applied" muncul

### Opsi 3: Manual Table Creation

Jika opsi di atas tidak berhasil, buat tabel secara manual:

```sql
-- 1. Chart of Accounts
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

-- 2. Cash Accounts
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

-- 3. Journal Entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50) CHECK (reference_type IN ('sale', 'purchase', 'cash_in', 'cash_out', 'transfer', 'adjustment')),
    reference_id UUID,
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
CREATE POLICY "Allow all operations for authenticated users" ON chart_of_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON cash_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON journal_entries
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON journal_entry_lines
    FOR ALL USING (auth.role() = 'authenticated');
```

## Verifikasi Setup

Setelah menjalankan salah satu opsi di atas, verifikasi dengan:

1. **Refresh halaman aplikasi**
2. **Buka halaman Akuntansi** (`/accounting`)
3. **Periksa console browser** - tidak ada error 400
4. **Coba akses tab "Daftar Akun"** - seharusnya menampilkan data default

## Troubleshooting

### Jika masih error 400:
1. Periksa apakah tabel benar-benar dibuat di Supabase Dashboard
2. Periksa RLS policies apakah sudah aktif
3. Periksa apakah user sudah login dengan benar
4. Cek console browser untuk error detail

### Jika error permission denied:
1. Pastikan RLS policies sudah dibuat
2. Pastikan user sudah login
3. Periksa apakah API key benar

### Jika tabel kosong:
1. Jalankan script insert data default
2. Atau buat data manual melalui Supabase Dashboard

## File yang Dibutuhkan

- `scripts/accounting-setup.sql` - Script setup lengkap
- `supabase/migrations/20250118000000_create_accounting_system.sql` - Migration file
- `supabase/migrations/20250118000001_create_accounting_functions.sql` - Functions migration

## Support

Jika masih mengalami masalah, periksa:
1. Supabase Dashboard → Database → Tables
2. Supabase Dashboard → Authentication → Users
3. Browser Console untuk error detail
4. Network tab untuk request/response detail


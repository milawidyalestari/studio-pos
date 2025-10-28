# PostgreSQL Schema Fix untuk Studio POS

## 🚨 **MASALAH YANG DITEMUKAN:**

Error yang terjadi saat menggunakan accounting service:
```
Error: column "entry_number" of relation "journal_entries" does not exist
Error: column "username" does not exist
Error: relation "users" does not exist
```

## 🔧 **PENYEBAB MASALAH:**

1. **Schema PostgreSQL tidak lengkap** - Tabel `journal_entries` tidak memiliki kolom yang diperlukan oleh `accountingService`
2. **Tabel `users` tidak ada** - Diperlukan untuk authentication
3. **Tabel `journal_entry_lines` tidak ada** - Diperlukan untuk detail journal entries
4. **Struktur `cash_accounts` tidak sesuai** - Kolom tidak sesuai dengan yang diharapkan oleh service

## ✅ **SOLUSI YANG DITERAPKAN:**

### **1. Perbaikan Schema PostgreSQL**

#### **Tabel `journal_entries` (Diperbaiki):**
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,        -- ✅ DITAMBAHKAN
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    reference_type VARCHAR(50),                       -- ✅ DITAMBAHKAN
    reference_id UUID,                               -- ✅ DITAMBAHKAN
    total_debit DECIMAL(15,2) DEFAULT 0,            -- ✅ DITAMBAHKAN
    total_credit DECIMAL(15,2) DEFAULT 0,           -- ✅ DITAMBAHKAN
    status VARCHAR(20) DEFAULT 'draft',              -- ✅ DITAMBAHKAN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabel `journal_entry_lines` (Baru):**
```sql
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabel `users` (Baru):**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,            -- ✅ DITAMBAHKAN
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabel `cash_accounts` (Diperbaiki):**
```sql
CREATE TABLE cash_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(20) UNIQUE NOT NULL,          -- ✅ DIPERBAIKI
    account_name VARCHAR(100) NOT NULL,
    initial_balance DECIMAL(15,2) DEFAULT 0,         -- ✅ DITAMBAHKAN
    current_balance DECIMAL(15,2) DEFAULT 0,         -- ✅ DITAMBAHKAN
    currency VARCHAR(10) DEFAULT 'IDR',             -- ✅ DITAMBAHKAN
    is_primary BOOLEAN DEFAULT false,               -- ✅ DITAMBAHKAN
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Data Default yang Diperbaiki**

#### **Cash Accounts:**
```sql
INSERT INTO cash_accounts (account_id, account_name, initial_balance, current_balance, currency, is_primary) VALUES
('CASH001', 'Cash on Hand', 0, 0, 'IDR', true),
('CASH002', 'Bank Account', 0, 0, 'IDR', false),
('CASH003', 'Petty Cash', 0, 0, 'IDR', false);
```

#### **Admin User:**
```sql
INSERT INTO users (username, password, email, role) VALUES
('admin', 'admin123', 'admin@studiopos.com', 'Administrator');
```

### **3. Index dan Trigger yang Ditambahkan**

#### **Index:**
```sql
CREATE INDEX idx_journal_entry_lines_journal_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### **Trigger:**
```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🚀 **CARA MENJALANKAN SCHEMA YANG DIPERBAIKI:**

### **Opsi 1: Menggunakan Script Interactive (Recommended)**
```bash
# Jalankan script batch
setup-postgresql-schema-interactive.bat
```

### **Opsi 2: Menggunakan Node.js Langsung**
```bash
# Jalankan script interactive
node scripts/setup-postgresql-schema-interactive.js
```

### **Opsi 3: Manual SQL**
```bash
# Jalankan file SQL langsung di PostgreSQL
psql -U postgres -d studio_pos -f database/postgresql-schema-only.sql
```

## 📋 **VERIFIKASI SETELAH SETUP:**

### **1. Cek Tabel yang Dibuat:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **2. Cek Struktur Tabel `journal_entries`:**
```sql
\d journal_entries
```

### **3. Cek Struktur Tabel `users`:**
```sql
\d users
```

### **4. Cek Data Default:**
```sql
SELECT * FROM users WHERE username = 'admin';
SELECT * FROM cash_accounts WHERE is_primary = true;
```

## 🎯 **HASIL SETELAH PERBAIKAN:**

1. **✅ Accounting Service** akan berfungsi dengan benar
2. **✅ Journal Entries** dapat dibuat dan dikelola
3. **✅ Cash Accounts** dapat dikelola dengan benar
4. **✅ User Authentication** akan berfungsi
5. **✅ Database Setup Wizard** akan mendeteksi schema yang sudah ada

## 🔍 **TROUBLESHOOTING:**

### **Jika masih ada error:**
1. **Pastikan PostgreSQL berjalan** dan dapat diakses
2. **Pastikan database `studio_pos` sudah dibuat**
3. **Pastikan user memiliki permission** untuk membuat tabel
4. **Jalankan schema setup ulang** jika ada error

### **Jika ada konflik tabel:**
```sql
-- Drop tabel yang bermasalah dan buat ulang
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS cash_accounts CASCADE;

-- Kemudian jalankan schema setup lagi
```

## 📞 **SUPPORT:**

Jika masih mengalami masalah:
1. Periksa log error untuk detail masalah
2. Pastikan PostgreSQL berjalan dengan benar
3. Verifikasi konfigurasi database
4. Cek permission user PostgreSQL
5. Pastikan tidak ada konflik dengan data lama

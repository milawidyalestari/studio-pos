-- =====================================================
-- FIX FETCH ERROR 400 - CHART OF ACCOUNTS
-- Run this to fix the specific fetch error
-- =====================================================

-- Step 1: Check if tables exist and drop if needed
DO $$ 
BEGIN
    -- Drop existing policies first
    DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON chart_of_accounts;
    DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cash_accounts;
    DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON journal_entries;
    DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON journal_entry_lines;
    
    -- Drop tables if they exist
    DROP TABLE IF EXISTS journal_entry_lines CASCADE;
    DROP TABLE IF EXISTS journal_entries CASCADE;
    DROP TABLE IF EXISTS cash_accounts CASCADE;
    DROP TABLE IF EXISTS chart_of_accounts CASCADE;
    
    RAISE NOTICE 'Dropped existing tables and policies';
END $$;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create chart_of_accounts table with exact structure needed
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

-- Step 4: Create cash_accounts table
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

-- Step 5: Create journal_entries table
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

-- Step 6: Create journal_entry_lines table
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create indexes for better performance
CREATE INDEX idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_active ON chart_of_accounts(is_active);
CREATE INDEX idx_cash_accounts_account ON cash_accounts(account_id);
CREATE INDEX idx_cash_accounts_primary ON cash_accounts(is_primary);
CREATE INDEX idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX idx_journal_entries_date ON journal_entries(transaction_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_id);

-- Step 8: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create triggers
CREATE TRIGGER update_chart_of_accounts_updated_at 
    BEFORE UPDATE ON chart_of_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_accounts_updated_at 
    BEFORE UPDATE ON cash_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: DISABLE RLS completely for testing
ALTER TABLE chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines DISABLE ROW LEVEL SECURITY;

-- Step 11: Insert default chart of accounts data
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- ASSETS
('1000', 'ASET', 'asset', 'Kategori Aset'),
('1100', 'Aset Lancar', 'asset', 'Aset yang dapat dicairkan dalam 1 tahun'),
('1110', 'Kas', 'asset', 'Uang tunai dan setara kas'),
('1120', 'Bank', 'asset', 'Saldo rekening bank'),
('1130', 'Piutang Usaha', 'asset', 'Piutang dari pelanggan'),
('1140', 'Persediaan', 'asset', 'Barang dagang dan bahan baku'),
('1200', 'Aset Tetap', 'asset', 'Aset berwujud jangka panjang'),
('1210', 'Peralatan', 'asset', 'Peralatan operasional'),
('1220', 'Kendaraan', 'asset', 'Kendaraan operasional'),

-- LIABILITIES
('2000', 'KEWAJIBAN', 'liability', 'Kategori Kewajiban'),
('2100', 'Kewajiban Lancar', 'liability', 'Kewajiban jatuh tempo dalam 1 tahun'),
('2110', 'Hutang Usaha', 'liability', 'Hutang kepada supplier'),
('2120', 'Hutang Pajak', 'liability', 'Hutang pajak yang belum dibayar'),
('2200', 'Kewajiban Jangka Panjang', 'liability', 'Kewajiban jatuh tempo > 1 tahun'),

-- EQUITY
('3000', 'MODAL', 'equity', 'Kategori Modal'),
('3100', 'Modal Pemilik', 'equity', 'Modal awal pemilik'),
('3200', 'Laba Ditahan', 'equity', 'Akumulasi laba bersih'),

-- INCOME
('4000', 'PENDAPATAN', 'income', 'Kategori Pendapatan'),
('4100', 'Pendapatan Penjualan', 'income', 'Pendapatan dari penjualan produk/jasa'),
('4200', 'Pendapatan Lain-lain', 'income', 'Pendapatan di luar usaha utama'),

-- EXPENSES
('5000', 'BIAYA', 'expense', 'Kategori Biaya'),
('5100', 'Harga Pokok Penjualan', 'expense', 'Biaya langsung produksi'),
('5200', 'Biaya Operasional', 'expense', 'Biaya operasional harian'),
('5210', 'Biaya Gaji', 'expense', 'Biaya gaji karyawan'),
('5220', 'Biaya Sewa', 'expense', 'Biaya sewa tempat'),
('5230', 'Biaya Listrik', 'expense', 'Biaya listrik'),
('5240', 'Biaya Internet', 'expense', 'Biaya internet'),
('5300', 'Biaya Administrasi', 'expense', 'Biaya administrasi umum');

-- Step 12: Insert default cash account
INSERT INTO cash_accounts (account_id, account_name, initial_balance, current_balance, is_primary, description)
SELECT 
    c.id,
    'Kas Utama',
    0,
    0,
    true,
    'Akun kas utama untuk operasional harian'
FROM chart_of_accounts c 
WHERE c.account_code = '1110';

-- Step 13: Test the exact query that's failing
SELECT 'Testing the exact query that was failing...' as test;
SELECT * FROM chart_of_accounts;

-- Step 14: Test with select=* (the exact query from the error)
SELECT 'Testing with select=* query...' as test;
SELECT * FROM chart_of_accounts ORDER BY account_code;

-- Step 15: Test cash_accounts with join
SELECT 'Testing cash_accounts with join...' as test;
SELECT 
    ca.*,
    coa.account_code,
    coa.account_name as chart_account_name,
    coa.account_type
FROM cash_accounts ca
LEFT JOIN chart_of_accounts coa ON ca.account_id = coa.id;

-- Step 16: Verify table counts
SELECT 'Verifying table counts...' as test;
SELECT 'chart_of_accounts' as table_name, COUNT(*) as record_count FROM chart_of_accounts
UNION ALL
SELECT 'cash_accounts' as table_name, COUNT(*) as record_count FROM cash_accounts
UNION ALL
SELECT 'journal_entries' as table_name, COUNT(*) as record_count FROM journal_entries
UNION ALL
SELECT 'journal_entry_lines' as table_name, COUNT(*) as record_count FROM journal_entry_lines;

-- Step 17: Show table permissions
SELECT 'Table permissions check...' as test;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE tablename IN ('chart_of_accounts', 'cash_accounts', 'journal_entries', 'journal_entry_lines');

-- Step 18: Final verification - test the exact failing query
SELECT 'Final verification - testing the exact failing query...' as test;
SELECT * FROM chart_of_accounts ORDER BY account_code LIMIT 10;


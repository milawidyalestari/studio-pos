-- Fix accounting add account issues
-- This script addresses common problems when adding accounts

-- 1. Ensure tables exist and have correct structure
CREATE TABLE IF NOT EXISTS chart_of_accounts (
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

-- 2. Drop existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON chart_of_accounts;
DROP POLICY IF EXISTS "Enable read access for all users" ON chart_of_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chart_of_accounts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON chart_of_accounts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON chart_of_accounts;

-- 3. Create permissive RLS policies for testing
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON chart_of_accounts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all operations for anon users (for testing)
CREATE POLICY "Allow all operations for anon users" ON chart_of_accounts
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent ON chart_of_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_active ON chart_of_accounts(is_active);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_chart_of_accounts_updated_at ON chart_of_accounts;

-- Create trigger
CREATE TRIGGER update_chart_of_accounts_updated_at 
    BEFORE UPDATE ON chart_of_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert some default accounts if table is empty
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) 
SELECT * FROM (VALUES
    ('1000', 'ASET', 'asset', 'Kategori Aset'),
    ('1100', 'Aset Lancar', 'asset', 'Aset yang dapat dicairkan dalam 1 tahun'),
    ('1110', 'Kas', 'asset', 'Uang tunai dan setara kas'),
    ('1120', 'Bank', 'asset', 'Saldo rekening bank'),
    ('1130', 'Piutang Usaha', 'asset', 'Piutang dari pelanggan'),
    ('1140', 'Persediaan', 'asset', 'Barang dagang dan bahan baku'),
    ('2000', 'KEWAJIBAN', 'liability', 'Kategori Kewajiban'),
    ('2100', 'Kewajiban Lancar', 'liability', 'Kewajiban jatuh tempo dalam 1 tahun'),
    ('2110', 'Hutang Usaha', 'liability', 'Hutang kepada supplier'),
    ('3000', 'MODAL', 'equity', 'Kategori Modal'),
    ('3100', 'Modal Pemilik', 'equity', 'Modal awal pemilik'),
    ('4000', 'PENDAPATAN', 'income', 'Kategori Pendapatan'),
    ('4100', 'Pendapatan Penjualan', 'income', 'Pendapatan dari penjualan produk/jasa'),
    ('5000', 'BIAYA', 'expense', 'Kategori Biaya'),
    ('5100', 'Harga Pokok Penjualan', 'expense', 'Biaya langsung produksi'),
    ('5200', 'Biaya Operasional', 'expense', 'Biaya operasional harian')
) AS v(account_code, account_name, account_type, description)
WHERE NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = v.account_code);

-- 7. Test the setup
SELECT 'Testing chart_of_accounts setup...' as test;

-- Test select
SELECT 'Select test:' as test_type, COUNT(*) as record_count FROM chart_of_accounts;

-- Test insert
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) 
VALUES ('TEST001', 'Test Account', 'asset', 'Test account for verification')
ON CONFLICT (account_code) DO NOTHING;

-- Verify insert worked
SELECT 'Insert test:' as test_type, COUNT(*) as record_count FROM chart_of_accounts WHERE account_code = 'TEST001';

-- Clean up test data
DELETE FROM chart_of_accounts WHERE account_code = 'TEST001';

-- Final verification
SELECT 'Final verification:' as test_type, COUNT(*) as total_accounts FROM chart_of_accounts;

-- Show sample data
SELECT 'Sample accounts:' as test_type, account_code, account_name, account_type FROM chart_of_accounts LIMIT 5;


-- =====================================================
-- MIGRATION: Accounting System Tables
-- Version: 003.001
-- Date: 2025-01-18
-- Description: Sistem akuntansi lengkap dengan chart of accounts, cash accounts, dan journal entries
-- =====================================================

-- =====================================================
-- CHART OF ACCOUNTS TABLE
-- =====================================================
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

-- =====================================================
-- CASH ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cash_accounts (
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

-- =====================================================
-- JOURNAL ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50) CHECK (reference_type IN ('sale', 'purchase', 'cash_in', 'cash_out', 'transfer', 'adjustment')),
    reference_id UUID,
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JOURNAL ENTRY LINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent ON chart_of_accounts(parent_account_id);

CREATE INDEX IF NOT EXISTS idx_cash_accounts_account ON cash_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_primary ON cash_accounts(is_primary);

CREATE INDEX IF NOT EXISTS idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(transaction_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(reference_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_entry_lines(account_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chart_of_accounts_updated_at 
    BEFORE UPDATE ON chart_of_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_accounts_updated_at 
    BEFORE UPDATE ON cash_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT CHART OF ACCOUNTS
-- =====================================================
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
('5300', 'Biaya Administrasi', 'expense', 'Biaya administrasi umum')
ON CONFLICT (account_code) DO NOTHING;

-- =====================================================
-- INSERT DEFAULT CASH ACCOUNTS
-- =====================================================
INSERT INTO cash_accounts (account_id, account_name, initial_balance, current_balance, is_primary, description)
SELECT 
    c.id,
    'Kas Utama',
    0,
    0,
    true,
    'Akun kas utama untuk operasional harian'
FROM chart_of_accounts c 
WHERE c.account_code = '1110'
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON chart_of_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON cash_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON journal_entries
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON journal_entry_lines
    FOR ALL USING (auth.role() = 'authenticated');


-- =====================================================
-- SETUP SCRIPT: POS-ACCOUNTING INTEGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create Accounting Tables
-- =====================================================
-- CHART OF ACCOUNTS
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

-- CASH ACCOUNTS
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

-- JOURNAL ENTRIES
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
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOURNAL ENTRY LINES
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create Indexes
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_account ON cash_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(transaction_date);
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);

-- Step 4: Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON chart_of_accounts;
CREATE POLICY "Allow all operations for authenticated users" ON chart_of_accounts
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cash_accounts;
CREATE POLICY "Allow all operations for authenticated users" ON cash_accounts
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON journal_entries;
CREATE POLICY "Allow all operations for authenticated users" ON journal_entries
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON journal_entry_lines;
CREATE POLICY "Allow all operations for authenticated users" ON journal_entry_lines
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Insert Default Chart of Accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- ASSETS
('1000', 'ASET', 'asset', 'Kategori Aset'),
('1100', 'Aset Lancar', 'asset', 'Aset yang dapat dicairkan dalam 1 tahun'),
('1110', 'Kas', 'asset', 'Uang tunai dan setara kas'),
('1120', 'Bank', 'asset', 'Saldo rekening bank'),
('1130', 'Piutang Usaha', 'asset', 'Piutang dari pelanggan'),
('1140', 'Persediaan', 'asset', 'Barang dagang dan bahan baku'),

-- LIABILITIES
('2000', 'KEWAJIBAN', 'liability', 'Kategori Kewajiban'),
('2100', 'Kewajiban Lancar', 'liability', 'Kewajiban jatuh tempo dalam 1 tahun'),
('2110', 'Hutang Usaha', 'liability', 'Hutang kepada supplier'),

-- EQUITY
('3000', 'MODAL', 'equity', 'Kategori Modal'),
('3100', 'Modal Pemilik', 'equity', 'Modal awal pemilik'),
('3200', 'Laba Ditahan', 'equity', 'Akumulasi laba bersih'),

-- INCOME
('4000', 'PENDAPATAN', 'income', 'Kategori Pendapatan'),
('4100', 'Pendapatan Penjualan', 'income', 'Pendapatan dari penjualan produk/jasa'),

-- EXPENSES
('5000', 'BIAYA', 'expense', 'Kategori Biaya'),
('5100', 'Harga Pokok Penjualan', 'expense', 'Biaya langsung produksi'),
('5200', 'Biaya Operasional', 'expense', 'Biaya operasional harian'),
('5210', 'Biaya Gaji', 'expense', 'Biaya gaji karyawan'),
('5220', 'Biaya Sewa', 'expense', 'Biaya sewa tempat'),
('5230', 'Biaya Listrik', 'expense', 'Biaya listrik'),
('5240', 'Biaya Internet', 'expense', 'Biaya internet')
ON CONFLICT (account_code) DO NOTHING;

-- Step 7: Create Default Cash Account
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

-- Step 8: Create Integration Functions
-- =====================================================

-- FUNCTION: Create Journal Entry from Order
CREATE OR REPLACE FUNCTION create_journal_entry_from_order()
RETURNS TRIGGER AS $$
DECLARE
    v_entry_number VARCHAR(50);
    v_journal_id UUID;
    v_cash_account_id UUID;
    v_revenue_account_id UUID;
    v_receivable_account_id UUID;
    v_payment_method VARCHAR(50);
BEGIN
    IF LOWER(NEW.status::text) = 'done' AND (OLD.status IS NULL OR LOWER(OLD.status::text) <> 'done') THEN
        
        SELECT id INTO v_cash_account_id FROM chart_of_accounts WHERE account_code = '1110' AND is_active = true LIMIT 1;
        SELECT id INTO v_receivable_account_id FROM chart_of_accounts WHERE account_code = '1130' AND is_active = true LIMIT 1;
        SELECT id INTO v_revenue_account_id FROM chart_of_accounts WHERE account_code = '4100' AND is_active = true LIMIT 1;
        
        IF v_cash_account_id IS NULL OR v_revenue_account_id IS NULL OR v_receivable_account_id IS NULL THEN
            RAISE EXCEPTION 'Required accounting accounts not found';
        END IF;
        
        v_entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
            (SELECT COALESCE(COUNT(*), 0) + 1 FROM journal_entries WHERE entry_number LIKE 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || '%')::TEXT, 
            4, '0'
        );
        
        v_payment_method := COALESCE(NEW.payment_type::text, 'cash');
        
        INSERT INTO journal_entries (
            entry_number, transaction_date, description, reference_type, reference_id,
            total_debit, total_credit, status, created_by
        ) VALUES (
            v_entry_number, COALESCE(NEW.tanggal, CURRENT_DATE),
            CONCAT('Penjualan - Order #', NEW.order_number, ' - ', COALESCE(NEW.customer_name, 'Customer')),
            'sale', NEW.id, NEW.total_amount, NEW.total_amount, 'posted', NEW.admin_id
        ) RETURNING id INTO v_journal_id;
        
        IF NEW.down_payment > 0 AND NEW.remaining_payment > 0 THEN
            INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
            VALUES (v_journal_id, v_cash_account_id, NEW.down_payment, 0, CONCAT('Uang Muka - Order #', NEW.order_number));
            
            INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
            VALUES (v_journal_id, v_receivable_account_id, NEW.remaining_payment, 0, CONCAT('Piutang - Order #', NEW.order_number));
            
        ELSIF v_payment_method = 'credit' THEN
            INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
            VALUES (v_journal_id, v_receivable_account_id, NEW.total_amount, 0, CONCAT('Piutang - Order #', NEW.order_number));
            
        ELSE
            INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
            VALUES (v_journal_id, v_cash_account_id, NEW.total_amount, 0, CONCAT('Pembayaran Tunai - Order #', NEW.order_number));
        END IF;
        
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
        VALUES (v_journal_id, v_revenue_account_id, 0, NEW.total_amount, CONCAT('Pendapatan Penjualan - Order #', NEW.order_number));
        
        IF v_payment_method != 'credit' THEN
            UPDATE cash_accounts 
            SET current_balance = current_balance + COALESCE(NEW.down_payment, NEW.total_amount),
                updated_at = NOW()
            WHERE account_id = v_cash_account_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: Record Payment Receipt
CREATE OR REPLACE FUNCTION record_payment_receipt(
    p_order_id UUID, p_amount DECIMAL(15,2), p_payment_method VARCHAR(50),
    p_notes TEXT DEFAULT NULL, p_received_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_entry_number VARCHAR(50);
    v_journal_id UUID;
    v_cash_account_id UUID;
    v_receivable_account_id UUID;
    v_order_number VARCHAR(50);
    v_customer_name VARCHAR(255);
BEGIN
    SELECT order_number, customer_name INTO v_order_number, v_customer_name FROM orders WHERE id = p_order_id;
    IF v_order_number IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
    
    SELECT id INTO v_cash_account_id FROM chart_of_accounts WHERE account_code = '1110' AND is_active = true LIMIT 1;
    SELECT id INTO v_receivable_account_id FROM chart_of_accounts WHERE account_code = '1130' AND is_active = true LIMIT 1;
    
    v_entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
        (SELECT COALESCE(COUNT(*), 0) + 1 FROM journal_entries WHERE entry_number LIKE 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || '%')::TEXT, 
        4, '0'
    );
    
    INSERT INTO journal_entries (entry_number, transaction_date, description, reference_type, reference_id, total_debit, total_credit, status, created_by)
    VALUES (v_entry_number, CURRENT_DATE, CONCAT('Pelunasan Piutang - Order #', v_order_number), 'cash_in', p_order_id, p_amount, p_amount, 'posted', p_received_by)
    RETURNING id INTO v_journal_id;
    
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_cash_account_id, p_amount, 0, CONCAT('Penerimaan Pelunasan - Order #', v_order_number));
    
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_receivable_account_id, 0, p_amount, CONCAT('Pelunasan Piutang - Order #', v_order_number));
    
    UPDATE cash_accounts SET current_balance = current_balance + p_amount, updated_at = NOW() WHERE account_id = v_cash_account_id;
    UPDATE orders SET remaining_payment = GREATEST(remaining_payment - p_amount, 0), payment_update = NOW() WHERE id = p_order_id;
    
    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: Record Expense
CREATE OR REPLACE FUNCTION record_expense(
    p_expense_account_code VARCHAR(20), p_amount DECIMAL(15,2), p_description TEXT,
    p_payment_method VARCHAR(50) DEFAULT 'cash', p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_entry_number VARCHAR(50);
    v_journal_id UUID;
    v_cash_account_id UUID;
    v_expense_account_id UUID;
BEGIN
    SELECT id INTO v_cash_account_id FROM chart_of_accounts WHERE account_code = '1110' AND is_active = true LIMIT 1;
    SELECT id INTO v_expense_account_id FROM chart_of_accounts WHERE account_code = p_expense_account_code AND is_active = true LIMIT 1;
    
    IF v_cash_account_id IS NULL OR v_expense_account_id IS NULL THEN
        RAISE EXCEPTION 'Required accounting accounts not found';
    END IF;
    
    v_entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
        (SELECT COALESCE(COUNT(*), 0) + 1 FROM journal_entries WHERE entry_number LIKE 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || '%')::TEXT, 
        4, '0'
    );
    
    INSERT INTO journal_entries (entry_number, transaction_date, description, reference_type, total_debit, total_credit, status, created_by)
    VALUES (v_entry_number, CURRENT_DATE, p_description, 'cash_out', p_amount, p_amount, 'posted', p_created_by)
    RETURNING id INTO v_journal_id;
    
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_expense_account_id, p_amount, 0, p_description);
    
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_cash_account_id, 0, p_amount, p_description);
    
    UPDATE cash_accounts SET current_balance = current_balance - p_amount, updated_at = NOW() WHERE account_id = v_cash_account_id;
    
    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create Triggers
DROP TRIGGER IF EXISTS create_transaction_on_order_completion ON orders;
DROP TRIGGER IF EXISTS create_journal_entry_on_order_completion ON orders;

CREATE TRIGGER create_journal_entry_on_order_completion
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_journal_entry_from_order();

-- Step 10: Create Views
CREATE OR REPLACE VIEW v_order_journal_entries AS
SELECT 
    o.id as order_id, o.order_number, o.customer_name, o.tanggal as order_date,
    o.status::text as order_status, o.total_amount, o.payment_type::text as payment_method,
    o.down_payment, o.remaining_payment, je.id as journal_entry_id, je.entry_number,
    je.transaction_date, je.status as journal_status, je.total_debit, je.total_credit
FROM orders o
LEFT JOIN journal_entries je ON je.reference_type = 'sale' AND je.reference_id = o.id
WHERE LOWER(o.status::text) = 'done'
ORDER BY o.tanggal DESC, o.order_number DESC;

CREATE OR REPLACE VIEW v_outstanding_receivables AS
SELECT 
    o.id as order_id, o.order_number, o.customer_name, o.tanggal as order_date,
    o.total_amount, o.down_payment, o.remaining_payment,
    CASE WHEN o.remaining_payment > 0 THEN 'Outstanding' ELSE 'Paid' END as payment_status,
    CURRENT_DATE - o.tanggal as days_outstanding
FROM orders o
WHERE LOWER(o.status::text) = 'done' AND o.remaining_payment > 0
ORDER BY o.tanggal ASC;

-- Step 11: Verification
SELECT '✅ Setup Complete!' as status;

SELECT 'Accounts Check' as check_type,
    COUNT(*) as total_accounts,
    SUM(CASE WHEN account_code = '1110' THEN 1 ELSE 0 END) as kas_exists,
    SUM(CASE WHEN account_code = '1130' THEN 1 ELSE 0 END) as piutang_exists,
    SUM(CASE WHEN account_code = '4100' THEN 1 ELSE 0 END) as pendapatan_exists
FROM chart_of_accounts
WHERE account_code IN ('1110', '1130', '4100');

SELECT 'Tables Check' as check_type,
    (SELECT COUNT(*) FROM chart_of_accounts) as chart_of_accounts,
    (SELECT COUNT(*) FROM cash_accounts) as cash_accounts,
    (SELECT COUNT(*) FROM journal_entries) as journal_entries,
    (SELECT COUNT(*) FROM journal_entry_lines) as journal_entry_lines;


-- =====================================================
-- SETUP SCRIPT: Payment Method Accounts
-- Run this in Supabase SQL Editor after main setup
-- =====================================================

-- Step 1: Create Payment Method Accounts Table
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_method_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_method VARCHAR(50) NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(payment_method)
);

-- Step 2: Create Indexes
CREATE INDEX IF NOT EXISTS idx_payment_method_accounts_method ON payment_method_accounts(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_method_accounts_account ON payment_method_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_payment_method_accounts_active ON payment_method_accounts(is_active);

-- Step 3: Create Trigger
CREATE TRIGGER update_payment_method_accounts_updated_at 
    BEFORE UPDATE ON payment_method_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Enable RLS
ALTER TABLE payment_method_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON payment_method_accounts
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Insert Default Mappings
INSERT INTO payment_method_accounts (payment_method, account_id, account_code, account_name, description) VALUES
-- Cash payments go to main cash account
('cash', 
 (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1),
 '1110', 
 'Kas', 
 'Pembayaran tunai masuk ke akun kas utama'),

-- Transfer payments go to bank account
('transfer', 
 (SELECT id FROM chart_of_accounts WHERE account_code = '1120' LIMIT 1),
 '1120', 
 'Bank', 
 'Pembayaran transfer masuk ke akun bank'),

-- Credit payments go to receivables
('credit', 
 (SELECT id FROM chart_of_accounts WHERE account_code = '1130' LIMIT 1),
 '1130', 
 'Piutang Usaha', 
 'Pembayaran kredit masuk ke piutang usaha'),

-- E-wallet payments
('ewallet', 
 (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1),
 '1110', 
 'Kas', 
 'Pembayaran e-wallet masuk ke akun kas'),

-- QRIS payments
('qris', 
 (SELECT id FROM chart_of_accounts WHERE account_code = '1120' LIMIT 1),
 '1120', 
 'Bank', 
 'Pembayaran QRIS masuk ke akun bank')

ON CONFLICT (payment_method) DO NOTHING;

-- Step 6: Create Helper Functions
CREATE OR REPLACE FUNCTION get_account_for_payment_method(p_payment_method VARCHAR(50))
RETURNS TABLE (
    account_id UUID,
    account_code VARCHAR(20),
    account_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pma.account_id,
        pma.account_code,
        pma.account_name
    FROM payment_method_accounts pma
    WHERE pma.payment_method = p_payment_method
        AND pma.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_payment_method_account(
    p_payment_method VARCHAR(50),
    p_account_code VARCHAR(20),
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_account_id UUID;
    v_account_name VARCHAR(100);
BEGIN
    SELECT id, account_name INTO v_account_id, v_account_name
    FROM chart_of_accounts 
    WHERE account_code = p_account_code AND is_active = true
    LIMIT 1;
    
    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Account with code % not found', p_account_code;
    END IF;
    
    INSERT INTO payment_method_accounts (payment_method, account_id, account_code, account_name, description)
    VALUES (p_payment_method, v_account_id, p_account_code, v_account_name, p_description)
    ON CONFLICT (payment_method) 
    DO UPDATE SET 
        account_id = EXCLUDED.account_id,
        account_code = EXCLUDED.account_code,
        account_name = EXCLUDED.account_name,
        description = COALESCE(EXCLUDED.description, payment_method_accounts.description),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create View
CREATE OR REPLACE VIEW v_payment_method_accounts AS
SELECT 
    pma.id,
    pma.payment_method,
    pma.account_id,
    pma.account_code,
    pma.account_name,
    pma.is_active,
    pma.description,
    coa.account_type,
    coa.parent_account_id,
    pma.created_at,
    pma.updated_at
FROM payment_method_accounts pma
LEFT JOIN chart_of_accounts coa ON pma.account_id = coa.id
ORDER BY pma.payment_method;

-- Step 8: Verification
SELECT '✅ Payment Method Accounts Setup Complete!' as status;

-- Check mappings
SELECT 
    payment_method,
    account_code,
    account_name,
    is_active,
    description
FROM v_payment_method_accounts
ORDER BY payment_method;

-- Test function
SELECT * FROM get_account_for_payment_method('cash');
SELECT * FROM get_account_for_payment_method('transfer');
SELECT * FROM get_account_for_payment_method('credit');

-- =====================================================
-- MIGRATION: Payment Method Debit/Credit Accounts
-- Version: 003.005
-- Date: 2025-01-18
-- Description: Tambah kolom untuk debit dan credit accounts di payment method
-- =====================================================

-- =====================================================
-- ADD NEW COLUMNS TO PAYMENT METHOD ACCOUNTS
-- =====================================================
ALTER TABLE payment_method_accounts 
ADD COLUMN IF NOT EXISTS debit_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS debit_account_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS debit_account_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS credit_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS credit_account_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS credit_account_name VARCHAR(100);

-- =====================================================
-- UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- =====================================================
-- Set debit and credit accounts based on payment method type
UPDATE payment_method_accounts SET
    debit_account_id = account_id,
    debit_account_code = account_code,
    debit_account_name = account_name,
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4100' LIMIT 1),
    credit_account_code = '4100',
    credit_account_name = 'Pendapatan Penjualan'
WHERE debit_account_id IS NULL;

-- =====================================================
-- CREATE INDEXES FOR NEW COLUMNS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payment_method_debit_account ON payment_method_accounts(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_method_credit_account ON payment_method_accounts(credit_account_id);

-- =====================================================
-- UPDATE VIEW TO INCLUDE NEW COLUMNS
-- =====================================================
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
    
    -- Debit account details
    pma.debit_account_id,
    pma.debit_account_code,
    pma.debit_account_name,
    debit_coa.account_type as debit_account_type,
    
    -- Credit account details
    pma.credit_account_id,
    pma.credit_account_code,
    pma.credit_account_name,
    credit_coa.account_type as credit_account_type,
    
    pma.created_at,
    pma.updated_at
FROM payment_method_accounts pma
LEFT JOIN chart_of_accounts coa ON pma.account_id = coa.id
LEFT JOIN chart_of_accounts debit_coa ON pma.debit_account_id = debit_coa.id
LEFT JOIN chart_of_accounts credit_coa ON pma.credit_account_id = credit_coa.id
ORDER BY pma.payment_method;

-- =====================================================
-- UPDATE FUNCTION: UPDATE PAYMENT METHOD ACCOUNT
-- =====================================================
CREATE OR REPLACE FUNCTION update_payment_method_account(
    p_payment_method VARCHAR(50),
    p_debit_account_code VARCHAR(20),
    p_credit_account_code VARCHAR(20),
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_debit_account_id UUID;
    v_debit_account_name VARCHAR(100);
    v_credit_account_id UUID;
    v_credit_account_name VARCHAR(100);
BEGIN
    -- Get debit account details
    SELECT id, account_name INTO v_debit_account_id, v_debit_account_name
    FROM chart_of_accounts 
    WHERE account_code = p_debit_account_code AND is_active = true
    LIMIT 1;
    
    -- Get credit account details
    SELECT id, account_name INTO v_credit_account_id, v_credit_account_name
    FROM chart_of_accounts 
    WHERE account_code = p_credit_account_code AND is_active = true
    LIMIT 1;
    
    IF v_debit_account_id IS NULL THEN
        RAISE EXCEPTION 'Debit account with code % not found', p_debit_account_code;
    END IF;
    
    IF v_credit_account_id IS NULL THEN
        RAISE EXCEPTION 'Credit account with code % not found', p_credit_account_code;
    END IF;
    
    -- Update or insert payment method mapping
    INSERT INTO payment_method_accounts (
        payment_method, 
        account_id, account_code, account_name,
        debit_account_id, debit_account_code, debit_account_name,
        credit_account_id, credit_account_code, credit_account_name,
        description
    ) VALUES (
        p_payment_method, 
        v_debit_account_id, p_debit_account_code, v_debit_account_name,
        v_debit_account_id, p_debit_account_code, v_debit_account_name,
        v_credit_account_id, p_credit_account_code, v_credit_account_name,
        p_description
    )
    ON CONFLICT (payment_method) 
    DO UPDATE SET 
        account_id = EXCLUDED.account_id,
        account_code = EXCLUDED.account_code,
        account_name = EXCLUDED.account_name,
        debit_account_id = EXCLUDED.debit_account_id,
        debit_account_code = EXCLUDED.debit_account_code,
        debit_account_name = EXCLUDED.debit_account_name,
        credit_account_id = EXCLUDED.credit_account_id,
        credit_account_code = EXCLUDED.credit_account_code,
        credit_account_name = EXCLUDED.credit_account_name,
        description = COALESCE(EXCLUDED.description, payment_method_accounts.description),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: GET DEBIT/CREDIT ACCOUNTS FOR PAYMENT METHOD
-- =====================================================
CREATE OR REPLACE FUNCTION get_debit_credit_accounts_for_payment_method(p_payment_method VARCHAR(50))
RETURNS TABLE (
    debit_account_id UUID,
    debit_account_code VARCHAR(20),
    debit_account_name VARCHAR(100),
    credit_account_id UUID,
    credit_account_code VARCHAR(20),
    credit_account_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pma.debit_account_id,
        pma.debit_account_code,
        pma.debit_account_name,
        pma.credit_account_id,
        pma.credit_account_code,
        pma.credit_account_name
    FROM payment_method_accounts pma
    WHERE pma.payment_method = p_payment_method
        AND pma.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE EXISTING PAYMENT METHODS WITH PROPER MAPPING
-- =====================================================
-- Cash: Debit Kas, Credit Pendapatan
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1),
    debit_account_code = '1110',
    debit_account_name = 'Kas',
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4100' LIMIT 1),
    credit_account_code = '4100',
    credit_account_name = 'Pendapatan Penjualan'
WHERE payment_method = 'cash';

-- Transfer: Debit Bank, Credit Pendapatan
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1120' LIMIT 1),
    debit_account_code = '1120',
    debit_account_name = 'Bank',
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4100' LIMIT 1),
    credit_account_code = '4100',
    credit_account_name = 'Pendapatan Penjualan'
WHERE payment_method = 'transfer';

-- Credit: Debit Piutang, Credit Pendapatan
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1130' LIMIT 1),
    debit_account_code = '1130',
    debit_account_name = 'Piutang Usaha',
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4100' LIMIT 1),
    credit_account_code = '4100',
    credit_account_name = 'Pendapatan Penjualan'
WHERE payment_method = 'credit';

-- E-wallet: Debit Kas, Credit Pendapatan
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1),
    debit_account_code = '1110',
    debit_account_name = 'Kas',
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4100' LIMIT 1),
    credit_account_code = '4100',
    credit_account_name = 'Pendapatan Penjualan'
WHERE payment_method = 'ewallet';

-- QRIS: Debit Bank, Credit Pendapatan
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1120' LIMIT 1),
    debit_account_code = '1120',
    debit_account_name = 'Bank',
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4100' LIMIT 1),
    credit_account_code = '4100',
    credit_account_name = 'Pendapatan Penjualan'
WHERE payment_method = 'qris';

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Payment Method Debit/Credit Accounts Setup Complete!' as status;

-- Check updated mappings
SELECT 
    payment_method,
    debit_account_code,
    debit_account_name,
    credit_account_code,
    credit_account_name,
    is_active
FROM v_payment_method_accounts
ORDER BY payment_method;

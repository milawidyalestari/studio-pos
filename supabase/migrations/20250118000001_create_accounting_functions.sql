-- =====================================================
-- MIGRATION: Accounting Functions
-- Version: 003.002
-- Date: 2025-01-18
-- Description: Fungsi-fungsi untuk sistem akuntansi
-- =====================================================

-- =====================================================
-- UPDATE CASH BALANCE FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_cash_balance(
    p_account_id UUID,
    p_amount DECIMAL(15,2),
    p_type VARCHAR(10)
)
RETURNS VOID AS $$
BEGIN
    IF p_type = 'debit' THEN
        UPDATE cash_accounts 
        SET current_balance = current_balance + p_amount,
            updated_at = NOW()
        WHERE id = p_account_id;
    ELSIF p_type = 'credit' THEN
        UPDATE cash_accounts 
        SET current_balance = current_balance - p_amount,
            updated_at = NOW()
        WHERE id = p_account_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GET TRIAL BALANCE FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_trial_balance()
RETURNS TABLE (
    account_id UUID,
    account_code VARCHAR(20),
    account_name VARCHAR(100),
    account_type VARCHAR(50),
    debit_balance DECIMAL(15,2),
    credit_balance DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        coa.id as account_id,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0) as debit_balance,
        COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0) as credit_balance
    FROM chart_of_accounts coa
    LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
    WHERE coa.is_active = true
    GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type
    ORDER BY coa.account_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GET BALANCE SHEET FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_balance_sheet()
RETURNS TABLE (
    account_id UUID,
    account_code VARCHAR(20),
    account_name VARCHAR(100),
    account_type VARCHAR(50),
    balance DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        coa.id as account_id,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        CASE 
            WHEN coa.account_type IN ('asset', 'expense') THEN
                COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0)
            ELSE
                COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0)
        END as balance
    FROM chart_of_accounts coa
    LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
    WHERE coa.is_active = true
    GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type
    HAVING (
        CASE 
            WHEN coa.account_type IN ('asset', 'expense') THEN
                COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0)
            ELSE
                COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0)
        END
    ) != 0
    ORDER BY coa.account_type, coa.account_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GET PROFIT LOSS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_profit_loss(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    account_id UUID,
    account_code VARCHAR(20),
    account_name VARCHAR(100),
    account_type VARCHAR(50),
    amount DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        coa.id as account_id,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        CASE 
            WHEN coa.account_type IN ('income', 'expense') THEN
                COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0)
            ELSE 0
        END as amount
    FROM chart_of_accounts coa
    LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
        AND je.status = 'posted'
        AND je.transaction_date >= p_start_date 
        AND je.transaction_date <= p_end_date
    WHERE coa.is_active = true 
        AND coa.account_type IN ('income', 'expense')
    GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type
    HAVING (
        COALESCE(SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END), 0)
    ) != 0
    ORDER BY coa.account_type, coa.account_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GENERATE JOURNAL ENTRY NUMBER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION generate_journal_entry_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    entry_number VARCHAR(50);
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get count of entries for today
    SELECT COALESCE(COUNT(*), 0) + 1 INTO counter
    FROM journal_entries 
    WHERE entry_number LIKE entry_number || '%';
    
    -- Format with leading zeros
    entry_number := entry_number || LPAD(counter::TEXT, 4, '0');
    
    RETURN entry_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VALIDATE JOURNAL ENTRY FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION validate_journal_entry(p_journal_entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_debit DECIMAL(15,2);
    total_credit DECIMAL(15,2);
BEGIN
    SELECT 
        COALESCE(SUM(debit_amount), 0),
        COALESCE(SUM(credit_amount), 0)
    INTO total_debit, total_credit
    FROM journal_entry_lines
    WHERE journal_entry_id = p_journal_entry_id;
    
    RETURN ABS(total_debit - total_credit) < 0.01;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POST JOURNAL ENTRY FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION post_journal_entry(p_journal_entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_valid BOOLEAN;
    entry_status VARCHAR(20);
BEGIN
    -- Check if entry exists and is in draft status
    SELECT status INTO entry_status
    FROM journal_entries
    WHERE id = p_journal_entry_id;
    
    IF entry_status IS NULL THEN
        RAISE EXCEPTION 'Journal entry not found';
    END IF;
    
    IF entry_status != 'draft' THEN
        RAISE EXCEPTION 'Journal entry is not in draft status';
    END IF;
    
    -- Validate journal entry
    SELECT validate_journal_entry(p_journal_entry_id) INTO is_valid;
    
    IF NOT is_valid THEN
        RAISE EXCEPTION 'Journal entry is not balanced';
    END IF;
    
    -- Update status to posted
    UPDATE journal_entries
    SET status = 'posted',
        updated_at = NOW()
    WHERE id = p_journal_entry_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


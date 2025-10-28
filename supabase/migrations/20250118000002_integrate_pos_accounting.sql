-- =====================================================
-- MIGRATION: POS-Accounting Integration
-- Version: 003.003
-- Date: 2025-01-18
-- Description: Integrasi otomatis antara POS dan sistem akuntansi
-- =====================================================

-- =====================================================
-- FUNCTION: CREATE JOURNAL ENTRY FROM ORDER
-- Membuat jurnal entry otomatis saat order selesai
-- =====================================================
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
    -- Only create journal entry if status changed to 'Done'
    IF LOWER(NEW.status::text) = 'done' AND (OLD.status IS NULL OR LOWER(OLD.status::text) <> 'done') THEN
        
        -- Get debit/credit account IDs from payment method mapping
        SELECT 
            pma.debit_account_id,
            pma.credit_account_id
        INTO v_cash_account_id, v_revenue_account_id
        FROM payment_method_accounts pma
        WHERE pma.payment_method = v_payment_method 
            AND pma.is_active = true
        LIMIT 1;
        
        -- Fallback to default accounts if no mapping found
        IF v_cash_account_id IS NULL THEN
            SELECT id INTO v_cash_account_id 
            FROM chart_of_accounts 
            WHERE account_code = '1110' AND is_active = true
            LIMIT 1;
        END IF;
        
        IF v_revenue_account_id IS NULL THEN
            SELECT id INTO v_revenue_account_id 
            FROM chart_of_accounts 
            WHERE account_code = '4100' AND is_active = true
            LIMIT 1;
        END IF;
        
        -- Piutang Usaha account (1130) - for credit payments
        SELECT id INTO v_receivable_account_id 
        FROM chart_of_accounts 
        WHERE account_code = '1130' AND is_active = true
        LIMIT 1;
        
        -- Validate accounts exist
        IF v_cash_account_id IS NULL OR v_revenue_account_id IS NULL OR v_receivable_account_id IS NULL THEN
            RAISE EXCEPTION 'Required accounting accounts not found. Please setup chart of accounts and payment method mappings first.';
        END IF;
        
        -- Generate journal entry number
        v_entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
            (SELECT COALESCE(COUNT(*), 0) + 1 FROM journal_entries WHERE entry_number LIKE 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || '%')::TEXT, 
            4, 
            '0'
        );
        
        -- Determine payment method
        v_payment_method := COALESCE(NEW.payment_type::text, 'cash');
        
        -- Create journal entry
        INSERT INTO journal_entries (
            entry_number,
            transaction_date,
            description,
            reference_type,
            reference_id,
            total_debit,
            total_credit,
            status,
            created_by
        ) VALUES (
            v_entry_number,
            COALESCE(NEW.tanggal, CURRENT_DATE),
            CONCAT('Penjualan - Order #', NEW.order_number, ' - ', COALESCE(NEW.customer_name, 'Customer')),
            'sale',
            NEW.id,
            NEW.total_amount,
            NEW.total_amount,
            'posted', -- Auto post for completed orders
            NEW.admin_id
        ) RETURNING id INTO v_journal_id;
        
        -- Create journal entry lines based on payment status
        IF NEW.down_payment > 0 AND NEW.remaining_payment > 0 THEN
            -- Partial payment scenario
            -- Debit: Kas (for down payment)
            INSERT INTO journal_entry_lines (
                journal_entry_id,
                account_id,
                debit_amount,
                credit_amount,
                description
            ) VALUES (
                v_journal_id,
                v_cash_account_id,
                NEW.down_payment,
                0,
                CONCAT('Uang Muka - Order #', NEW.order_number)
            );
            
            -- Debit: Piutang Usaha (for remaining)
            INSERT INTO journal_entry_lines (
                journal_entry_id,
                account_id,
                debit_amount,
                credit_amount,
                description
            ) VALUES (
                v_journal_id,
                v_receivable_account_id,
                NEW.remaining_payment,
                0,
                CONCAT('Piutang - Order #', NEW.order_number)
            );
            
        ELSIF v_payment_method = 'credit' THEN
            -- Full credit scenario
            -- Debit: Piutang Usaha
            INSERT INTO journal_entry_lines (
                journal_entry_id,
                account_id,
                debit_amount,
                credit_amount,
                description
            ) VALUES (
                v_journal_id,
                v_receivable_account_id,
                NEW.total_amount,
                0,
                CONCAT('Piutang - Order #', NEW.order_number)
            );
            
        ELSE
            -- Full cash payment scenario
            -- Debit: Kas
            INSERT INTO journal_entry_lines (
                journal_entry_id,
                account_id,
                debit_amount,
                credit_amount,
                description
            ) VALUES (
                v_journal_id,
                v_cash_account_id,
                NEW.total_amount,
                0,
                CONCAT('Pembayaran Tunai - Order #', NEW.order_number)
            );
        END IF;
        
        -- Credit: Pendapatan Penjualan
        INSERT INTO journal_entry_lines (
            journal_entry_id,
            account_id,
            debit_amount,
            credit_amount,
            description
        ) VALUES (
            v_journal_id,
            v_revenue_account_id,
            0,
            NEW.total_amount,
            CONCAT('Pendapatan Penjualan - Order #', NEW.order_number)
        );
        
        -- Update account balance based on payment method
        IF v_payment_method != 'credit' THEN
            -- Update the mapped debit account balance
            -- Check if it's a cash account (1110) or bank account (1120)
            IF EXISTS (SELECT 1 FROM chart_of_accounts WHERE id = v_cash_account_id AND account_code = '1110') THEN
                -- Update cash account
                UPDATE cash_accounts 
                SET current_balance = current_balance + COALESCE(NEW.down_payment, NEW.total_amount),
                    updated_at = NOW()
                WHERE account_id = v_cash_account_id;
            ELSE
                -- For other accounts (bank, e-wallet, etc.), update cash_accounts as fallback
                -- In production, you might want to create separate balance tracking for each account type
                UPDATE cash_accounts 
                SET current_balance = current_balance + COALESCE(NEW.down_payment, NEW.total_amount),
                    updated_at = NOW()
                WHERE account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1);
            END IF;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: RECORD PAYMENT RECEIPT
-- Mencatat penerimaan pembayaran piutang
-- =====================================================
CREATE OR REPLACE FUNCTION record_payment_receipt(
    p_order_id UUID,
    p_amount DECIMAL(15,2),
    p_payment_method VARCHAR(50),
    p_notes TEXT DEFAULT NULL,
    p_received_by UUID DEFAULT NULL
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
    -- Get order info
    SELECT order_number, customer_name INTO v_order_number, v_customer_name
    FROM orders WHERE id = p_order_id;
    
    IF v_order_number IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    -- Get account IDs
    SELECT id INTO v_cash_account_id 
    FROM chart_of_accounts 
    WHERE account_code = '1110' AND is_active = true
    LIMIT 1;
    
    SELECT id INTO v_receivable_account_id 
    FROM chart_of_accounts 
    WHERE account_code = '1130' AND is_active = true
    LIMIT 1;
    
    IF v_cash_account_id IS NULL OR v_receivable_account_id IS NULL THEN
        RAISE EXCEPTION 'Required accounting accounts not found';
    END IF;
    
    -- Generate journal entry number
    v_entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
        (SELECT COALESCE(COUNT(*), 0) + 1 FROM journal_entries WHERE entry_number LIKE 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || '%')::TEXT, 
        4, 
        '0'
    );
    
    -- Create journal entry for payment receipt
    INSERT INTO journal_entries (
        entry_number,
        transaction_date,
        description,
        reference_type,
        reference_id,
        total_debit,
        total_credit,
        status,
        created_by
    ) VALUES (
        v_entry_number,
        CURRENT_DATE,
        CONCAT('Pelunasan Piutang - Order #', v_order_number, ' - ', COALESCE(v_customer_name, 'Customer')),
        'cash_in',
        p_order_id,
        p_amount,
        p_amount,
        'posted',
        p_received_by
    ) RETURNING id INTO v_journal_id;
    
    -- Debit: Kas
    INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES (
        v_journal_id,
        v_cash_account_id,
        p_amount,
        0,
        CONCAT('Penerimaan Pelunasan - Order #', v_order_number, COALESCE(' - ' || p_notes, ''))
    );
    
    -- Credit: Piutang Usaha
    INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES (
        v_journal_id,
        v_receivable_account_id,
        0,
        p_amount,
        CONCAT('Pelunasan Piutang - Order #', v_order_number)
    );
    
    -- Update cash account balance
    UPDATE cash_accounts 
    SET current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE account_id = v_cash_account_id;
    
    -- Update order remaining payment
    UPDATE orders 
    SET remaining_payment = GREATEST(remaining_payment - p_amount, 0),
        payment_update = NOW()
    WHERE id = p_order_id;
    
    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: RECORD EXPENSE
-- Mencatat pengeluaran kas
-- =====================================================
CREATE OR REPLACE FUNCTION record_expense(
    p_expense_account_code VARCHAR(20),
    p_amount DECIMAL(15,2),
    p_description TEXT,
    p_payment_method VARCHAR(50) DEFAULT 'cash',
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_entry_number VARCHAR(50);
    v_journal_id UUID;
    v_cash_account_id UUID;
    v_expense_account_id UUID;
BEGIN
    -- Get account IDs
    SELECT id INTO v_cash_account_id 
    FROM chart_of_accounts 
    WHERE account_code = '1110' AND is_active = true
    LIMIT 1;
    
    SELECT id INTO v_expense_account_id 
    FROM chart_of_accounts 
    WHERE account_code = p_expense_account_code AND is_active = true
    LIMIT 1;
    
    IF v_cash_account_id IS NULL OR v_expense_account_id IS NULL THEN
        RAISE EXCEPTION 'Required accounting accounts not found';
    END IF;
    
    -- Generate journal entry number
    v_entry_number := 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(
        (SELECT COALESCE(COUNT(*), 0) + 1 FROM journal_entries WHERE entry_number LIKE 'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || '%')::TEXT, 
        4, 
        '0'
    );
    
    -- Create journal entry
    INSERT INTO journal_entries (
        entry_number,
        transaction_date,
        description,
        reference_type,
        reference_id,
        total_debit,
        total_credit,
        status,
        created_by
    ) VALUES (
        v_entry_number,
        CURRENT_DATE,
        p_description,
        'cash_out',
        NULL,
        p_amount,
        p_amount,
        'posted',
        p_created_by
    ) RETURNING id INTO v_journal_id;
    
    -- Debit: Expense Account
    INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES (
        v_journal_id,
        v_expense_account_id,
        p_amount,
        0,
        p_description
    );
    
    -- Credit: Kas
    INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES (
        v_journal_id,
        v_cash_account_id,
        0,
        p_amount,
        p_description
    );
    
    -- Update cash account balance
    UPDATE cash_accounts 
    SET current_balance = current_balance - p_amount,
        updated_at = NOW()
    WHERE account_id = v_cash_account_id;
    
    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DROP OLD TRIGGER IF EXISTS
-- =====================================================
DROP TRIGGER IF EXISTS create_transaction_on_order_completion ON orders;
DROP TRIGGER IF EXISTS create_journal_entry_on_order_completion ON orders;

-- =====================================================
-- CREATE NEW TRIGGER
-- =====================================================
CREATE TRIGGER create_journal_entry_on_order_completion
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_journal_entry_from_order();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- View to check POS-Accounting integration status
CREATE OR REPLACE VIEW v_order_journal_entries AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.customer_name,
    o.tanggal as order_date,
    o.status::text as order_status,
    o.total_amount,
    o.payment_type::text as payment_method,
    o.down_payment,
    o.remaining_payment,
    je.id as journal_entry_id,
    je.entry_number,
    je.transaction_date,
    je.status as journal_status,
    je.total_debit,
    je.total_credit
FROM orders o
LEFT JOIN journal_entries je ON je.reference_type = 'sale' AND je.reference_id = o.id
WHERE LOWER(o.status::text) = 'done'
ORDER BY o.tanggal DESC, o.order_number DESC;

-- =====================================================
-- HELPER VIEW: Sales Summary by Period
-- =====================================================
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT 
    DATE_TRUNC('day', je.transaction_date) as date,
    COUNT(DISTINCT je.id) as total_transactions,
    SUM(je.total_debit) as total_sales,
    SUM(CASE WHEN o.payment_type::text = 'cash' THEN je.total_debit ELSE 0 END) as cash_sales,
    SUM(CASE WHEN o.payment_type::text = 'transfer' THEN je.total_debit ELSE 0 END) as transfer_sales,
    SUM(CASE WHEN o.payment_type::text = 'credit' THEN je.total_debit ELSE 0 END) as credit_sales
FROM journal_entries je
LEFT JOIN orders o ON je.reference_id = o.id AND je.reference_type = 'sale'
WHERE je.reference_type = 'sale' AND je.status = 'posted'
GROUP BY DATE_TRUNC('day', je.transaction_date)
ORDER BY date DESC;

-- =====================================================
-- HELPER VIEW: Outstanding Receivables
-- =====================================================
CREATE OR REPLACE VIEW v_outstanding_receivables AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.customer_name,
    o.tanggal as order_date,
    o.total_amount,
    o.down_payment,
    o.remaining_payment,
    CASE 
        WHEN o.remaining_payment > 0 THEN 'Outstanding'
        ELSE 'Paid'
    END as payment_status,
    CURRENT_DATE - o.tanggal as days_outstanding
FROM orders o
WHERE LOWER(o.status::text) = 'done' 
    AND o.remaining_payment > 0
ORDER BY o.tanggal ASC;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'POS-Accounting Integration Setup Complete!' as status;

-- Check if accounts exist
SELECT 
    'Accounts Check' as check_type,
    COUNT(*) as total_accounts,
    SUM(CASE WHEN account_code = '1110' THEN 1 ELSE 0 END) as kas_exists,
    SUM(CASE WHEN account_code = '1130' THEN 1 ELSE 0 END) as piutang_exists,
    SUM(CASE WHEN account_code = '4100' THEN 1 ELSE 0 END) as pendapatan_exists
FROM chart_of_accounts
WHERE account_code IN ('1110', '1130', '4100');


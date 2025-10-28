-- =====================================================
-- SCRIPT: Perbaiki Masalah Akun Kas
-- =====================================================

-- 1. Pastikan akun 1110 ada di chart of accounts
INSERT INTO chart_of_accounts (
    account_code,
    account_name,
    account_type,
    parent_account_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    '1110',
    'Kas',
    'asset',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM chart_of_accounts WHERE account_code = '1110'
);

-- 2. Pastikan akun 4100 ada di chart of accounts
INSERT INTO chart_of_accounts (
    account_code,
    account_name,
    account_type,
    parent_account_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    '4100',
    'Pendapatan Penjualan',
    'income',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM chart_of_accounts WHERE account_code = '4100'
);

-- 3. Buat cash account jika belum ada
INSERT INTO cash_accounts (
    account_id,
    account_name,
    current_balance,
    is_primary,
    description,
    created_at,
    updated_at
)
SELECT 
    coa.id,
    'Kas Utama',
    0,
    true,
    'Akun kas utama untuk transaksi penjualan',
    NOW(),
    NOW()
FROM chart_of_accounts coa
WHERE coa.account_code = '1110'
AND NOT EXISTS (
    SELECT 1 FROM cash_accounts ca 
    WHERE ca.account_id = coa.id
);

-- 4. Buat payment method mapping untuk cash
INSERT INTO payment_method_accounts (
    payment_method,
    debit_account_code,
    credit_account_code,
    description,
    is_active,
    created_at,
    updated_at
)
SELECT 
    'cash',
    '1110',
    '4100',
    'Pembayaran tunai masuk ke kas',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM payment_method_accounts 
    WHERE payment_method = 'cash'
);

-- 5. Buat payment method mapping untuk transfer
INSERT INTO payment_method_accounts (
    payment_method,
    debit_account_code,
    credit_account_code,
    description,
    is_active,
    created_at,
    updated_at
)
SELECT 
    'transfer',
    '1120',
    '4100',
    'Transfer bank masuk ke bank',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM payment_method_accounts 
    WHERE payment_method = 'transfer'
);

-- 6. Pastikan akun 1120 ada untuk transfer
INSERT INTO chart_of_accounts (
    account_code,
    account_name,
    account_type,
    parent_account_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    '1120',
    'Bank',
    'asset',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM chart_of_accounts WHERE account_code = '1120'
);

-- 7. Pastikan akun 1130 ada untuk piutang
INSERT INTO chart_of_accounts (
    account_code,
    account_name,
    account_type,
    parent_account_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    '1130',
    'Piutang Usaha',
    'asset',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM chart_of_accounts WHERE account_code = '1130'
);

-- 8. Buat payment method mapping untuk credit
INSERT INTO payment_method_accounts (
    payment_method,
    debit_account_code,
    credit_account_code,
    description,
    is_active,
    created_at,
    updated_at
)
SELECT 
    'credit',
    '1130',
    '4100',
    'Kredit masuk ke piutang',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM payment_method_accounts 
    WHERE payment_method = 'credit'
);

-- 9. Recreate trigger function (pastikan menggunakan mapping)
CREATE OR REPLACE FUNCTION create_journal_entry_from_order()
RETURNS TRIGGER AS $$
DECLARE
    v_entry_number VARCHAR(50);
    v_journal_id UUID;
    v_cash_account_id UUID;
    v_revenue_account_id UUID;
    v_receivable_account_id UUID;
    v_payment_method VARCHAR(50);
    v_debit_account_code VARCHAR(20);
    v_credit_account_code VARCHAR(20);
    v_debit_account_id UUID;
BEGIN
    -- Only create journal entry if status changed to 'Done'
    IF LOWER(NEW.status::text) = 'done' AND (OLD.status IS NULL OR LOWER(OLD.status::text) <> 'done') THEN
        
        -- Get account IDs
        SELECT id INTO v_cash_account_id 
        FROM chart_of_accounts 
        WHERE account_code = '1110' AND is_active = true
        LIMIT 1;
        
        SELECT id INTO v_revenue_account_id 
        FROM chart_of_accounts 
        WHERE account_code = '4100' AND is_active = true
        LIMIT 1;
        
        SELECT id INTO v_receivable_account_id 
        FROM chart_of_accounts 
        WHERE account_code = '1130' AND is_active = true
        LIMIT 1;
        
        -- Check if required accounts exist
        IF v_cash_account_id IS NULL OR v_revenue_account_id IS NULL THEN
            RAISE EXCEPTION 'Required accounting accounts not found (1110 or 4100)';
        END IF;
        
        -- Determine payment method
        v_payment_method := COALESCE(NEW.payment_type::text, 'cash');
        
        -- Get payment method mapping
        SELECT debit_account_code, credit_account_code 
        INTO v_debit_account_code, v_credit_account_code
        FROM payment_method_accounts 
        WHERE payment_method = v_payment_method 
        AND is_active = true
        LIMIT 1;
        
        -- If no mapping found, use default (cash)
        IF v_debit_account_code IS NULL THEN
            v_debit_account_code := '1110';
            v_credit_account_code := '4100';
        END IF;
        
        -- Get debit account ID
        SELECT id INTO v_debit_account_id
        FROM chart_of_accounts 
        WHERE account_code = v_debit_account_code AND is_active = true
        LIMIT 1;
        
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
            COALESCE(NEW.tanggal, CURRENT_DATE),
            CONCAT('Penjualan - Order #', NEW.order_number, ' - ', COALESCE(NEW.customer_name, 'Customer')),
            'sale',
            NEW.id,
            NEW.total_amount,
            NEW.total_amount,
            'posted',
            NEW.admin_id
        ) RETURNING id INTO v_journal_id;
        
        -- Create journal entry lines based on payment status
        IF NEW.down_payment > 0 AND NEW.remaining_payment > 0 THEN
            -- Partial payment scenario
            -- Debit: Cash (for down payment)
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
            -- Credit payment - debit piutang
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
            -- Cash/Transfer/E-wallet - debit sesuai mapping
            INSERT INTO journal_entry_lines (
                journal_entry_id,
                account_id,
                debit_amount,
                credit_amount,
                description
            ) VALUES (
                v_journal_id,
                v_debit_account_id,
                NEW.total_amount,
                0,
                CONCAT('Pembayaran ', v_payment_method, ' - Order #', NEW.order_number)
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
            CONCAT('Pendapatan - Order #', NEW.order_number)
        );
        
        -- Update account balance based on payment method
        IF v_payment_method != 'credit' THEN
            -- Update the mapped debit account balance
            IF v_debit_account_code = '1110' THEN
                -- Update cash account
                UPDATE cash_accounts 
                SET current_balance = current_balance + COALESCE(NEW.down_payment, NEW.total_amount),
                    updated_at = NOW()
                WHERE account_id = v_cash_account_id;
            END IF;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Recreate trigger
DROP TRIGGER IF EXISTS create_journal_entry_on_order_completion ON orders;
CREATE TRIGGER create_journal_entry_on_order_completion
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_journal_entry_from_order();

-- 11. Verifikasi setup
SELECT 'Setup Complete!' as status;

SELECT 'Cash Account Check' as check_type,
    ca.account_name,
    ca.current_balance,
    coa.account_code
FROM cash_accounts ca
JOIN chart_of_accounts coa ON ca.account_id = coa.id
WHERE coa.account_code = '1110';

SELECT 'Payment Method Mapping Check' as check_type,
    payment_method,
    debit_account_code,
    credit_account_code,
    is_active
FROM payment_method_accounts
WHERE is_active = true
ORDER BY payment_method;



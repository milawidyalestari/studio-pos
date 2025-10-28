-- =====================================================
-- SCRIPT: Cek Trigger dan Functions untuk Akun Kas
-- =====================================================

-- 1. Cek apakah trigger ada
SELECT 
    'Trigger Check' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'create_journal_entry_on_order_completion';

-- 2. Cek apakah function ada
SELECT 
    'Function Check' as check_type,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'create_journal_entry_from_order';

-- 3. Cek akun kas
SELECT 
    'Cash Accounts' as check_type,
    id,
    account_name,
    current_balance,
    is_primary,
    created_at
FROM cash_accounts
ORDER BY created_at DESC;

-- 4. Cek chart of accounts untuk akun 1110
SELECT 
    'Chart of Accounts 1110' as check_type,
    id,
    account_code,
    account_name,
    account_type,
    is_active
FROM chart_of_accounts 
WHERE account_code = '1110';

-- 5. Cek orders dengan status done
SELECT 
    'Orders Done' as check_type,
    id,
    order_number,
    customer_name,
    total_amount,
    payment_type,
    status,
    tanggal
FROM orders 
WHERE LOWER(status::text) = 'done'
ORDER BY tanggal DESC
LIMIT 10;

-- 6. Cek journal entries untuk penjualan
SELECT 
    'Journal Entries' as check_type,
    id,
    entry_number,
    transaction_date,
    description,
    total_debit,
    total_credit,
    status,
    reference_id
FROM journal_entries 
WHERE reference_type = 'sale'
ORDER BY transaction_date DESC
LIMIT 10;

-- 7. Cek journal entry lines untuk akun kas
SELECT 
    'Journal Entry Lines for Cash' as check_type,
    jel.id,
    jel.debit_amount,
    jel.credit_amount,
    jel.description,
    coa.account_code,
    coa.account_name,
    je.entry_number,
    je.transaction_date
FROM journal_entry_lines jel
JOIN chart_of_accounts coa ON jel.account_id = coa.id
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE coa.account_code = '1110'
ORDER BY je.transaction_date DESC
LIMIT 10;

-- 8. Cek payment method mapping
SELECT 
    'Payment Method Mapping' as check_type,
    id,
    payment_method,
    debit_account_code,
    credit_account_code,
    is_active,
    created_at
FROM payment_method_accounts
WHERE is_active = true
ORDER BY created_at DESC;

-- 9. Test trigger dengan order dummy (jika ada)
-- HATI-HATI: Ini akan membuat data test
-- Uncomment jika ingin test trigger
/*
INSERT INTO orders (
    order_number,
    customer_name,
    total_amount,
    payment_type,
    status,
    tanggal,
    admin_id
) VALUES (
    'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'Test Customer',
    100000,
    'cash',
    'pending',
    CURRENT_DATE,
    (SELECT id FROM auth.users LIMIT 1)
) RETURNING id;

-- Update status ke done untuk trigger
UPDATE orders 
SET status = 'done' 
WHERE order_number LIKE 'TEST-%' 
AND status = 'pending'
RETURNING id, order_number, status;
*/

-- 10. Cek saldo kas terakhir
SELECT 
    'Current Cash Balance' as check_type,
    account_name,
    current_balance,
    updated_at
FROM cash_accounts
WHERE is_primary = true
ORDER BY updated_at DESC
LIMIT 1;



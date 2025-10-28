-- =====================================================
-- VERIFY TRIGGER INSTALLATION
-- Description: Script sederhana untuk verifikasi trigger terinstall
-- =====================================================

-- Method 1: Cek trigger dengan query yang kompatibel
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'orders' AND t.tgname = 'trigger_update_payment_update_enhanced';

-- Method 2: Cek semua trigger di tabel orders
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'orders';

-- Method 3: Cek function yang dibuat
SELECT 
    proname as function_name,
    prokind as function_type
FROM pg_proc 
WHERE proname IN (
    'update_payment_update_timestamp_enhanced',
    'initialize_payment_update_all',
    'reset_payment_update',
    'get_payment_history'
);

-- Method 4: Cek view yang dibuat
SELECT 
    schemaname,
    viewname
FROM pg_views 
WHERE viewname = 'orders_payment_status';

-- Method 5: Test sederhana - cek apakah ada data di orders
SELECT 
    COUNT(*) as total_orders,
    COUNT(payment_update) as orders_with_payment_update
FROM orders;

-- =====================================================
-- MIGRATION STATUS CHECKER
-- =====================================================
-- Description: Script untuk mengecek status migration
-- Date: 2025-01-01
-- Version: 1.0.0
-- =====================================================

\echo ''
\echo '=========================================='
\echo '  MIGRATION STATUS CHECKER'
\echo '=========================================='
\echo ''

-- =====================================================
-- DATABASE INFORMATION
-- =====================================================
\echo 'Database Information:'
\echo '==================='

SELECT 
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;

\echo ''

-- =====================================================
-- EXTENSION CHECK
-- =====================================================
\echo 'Required Extensions:'
\echo '==================='

SELECT 
    extname as extension_name,
    extversion as version,
    CASE 
        WHEN extname = 'uuid-ossp' THEN '✅ Required for UUID generation'
        WHEN extname = 'pg_cron' THEN '✅ Optional for scheduled jobs'
        ELSE '📦 Available'
    END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_cron')
UNION ALL
SELECT 
    'uuid-ossp' as extension_name,
    'NOT INSTALLED' as version,
    '❌ MISSING - Required!' as status
WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp');

\echo ''

-- =====================================================
-- ENUM TYPES CHECK
-- =====================================================
\echo 'Enum Types Status:'
\echo '=================='

SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN (
    'customer_level', 'employee_status', 'payment_type', 
    'order_status', 'transaction_type', 'notification_type'
)
GROUP BY t.typname
ORDER BY t.typname;

\echo ''

-- =====================================================
-- TABLES CHECK
-- =====================================================
\echo 'Tables Status:'
\echo '=============='

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('categories', 'products', 'customers', 'suppliers', 'employees') 
        THEN '🔵 Core Table'
        WHEN table_name IN ('orders', 'materials', 'transaction_master', 'notifications')
        THEN '🟢 Business Table'
        WHEN table_name IN ('roles', 'role_permissions', 'product_materials', 'inventory_movements')
        THEN '🟡 System Table'
        ELSE '⚪ Other'
    END as category,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN '✅ Table'
        WHEN table_type = 'VIEW' THEN '👁️ View'
        ELSE table_type
    END as type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
ORDER BY 
    CASE 
        WHEN table_name IN ('categories', 'products', 'customers', 'suppliers', 'employees') THEN 1
        WHEN table_name IN ('orders', 'materials', 'transaction_master', 'notifications') THEN 2
        WHEN table_name IN ('roles', 'role_permissions', 'product_materials', 'inventory_movements') THEN 3
        ELSE 4
    END,
    table_name;

\echo ''

-- =====================================================
-- FUNCTIONS CHECK
-- =====================================================
\echo 'Functions Status:'
\echo '================'

SELECT 
    routine_name as function_name,
    routine_type as type,
    CASE 
        WHEN routine_name LIKE '%updated_at%' THEN '🔄 Timestamp Function'
        WHEN routine_name LIKE '%transaction%' THEN '💰 Transaction Function'
        WHEN routine_name LIKE '%notification%' THEN '🔔 Notification Function'
        ELSE '⚙️ Other Function'
    END as category
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

\echo ''

-- =====================================================
-- TRIGGERS CHECK
-- =====================================================
\echo 'Triggers Status:'
\echo '==============='

SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing || ' ' || string_agg(event_manipulation, ', ') as trigger_events
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
GROUP BY trigger_name, event_object_table, action_timing
ORDER BY event_object_table, trigger_name;

\echo ''

-- =====================================================
-- DATA SAMPLE CHECK
-- =====================================================
\echo 'Data Sample Check:'
\echo '=================='

-- Check if tables have data
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_tup_ins DESC;

\echo ''

-- =====================================================
-- MIGRATION RECOMMENDATIONS
-- =====================================================
\echo 'Migration Recommendations:'
\echo '=========================='

-- Check admin user exists
\echo 'Admin User Status:'
\echo '=================='

SELECT 
    e.kode,
    e.nama,
    e.username,
    e.role,
    e.status,
    CASE 
        WHEN e.username = 'admin' AND e.role = 'Administrator' THEN '✅ Default Admin User'
        ELSE '⚠️ Custom User'
    END as user_type
FROM employees e
WHERE e.username IS NOT NULL
ORDER BY e.created_at;

\echo ''

-- Check missing core tables
WITH required_tables AS (
    SELECT unnest(ARRAY[
        'categories', 'products', 'customers', 'suppliers', 'employees',
        'orders', 'materials', 'transaction_master', 'notifications',
        'roles', 'role_permissions'
    ]) as table_name
),
existing_tables AS (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
)
SELECT 
    rt.table_name,
    CASE 
        WHEN et.table_name IS NOT NULL THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.table_name = et.table_name
ORDER BY 
    CASE WHEN et.table_name IS NULL THEN 1 ELSE 2 END,
    rt.table_name;

\echo ''
\echo '=========================================='
\echo '  STATUS CHECK COMPLETED'
\echo '=========================================='
\echo ''












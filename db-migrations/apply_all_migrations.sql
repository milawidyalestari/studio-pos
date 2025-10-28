-- =====================================================
-- STUDIO POS - DATABASE MIGRATION SCRIPT
-- =====================================================
-- Description: Script untuk menjalankan semua migration
-- Date: 2025-01-01
-- Version: 1.0.0
-- =====================================================

\echo ''
\echo '=========================================='
\echo '  STUDIO POS - DATABASE MIGRATION'
\echo '=========================================='
\echo ''

-- =====================================================
-- PHASE 1: CORE SCHEMA
-- =====================================================
\echo 'Phase 1: Setting up core schema...'
\i 01-core-schema/000_naming_standards.sql
\i 01-core-schema/001_initial_database_setup.sql
\echo '✓ Core schema completed'
\echo ''

-- =====================================================
-- PHASE 2: ADDITIONAL TABLES
-- =====================================================
\echo 'Phase 2: Creating additional tables...'
\i 02-tables/001_orders_table.sql
\i 02-tables/002_materials_inventory.sql
\i 02-tables/003_transaction_master.sql
\i 02-tables/004_notifications_table.sql
\echo '✓ Additional tables completed'
\echo ''

-- =====================================================
-- PHASE 3: FUNCTIONS & TRIGGERS
-- =====================================================
\echo 'Phase 3: Setting up functions and triggers...'
\i 04-functions-triggers/001_transaction_functions.sql
\i 04-functions-triggers/002_payment_update_trigger.sql
\echo '✓ Functions and triggers completed'
\echo ''

-- =====================================================
-- PHASE 4: DATA SEEDING
-- =====================================================
\echo 'Phase 4: Seeding default data...'
\i 05-data-seeds/001_default_categories.sql
\i 05-data-seeds/001_default_admin_user.sql
\echo '✓ Data seeding completed'
\echo ''

-- =====================================================
-- PHASE 5: PERMISSIONS SETUP
-- =====================================================
\echo 'Phase 5: Setting up roles and permissions...'
\i 06-permissions/001_roles_and_permissions.sql
\i 06-permissions/002_default_roles_data.sql
\echo '✓ Permissions setup completed'
\echo ''

-- =====================================================
-- VERIFICATION
-- =====================================================
\echo 'Verifying migration results...'
\echo ''

SELECT 
    'Tables Created' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

SELECT 
    'Functions Created' as check_type,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION';

SELECT 
    'Triggers Created' as check_type,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

SELECT 
    'Categories Seeded' as check_type,
    COUNT(*) as count
FROM categories;

SELECT 
    'Roles Created' as check_type,
    COUNT(*) as count
FROM roles;

SELECT 
    'Admin Users Created' as check_type,
    COUNT(*) as count
FROM employees 
WHERE username = 'admin' AND role = 'Administrator';

\echo ''
\echo '=========================================='
\echo '  MIGRATION COMPLETED SUCCESSFULLY!'
\echo '=========================================='
\echo ''
\echo 'Database is ready for Studio POS application.'
\echo 'Default admin user: admin/admin123'
\echo ''

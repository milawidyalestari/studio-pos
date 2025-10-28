-- =====================================================
-- STUDIO POS - DATABASE ROLLBACK SCRIPT
-- =====================================================
-- Description: Script untuk rollback semua migration
-- ⚠️  WARNING: Script ini akan menghapus semua data!
-- Date: 2025-01-01
-- Version: 1.0.0
-- =====================================================

\echo ''
\echo '=========================================='
\echo '  STUDIO POS - DATABASE ROLLBACK'
\echo '=========================================='
\echo '⚠️  WARNING: This will delete all data!'
\echo ''

-- Prompt for confirmation (remove comment if needed)
-- \prompt 'Are you sure you want to proceed? (yes/no): ' confirm

-- =====================================================
-- PHASE 1: DROP PERMISSIONS
-- =====================================================
\echo 'Phase 1: Removing permissions...'
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
\echo '✓ Permissions removed'
\echo ''

-- =====================================================
-- PHASE 2: DROP FUNCTIONS & TRIGGERS
-- =====================================================
\echo 'Phase 2: Removing functions and triggers...'
DROP FUNCTION IF EXISTS generate_transaction_code() CASCADE;
DROP FUNCTION IF EXISTS update_transaction_master_updated_at() CASCADE;
DROP FUNCTION IF EXISTS auto_generate_transaction_code() CASCADE;
DROP FUNCTION IF EXISTS update_payment_update_timestamp() CASCADE;
DROP FUNCTION IF EXISTS initialize_payment_update() CASCADE;
\echo '✓ Functions and triggers removed'
\echo ''

-- =====================================================
-- PHASE 3: DROP TABLES (in reverse dependency order)
-- =====================================================
\echo 'Phase 3: Removing tables...'

-- Drop dependent tables first
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS product_materials CASCADE;
DROP TABLE IF EXISTS transaction_master CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Drop materials table
DROP TABLE IF EXISTS materials CASCADE;

-- Drop core tables
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop enums
DROP TYPE IF EXISTS order_status CASCADE;

\echo '✓ Tables removed'
\echo ''

-- =====================================================
-- PHASE 4: DROP CORE FUNCTIONS
-- =====================================================
\echo 'Phase 4: Removing core functions...'
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
\echo '✓ Core functions removed'
\echo ''

-- =====================================================
-- VERIFICATION
-- =====================================================
\echo 'Verifying rollback results...'
\echo ''

SELECT 
    'Remaining Tables' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%';

SELECT 
    'Remaining Functions' as check_type,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%';

\echo ''
\echo '=========================================='
\echo '  ROLLBACK COMPLETED SUCCESSFULLY!'
\echo '=========================================='
\echo ''
\echo 'Database has been reset to initial state.'
\echo 'Note: Extensions (like uuid-ossp) are preserved.'
\echo ''












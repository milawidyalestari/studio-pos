-- =====================================================
-- CLEANUP OLD MIGRATIONS SCRIPT
-- =====================================================
-- Description: Script untuk membersihkan migration lama yang berantakan
-- ⚠️  WARNING: Jalankan script ini untuk cleanup migration lama
-- Date: 2025-01-01
-- Version: 1.0.0
-- =====================================================

\echo ''
\echo '=========================================='
\echo '  CLEANUP OLD MIGRATIONS'
\echo '=========================================='
\echo '⚠️  This will organize old migration files'
\echo ''

-- =====================================================
-- STEP 1: CREATE ARCHIVE DIRECTORY
-- =====================================================
\echo 'Step 1: Creating archive directory...'

-- Move old supabase migrations to archive
-- (This should be done manually via file system)

\echo 'Manual steps required:'
\echo '1. Create folder: supabase/migrations/archive/'
\echo '2. Move these files to archive:'
\echo '   - All files with UUID naming (20250614131207-xxxx.sql)'
\echo '   - Duplicate payment update files'
\echo '   - Test data files (pink_summit.sql)'
\echo ''

-- =====================================================
-- STEP 2: CONSOLIDATE SIMILAR MIGRATIONS
-- =====================================================
\echo 'Step 2: Files to consolidate:'
\echo ''

\echo 'PAYMENT UPDATE MIGRATIONS (5 files) → Keep only:'
\echo '- 20250115000000_add_payment_update_field.sql'
\echo '- 20250115000004_add_payment_update_trigger.sql'
\echo ''

\echo 'MATERIALS MIGRATIONS (6 files) → Consolidate to:'
\echo '- One comprehensive materials migration'
\echo ''

\echo 'UUID NAMED FILES (15 files) → Review and consolidate'
\echo ''

-- =====================================================
-- STEP 3: RECOMMENDED NEW STRUCTURE
-- =====================================================
\echo 'Step 3: Recommended new structure:'
\echo ''

\echo 'KEEP these organized migrations:'
\echo '├── 20250101000000_create_role_permissions_table.sql'
\echo '├── 20250116000000_create_notifications_table.sql'  
\echo '├── 20250117000000_create_transaction_master_table.sql'
\echo '├── 20250622172548_add_positions_table.sql'
\echo '├── 20250624124335_create_order_statuses_table.sql'
\echo '├── 20250710190000_create_roles_table.sql'
\echo '├── 20250710190100_insert_default_roles.sql'
\echo '└── 20250711190000_create_inventory_movements_table.sql'
\echo ''

\echo 'ARCHIVE these problematic files:'
\echo '├── All UUID-named files (20250614xxxxxx-uuid.sql)'
\echo '├── Duplicate payment files'
\echo '├── Test data files'
\echo '└── Redundant migrations'
\echo ''

-- =====================================================
-- STEP 4: VERIFICATION QUERIES
-- =====================================================
\echo 'Step 4: Use these queries to verify cleanup:'
\echo ''

\echo 'Count migration files:'
\echo 'ls -la supabase/migrations/*.sql | wc -l'
\echo ''

\echo 'Find duplicate patterns:'
\echo 'ls supabase/migrations/*payment*.sql'
\echo 'ls supabase/migrations/*material*.sql'
\echo 'ls supabase/migrations/*-*-*.sql'
\echo ''

-- =====================================================
-- STEP 5: FINAL RECOMMENDATIONS
-- =====================================================
\echo 'Step 5: Final recommendations:'
\echo ''

\echo '✅ ACTIONS TO TAKE:'
\echo '1. Use organized db-migrations/ for new development'
\echo '2. Keep supabase/migrations/ for existing production'
\echo '3. Gradually migrate from old to new structure'
\echo '4. Archive problematic files for reference'
\echo ''

\echo '🎯 TARGET STATE:'
\echo '• < 15 files in supabase/migrations/'
\echo '• Clear, descriptive names'
\echo '• No duplicate functionality'
\echo '• Proper dependency order'
\echo ''

\echo '=========================================='
\echo '  CLEANUP GUIDE COMPLETED'
\echo '=========================================='
\echo ''












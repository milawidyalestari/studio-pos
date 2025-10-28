-- Test script for default admin user migration
-- This script can be run to verify the admin user was created correctly

\echo 'Testing Default Admin User Migration...'
\echo '======================================'

-- Check if admin user exists
SELECT 
    'Admin User Check' as test_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Admin user exists'
        ELSE '❌ FAIL - Admin user not found'
    END as result
FROM employees 
WHERE username = 'admin' AND role = 'Administrator';

-- Check admin user details
SELECT 
    'Admin User Details' as test_type,
    kode,
    nama,
    username,
    role,
    status,
    CASE 
        WHEN password = 'admin123' THEN '✅ Password set correctly'
        ELSE '⚠️ Password may be hashed or different'
    END as password_status
FROM employees 
WHERE username = 'admin';

-- Check if Administrator role exists
SELECT 
    'Administrator Role Check' as test_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Administrator role exists'
        ELSE '❌ FAIL - Administrator role not found'
    END as result
FROM roles 
WHERE name = 'Administrator';

-- Check admin permissions count
SELECT 
    'Admin Permissions Check' as test_type,
    COUNT(*) as permission_count,
    CASE 
        WHEN COUNT(*) >= 40 THEN '✅ PASS - Sufficient permissions'
        ELSE '⚠️ WARNING - May have insufficient permissions'
    END as result
FROM role_permissions 
WHERE role = 'Administrator';

-- Summary
\echo ''
\echo 'Migration Test Summary:'
\echo '======================'
\echo 'If all tests show ✅ PASS, the migration was successful!'
\echo 'Default login credentials: admin/admin123'
\echo ''

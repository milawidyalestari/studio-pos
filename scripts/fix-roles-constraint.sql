-- =====================================================
-- FIX ROLES ISSUE - Remove problematic foreign key constraints
-- Run this in Supabase SQL Editor to fix role disappearing issue
-- =====================================================

-- Step 1: Check current constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name = 'employees' OR tc.table_name = 'role_permissions')
  AND tc.table_schema = 'public';

-- Step 2: Drop problematic foreign key constraints
-- This prevents roles from being deleted when referenced by employees
DROP CONSTRAINT IF EXISTS fk_employees_role;
DROP CONSTRAINT IF EXISTS fk_role_permissions_role;

-- Step 3: Verify roles table has data
SELECT 'Current roles:' as info;
SELECT id, name, description FROM roles ORDER BY name;

-- Step 4: Check employees with roles
SELECT 'Employees with roles:' as info;
SELECT id, nama, username, role FROM employees WHERE role IS NOT NULL ORDER BY nama;

-- Step 5: Check role permissions
SELECT 'Role permissions count:' as info;
SELECT role, COUNT(*) as permission_count 
FROM role_permissions 
GROUP BY role 
ORDER BY role;

-- Step 6: Insert missing default roles if needed
INSERT INTO roles (name, description) VALUES
  ('Administrator', 'Akses penuh ke seluruh sistem'),
  ('Manager', 'Akses manajemen dan monitoring'),
  ('Supervisor', 'Akses supervisor dan pengawasan'),
  ('Cashier', 'Akses kasir dan transaksi'),
  ('Designer', 'Akses fitur desain dan file'),
  ('Staff', 'Akses staff umum'),
  ('Viewer', 'Hanya bisa melihat data')
ON CONFLICT (name) DO NOTHING;

-- Step 7: Final verification
SELECT 'Final roles verification:' as info;
SELECT COUNT(*) as total_roles FROM roles;
SELECT name FROM roles ORDER BY name;

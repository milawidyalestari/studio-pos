-- =====================================================
-- MIGRATION: Default Admin User Creation
-- Version: 005.001
-- Date: 2025-07-12
-- Description: Create default administrator user for first-time setup
-- =====================================================

-- =====================================================
-- INSERT DEFAULT ADMIN USER
-- =====================================================
INSERT INTO employees (
    id,
    kode,
    nama,
    posisi,
    status,
    username,
    password,
    role,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'ADMIN001',
    'Administrator',
    'System Administrator',
    'Active',
    'admin',
    'admin123', -- In production, this should be hashed
    'Administrator',
    now(),
    now()
) ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- ENSURE ADMINISTRATOR ROLE EXISTS
-- =====================================================
INSERT INTO roles (name, description)
VALUES ('Administrator', 'Akses penuh ke seluruh sistem')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CREATE ROLE PERMISSIONS TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    menu VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role, menu, action)
);

-- =====================================================
-- INSERT ADMINISTRATOR PERMISSIONS (FULL ACCESS)
-- =====================================================
INSERT INTO role_permissions (role, menu, action, allowed)
SELECT 
    'Administrator' as role,
    menu_actions.menu,
    menu_actions.action,
    true as allowed
FROM (
    VALUES 
        ('Dashboard', 'view_stats'),
        ('Dashboard', 'view_orders'),
        ('Dashboard', 'view_income'),
        ('Dashboard', 'view_calendar'),
        ('Dashboard', 'view_inbox'),
        ('Orderan', 'view_orders'),
        ('Orderan', 'create_order'),
        ('Orderan', 'edit_order'),
        ('Orderan', 'delete_order'),
        ('Orderan', 'print_spk'),
        ('Orderan', 'print_nota'),
        ('Orderan', 'change_status'),
        ('Transaction', 'view_transactions'),
        ('Transaction', 'print_receipt'),
        ('Transaction', 'export_data'),
        ('Transaction', 'filter_data'),
        ('Finance', 'view_finance'),
        ('Finance', 'view_profit_loss'),
        ('Finance', 'view_cash_flow'),
        ('Finance', 'manage_expenses'),
        ('Finance', 'financial_reports'),
        ('Inventory', 'view_inventory'),
        ('Inventory', 'add_stock'),
        ('Inventory', 'adjust_stock'),
        ('Inventory', 'view_materials'),
        ('Inventory', 'manage_stock_minimum'),
        ('Master Data', 'view_products'),
        ('Master Data', 'manage_products'),
        ('Master Data', 'view_customers'),
        ('Master Data', 'manage_customers'),
        ('Master Data', 'view_suppliers'),
        ('Master Data', 'manage_suppliers'),
        ('Master Data', 'view_employees'),
        ('Master Data', 'manage_employees'),
        ('Report', 'view_reports'),
        ('Report', 'daily_reports'),
        ('Report', 'monthly_reports'),
        ('Report', 'export_reports'),
        ('Report', 'financial_analysis'),
        ('Settings', 'view_settings'),
        ('Settings', 'program_settings'),
        ('Settings', 'database_settings'),
        ('Settings', 'hardware_settings'),
        ('Settings', 'user_management'),
        ('Settings', 'role_management'),
        ('Settings', 'system_tools')
) AS menu_actions(menu, action)
ON CONFLICT (role, menu, action) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
    e.kode,
    e.nama,
    e.username,
    e.role,
    e.status,
    COUNT(rp.id) as permission_count
FROM employees e
LEFT JOIN role_permissions rp ON e.role = rp.role
WHERE e.username = 'admin'
GROUP BY e.kode, e.nama, e.username, e.role, e.status;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Default admin user created successfully';
    RAISE NOTICE 'Username: admin';
    RAISE NOTICE 'Password: admin123';
    RAISE NOTICE 'Role: Administrator';
END $$;

-- =====================================================
-- MIGRATION: Default Roles and Permissions Data
-- Version: 006.002
-- Date: 2025-07-10
-- Description: Insert default roles dan permissions
-- =====================================================

-- =====================================================
-- INSERT DEFAULT ROLES
-- =====================================================
INSERT INTO roles (name, description) VALUES
    ('Administrator', 'Akses penuh ke seluruh sistem'),
    ('Manager', 'Akses managerial dengan kontrol penuh kecuali pengaturan sistem'),
    ('Kasir', 'Akses kasir dan transaksi'),
    ('Desain', 'Akses fitur desain dan file'),
    ('Produksi', 'Akses fitur produksi dan proses cetak'),
    ('Owner', 'Akses monitoring dan laporan'),
    ('Viewer', 'Hanya bisa melihat data')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ADMINISTRATOR PERMISSIONS (Full Access)
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
-- MANAGER PERMISSIONS
-- =====================================================
INSERT INTO role_permissions (role, menu, action, allowed)
SELECT 
    'Manager' as role,
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
        ('Orderan', 'print_spk'),
        ('Orderan', 'print_nota'),
        ('Orderan', 'change_status'),
        ('Transaction', 'view_transactions'),
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
        ('Report', 'view_reports'),
        ('Report', 'daily_reports'),
        ('Report', 'monthly_reports'),
        ('Report', 'export_reports'),
        ('Report', 'financial_analysis'),
        ('Settings', 'view_settings'),
        ('Settings', 'program_settings')
) AS menu_actions(menu, action)
ON CONFLICT (role, menu, action) DO NOTHING;

-- =====================================================
-- KASIR PERMISSIONS
-- =====================================================
INSERT INTO role_permissions (role, menu, action, allowed)
SELECT 
    'Kasir' as role,
    menu_actions.menu,
    menu_actions.action,
    true as allowed
FROM (
    VALUES 
        ('Dashboard', 'view_orders'),
        ('Dashboard', 'view_calendar'),
        ('Orderan', 'view_orders'),
        ('Orderan', 'create_order'),
        ('Orderan', 'print_nota'),
        ('Transaction', 'view_transactions'),
        ('Transaction', 'print_receipt'),
        ('Master Data', 'view_products'),
        ('Master Data', 'view_customers'),
        ('Master Data', 'manage_customers'),
        ('Settings', 'view_settings')
) AS menu_actions(menu, action)
ON CONFLICT (role, menu, action) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
    r.name,
    COUNT(rp.id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.name = rp.role
GROUP BY r.name
ORDER BY r.name;












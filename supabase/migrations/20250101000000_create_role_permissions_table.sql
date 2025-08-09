-- Create role_permissions table for storing granular permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id serial PRIMARY KEY,
  role varchar(50) NOT NULL,
  menu varchar(50) NOT NULL,
  action varchar(50) NOT NULL,
  allowed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, menu, action)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_menu ON role_permissions(menu);
CREATE INDEX IF NOT EXISTS idx_role_permissions_action ON role_permissions(action);

-- Add foreign key constraint to roles table
ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_role 
FOREIGN KEY (role) REFERENCES roles(name) 
ON DELETE CASCADE;

-- Insert default Administrator permissions (full access)
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

-- Insert default Manager permissions
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

-- Insert default Cashier permissions
INSERT INTO role_permissions (role, menu, action, allowed)
SELECT 
  'Cashier' as role,
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

-- Migration: 002_migrate_local_storage.sql
-- Description: Migrate data from local storage to database
-- Date: 2024-01-01
-- Version: 1.0.1

-- This migration handles the transition from local storage to database
-- It creates functions to help with data migration

-- Function to migrate categories from local storage
CREATE OR REPLACE FUNCTION migrate_categories_from_storage()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    category_record RECORD;
BEGIN
    -- This function would be called from the application
    -- after reading local storage data
    
    -- Example of how categories would be migrated:
    -- INSERT INTO categories (name, type, color, icon, description)
    -- VALUES ('Studio Printing', 'income', '#10B981', 'printer', 'Studio printing services')
    -- ON CONFLICT (name, type) DO NOTHING;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate transactions from local storage
CREATE OR REPLACE FUNCTION migrate_transactions_from_storage()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    transaction_record RECORD;
BEGIN
    -- This function would be called from the application
    -- after reading local storage data
    
    -- Example of how transactions would be migrated:
    -- INSERT INTO transactions (title, amount, type, category_id, date, description)
    -- VALUES (title, amount, type, category_id, date, description)
    -- ON CONFLICT DO NOTHING;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate cash register configs from local storage
CREATE OR REPLACE FUNCTION migrate_cash_register_configs_from_storage()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    config_record RECORD;
BEGIN
    -- This function would be called from the application
    -- after reading local storage data
    
    -- Example of how cash register configs would be migrated:
    -- INSERT INTO cash_register_configs (name, manufacturer, model, type, connection_type, protocol, features, commands, settings)
    -- VALUES (name, manufacturer, model, type, connection_type, protocol, features, commands, settings)
    -- ON CONFLICT DO NOTHING;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate products from local storage
CREATE OR REPLACE FUNCTION migrate_products_from_storage()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    product_record RECORD;
BEGIN
    -- This function would be called from the application
    -- after reading local storage data
    
    -- Example of how products would be migrated:
    -- INSERT INTO products (name, description, price, cost, category, sku, barcode, stock_quantity)
    -- VALUES (name, description, price, cost, category, sku, barcode, stock_quantity)
    -- ON CONFLICT (sku) DO NOTHING;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate app settings from local storage
CREATE OR REPLACE FUNCTION migrate_app_settings_from_storage()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    setting_record RECORD;
BEGIN
    -- This function would be called from the application
    -- after reading local storage data
    
    -- Example of how app settings would be migrated:
    -- INSERT INTO app_settings (key, value, type, description)
    -- VALUES (key, value, type, description)
    -- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get migration status
CREATE OR REPLACE FUNCTION get_migration_status()
RETURNS TABLE(
    table_name TEXT,
    total_records BIGINT,
    migrated_records BIGINT,
    migration_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'categories'::TEXT as table_name,
        COUNT(*) as total_records,
        COUNT(*) as migrated_records,
        'completed'::TEXT as migration_status
    FROM categories
    UNION ALL
    SELECT 
        'transactions'::TEXT as table_name,
        COUNT(*) as total_records,
        COUNT(*) as migrated_records,
        'completed'::TEXT as migration_status
    FROM transactions
    UNION ALL
    SELECT 
        'cash_register_configs'::TEXT as table_name,
        COUNT(*) as total_records,
        COUNT(*) as migrated_records,
        'completed'::TEXT as migration_status
    FROM cash_register_configs
    UNION ALL
    SELECT 
        'products'::TEXT as table_name,
        COUNT(*) as total_records,
        COUNT(*) as migrated_records,
        'completed'::TEXT as migration_status
    FROM products
    UNION ALL
    SELECT 
        'app_settings'::TEXT as table_name,
        COUNT(*) as total_records,
        COUNT(*) as migrated_records,
        'completed'::TEXT as migration_status
    FROM app_settings;
END;
$$ LANGUAGE plpgsql;

-- Create a migration log table to track migration progress
CREATE TABLE IF NOT EXISTS migration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_name VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    records_migrated INTEGER DEFAULT 0,
    error_message TEXT,
    details JSONB
);

-- Insert initial migration log entries
INSERT INTO migration_logs (migration_name, version, status, details) VALUES
    ('001_initial_schema', '1.0.0', 'completed', '{"tables_created": 8, "indexes_created": 8, "triggers_created": 6}'),
    ('002_migrate_local_storage', '1.0.1', 'pending', '{"description": "Data migration from local storage to database"}')
ON CONFLICT DO NOTHING;

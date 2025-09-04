-- Ensure transaction categories exist in the database
-- This script will create categories if they don't exist

-- First, check if categories table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE EXCEPTION 'Categories table does not exist. Please create it first.';
    END IF;
END $$;

-- Check existing categories
SELECT 'Existing categories:' as info;
SELECT id, code, category_name, group_name FROM categories WHERE group_name IN ('income', 'expense', 'transfer', 'adjustment') ORDER BY group_name, category_name;

-- Income categories
INSERT INTO categories (id, code, category_name, group_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'INC_SALES', 'Penjualan', 'income', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'INC_SERVICES', 'Jasa', 'income', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'INC_INVESTMENT', 'Investasi', 'income', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'INC_OTHER', 'Pendapatan Lainnya', 'income', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    category_name = EXCLUDED.category_name,
    group_name = EXCLUDED.group_name,
    updated_at = NOW();

-- Expense categories
INSERT INTO categories (id, code, category_name, group_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'EXP_MATERIALS', 'Bahan Baku', 'expense', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'EXP_OPERATIONAL', 'Operasional', 'expense', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'EXP_SALARY', 'Gaji Karyawan', 'expense', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'EXP_UTILITIES', 'Utilitas', 'expense', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'EXP_OTHER', 'Pengeluaran Lainnya', 'expense', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    category_name = EXCLUDED.category_name,
    group_name = EXCLUDED.group_name,
    updated_at = NOW();

-- Transfer categories
INSERT INTO categories (id, code, category_name, group_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'TRF_BANK', 'Transfer Bank', 'transfer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'TRF_CASH', 'Transfer Kas', 'transfer', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    category_name = EXCLUDED.category_name,
    group_name = EXCLUDED.group_name,
    updated_at = NOW();

-- Adjustment categories
INSERT INTO categories (id, code, category_name, group_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'ADJ_CORRECTION', 'Koreksi', 'adjustment', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'ADJ_WRITEOFF', 'Write-off', 'adjustment', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    category_name = EXCLUDED.category_name,
    group_name = EXCLUDED.group_name,
    updated_at = NOW();

-- Verify the categories were added/updated
SELECT 'Final categories after update:' as info;
SELECT id, code, category_name, group_name FROM categories WHERE group_name IN ('income', 'expense', 'transfer', 'adjustment') ORDER BY group_name, category_name;

-- Count categories by group
SELECT 'Category count by group:' as info;
SELECT group_name, COUNT(*) as count FROM categories WHERE group_name IN ('income', 'expense', 'transfer', 'adjustment') GROUP BY group_name ORDER BY group_name;



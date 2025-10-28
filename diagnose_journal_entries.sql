-- Diagnostic script to check journal_entries table structure
-- This will help us understand what columns actually exist

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journal_entries') 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as table_status;

-- If table exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;

-- Count total columns
SELECT COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'journal_entries';

-- Check for specific columns we need
SELECT 
    column_name,
    CASE 
        WHEN column_name = 'id' THEN '✓ ID column exists'
        WHEN column_name = 'entry_number' THEN '✓ Entry number column exists'
        WHEN column_name = 'transaction_date' THEN '✓ Transaction date column exists'
        WHEN column_name = 'description' THEN '✓ Description column exists'
        WHEN column_name = 'reference_type' THEN '✓ Reference type column exists'
        WHEN column_name = 'reference_id' THEN '✓ Reference ID column exists'
        WHEN column_name = 'total_debit' THEN '✓ Total debit column exists'
        WHEN column_name = 'total_credit' THEN '✓ Total credit column exists'
        WHEN column_name = 'status' THEN '✓ Status column exists'
        WHEN column_name = 'created_at' THEN '✓ Created at column exists'
        WHEN column_name = 'updated_at' THEN '✓ Updated at column exists'
        ELSE '? Unknown column: ' || column_name
    END as status
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;

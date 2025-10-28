-- Fix for missing is_primary column in cash_accounts table
-- This script adds the column if it doesn't exist

-- Check if the column exists, and add it if it doesn't
DO $$
BEGIN
    -- Check if is_primary column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cash_accounts' 
        AND column_name = 'is_primary'
    ) THEN
        -- Add the is_primary column
        ALTER TABLE cash_accounts 
        ADD COLUMN is_primary BOOLEAN DEFAULT false;
        
        -- Set the first cash account as primary if none exists
        UPDATE cash_accounts 
        SET is_primary = true 
        WHERE id = (
            SELECT id 
            FROM cash_accounts 
            ORDER BY created_at ASC 
            LIMIT 1
        );
        
        RAISE NOTICE 'Added is_primary column to cash_accounts table';
    ELSE
        RAISE NOTICE 'is_primary column already exists in cash_accounts table';
    END IF;
END $$;

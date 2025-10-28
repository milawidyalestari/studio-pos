-- Fix for missing columns in journal_entries table
-- This script adds missing columns if they don't exist

DO $$
BEGIN
    -- Check and add entry_number column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'entry_number'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN entry_number VARCHAR(50);
        
        -- Generate entry numbers for existing records if any
        UPDATE journal_entries 
        SET entry_number = 'JE' || EXTRACT(YEAR FROM created_at)::TEXT || 
                          LPAD(EXTRACT(MONTH FROM created_at)::TEXT, 2, '0') || 
                          LPAD(EXTRACT(DAY FROM created_at)::TEXT, 2, '0') || 
                          LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 6, '0')
        WHERE entry_number IS NULL;
        
        -- Add unique constraint
        ALTER TABLE journal_entries 
        ADD CONSTRAINT journal_entries_entry_number_key UNIQUE (entry_number);
        
        -- Make it NOT NULL
        ALTER TABLE journal_entries 
        ALTER COLUMN entry_number SET NOT NULL;
        
        RAISE NOTICE 'Added entry_number column to journal_entries table';
    ELSE
        RAISE NOTICE 'entry_number column already exists in journal_entries table';
    END IF;

    -- Check and add reference_type column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'reference_type'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN reference_type VARCHAR(50);
        
        RAISE NOTICE 'Added reference_type column to journal_entries table';
    ELSE
        RAISE NOTICE 'reference_type column already exists in journal_entries table';
    END IF;

    -- Check and add reference_id column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN reference_id UUID;
        
        RAISE NOTICE 'Added reference_id column to journal_entries table';
    ELSE
        RAISE NOTICE 'reference_id column already exists in journal_entries table';
    END IF;

    -- Check and add total_debit column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'total_debit'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN total_debit DECIMAL(15,2) DEFAULT 0;
        
        RAISE NOTICE 'Added total_debit column to journal_entries table';
    ELSE
        RAISE NOTICE 'total_debit column already exists in journal_entries table';
    END IF;

    -- Check and add total_credit column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'total_credit'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN total_credit DECIMAL(15,2) DEFAULT 0;
        
        RAISE NOTICE 'Added total_credit column to journal_entries table';
    ELSE
        RAISE NOTICE 'total_credit column already exists in journal_entries table';
    END IF;

    -- Check and add status column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        
        RAISE NOTICE 'Added status column to journal_entries table';
    ELSE
        RAISE NOTICE 'status column already exists in journal_entries table';
    END IF;

    -- Check and add created_by column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN created_by VARCHAR(100);
        
        RAISE NOTICE 'Added created_by column to journal_entries table';
    ELSE
        RAISE NOTICE 'created_by column already exists in journal_entries table';
    END IF;

    -- Check and add approved_by column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN approved_by VARCHAR(100);
        
        RAISE NOTICE 'Added approved_by column to journal_entries table';
    ELSE
        RAISE NOTICE 'approved_by column already exists in journal_entries table';
    END IF;

END $$;

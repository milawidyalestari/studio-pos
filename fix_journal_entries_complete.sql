-- Complete fix for journal_entries table structure
-- This script recreates the table with the correct structure

-- First, let's check what columns actually exist
DO $$
DECLARE
    column_count INTEGER;
    table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'journal_entries'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Count existing columns
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries';
        
        RAISE NOTICE 'journal_entries table exists with % columns', column_count;
        
        -- List existing columns
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'journal_entries'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Column: % (type: %)', rec.column_name, rec.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'journal_entries table does not exist';
    END IF;
END $$;

-- Drop and recreate the table with correct structure
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;

-- Create journal_entries table with correct structure
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entry_lines table
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id VARCHAR(20) NOT NULL,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_transaction_date ON journal_entries(transaction_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX idx_journal_entry_lines_journal ON journal_entry_lines(journal_entry_id);

-- Add constraints
ALTER TABLE journal_entry_lines 
ADD CONSTRAINT check_debit_credit_not_both_zero 
CHECK (debit_amount > 0 OR credit_amount > 0);

ALTER TABLE journal_entry_lines 
ADD CONSTRAINT check_debit_credit_not_both_positive 
CHECK (NOT (debit_amount > 0 AND credit_amount > 0));

-- Insert sample data if table is empty
INSERT INTO journal_entries (entry_number, transaction_date, description, reference_type, status)
SELECT 
    'JE' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 6, '0'),
    NOW(),
    'Sample Journal Entry',
    'adjustment',
    'draft'
WHERE NOT EXISTS (SELECT 1 FROM journal_entries LIMIT 1);

RAISE NOTICE 'journal_entries table recreated successfully with correct structure';

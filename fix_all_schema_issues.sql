-- Fix All Schema Issues for Studio POS
-- This script fixes all missing columns and tables

-- =====================================================
-- FIX SUPPLIERS TABLE
-- =====================================================

-- Add payment_terms column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN payment_terms VARCHAR(50);
        RAISE NOTICE 'Added payment_terms column to suppliers table';
    END IF;
END $$;

-- Add credit_limit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' AND column_name = 'credit_limit'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN credit_limit DECIMAL(15,2);
        RAISE NOTICE 'Added credit_limit column to suppliers table';
    END IF;
END $$;

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to suppliers table';
    END IF;
END $$;

-- =====================================================
-- FIX JOURNAL_ENTRIES TABLE
-- =====================================================

-- Add entry_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'entry_number'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN entry_number VARCHAR(50);
        RAISE NOTICE 'Added entry_number column to journal_entries table';
    END IF;
END $$;

-- Add transaction_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'transaction_date'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added transaction_date column to journal_entries table';
    END IF;
END $$;

-- Add reference_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'reference_type'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN reference_type VARCHAR(50);
        RAISE NOTICE 'Added reference_type column to journal_entries table';
    END IF;
END $$;

-- Add reference_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN reference_id UUID;
        RAISE NOTICE 'Added reference_id column to journal_entries table';
    END IF;
END $$;

-- Add total_debit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'total_debit'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN total_debit DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added total_debit column to journal_entries table';
    END IF;
END $$;

-- Add total_credit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'total_credit'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN total_credit DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added total_credit column to journal_entries table';
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'status'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        RAISE NOTICE 'Added status column to journal_entries table';
    END IF;
END $$;

-- =====================================================
-- CREATE JOURNAL_ENTRY_LINES TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FIX CASH_ACCOUNTS TABLE
-- =====================================================

-- Add account_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cash_accounts' AND column_name = 'account_id'
    ) THEN
        ALTER TABLE cash_accounts ADD COLUMN account_id VARCHAR(20);
        RAISE NOTICE 'Added account_id column to cash_accounts table';
    END IF;
END $$;

-- Add initial_balance column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cash_accounts' AND column_name = 'initial_balance'
    ) THEN
        ALTER TABLE cash_accounts ADD COLUMN initial_balance DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added initial_balance column to cash_accounts table';
    END IF;
END $$;

-- Add current_balance column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cash_accounts' AND column_name = 'current_balance'
    ) THEN
        ALTER TABLE cash_accounts ADD COLUMN current_balance DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added current_balance column to cash_accounts table';
    END IF;
END $$;

-- Add currency column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cash_accounts' AND column_name = 'currency'
    ) THEN
        ALTER TABLE cash_accounts ADD COLUMN currency VARCHAR(10) DEFAULT 'IDR';
        RAISE NOTICE 'Added currency column to cash_accounts table';
    END IF;
END $$;

-- Add is_primary column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cash_accounts' AND column_name = 'is_primary'
    ) THEN
        ALTER TABLE cash_accounts ADD COLUMN is_primary BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_primary column to cash_accounts table';
    END IF;
END $$;

-- =====================================================
-- CREATE USERS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT DATA IF NOT EXISTS
-- =====================================================

-- Insert default admin user if not exists
INSERT INTO users (username, password, email, role) 
SELECT 'admin', 'admin123', 'admin@studiopos.com', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Insert default cash accounts if not exists
INSERT INTO cash_accounts (account_id, account_name, initial_balance, current_balance, currency, is_primary) 
SELECT 'CASH001', 'Cash on Hand', 0, 0, 'IDR', true
WHERE NOT EXISTS (SELECT 1 FROM cash_accounts WHERE account_id = 'CASH001');

INSERT INTO cash_accounts (account_id, account_name, initial_balance, current_balance, currency, is_primary) 
SELECT 'CASH002', 'Bank Account', 0, 0, 'IDR', false
WHERE NOT EXISTS (SELECT 1 FROM cash_accounts WHERE account_id = 'CASH002');

INSERT INTO cash_accounts (account_id, account_name, initial_balance, current_balance, currency, is_primary) 
SELECT 'CASH003', 'Petty Cash', 0, 0, 'IDR', false
WHERE NOT EXISTS (SELECT 1 FROM cash_accounts WHERE account_id = 'CASH003');

-- =====================================================
-- CREATE INDEXES IF NOT EXISTS
-- =====================================================

-- Create indexes for journal_entry_lines
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- VERIFY CHANGES
-- =====================================================

-- Show suppliers table structure
SELECT 'SUPPLIERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
ORDER BY ordinal_position;

-- Show journal_entries table structure
SELECT 'JOURNAL_ENTRIES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'journal_entries' 
ORDER BY ordinal_position;

-- Show cash_accounts table structure
SELECT 'CASH_ACCOUNTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cash_accounts' 
ORDER BY ordinal_position;

-- Show users table structure
SELECT 'USERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

COMMIT;

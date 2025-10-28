-- Fix suppliers table - Add missing columns
-- This script adds the missing columns to the existing suppliers table

-- Add payment_terms column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN payment_terms VARCHAR(50);
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
    END IF;
END $$;

-- Update existing records to have is_active = true
UPDATE suppliers SET is_active = true WHERE is_active IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
ORDER BY ordinal_position;

COMMIT;

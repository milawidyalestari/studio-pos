-- Migration script to add missing columns to customers table
-- Run this script to update existing customers table

-- Add email column if it doesn't exist
ALTER TABLE customers ADD COLUMN email TEXT;

-- Add address column if it doesn't exist  
ALTER TABLE customers ADD COLUMN address TEXT;

-- Update the index to include new columns
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

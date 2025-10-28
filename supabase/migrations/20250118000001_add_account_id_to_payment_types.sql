-- =====================================================
-- MIGRATION: Add account_id to payment_types table
-- Version: 20250118000001
-- Date: 2025-01-18
-- Description: Add account_id field to payment_types for accounting integration
-- =====================================================

-- Add account_id column to payment_types table
ALTER TABLE public.payment_types 
ADD COLUMN account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL;

-- Add comment to document the relationship
COMMENT ON COLUMN public.payment_types.account_id IS 'Foreign key reference to chart_of_accounts for income/payment accounting';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_types_account_id ON public.payment_types(account_id);

-- Update existing payment types with default income accounts if they exist
-- This will be handled by the application logic, not in migration

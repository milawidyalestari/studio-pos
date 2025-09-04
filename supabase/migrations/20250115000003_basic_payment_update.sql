-- Migration: Basic payment_update column addition
-- Date: 2025-01-15
-- Description: Add payment_update field with minimal complexity

-- Add the column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_update TIMESTAMP WITH TIME ZONE;

-- Set initial values
UPDATE public.orders 
SET payment_update = created_at 
WHERE payment_update IS NULL;

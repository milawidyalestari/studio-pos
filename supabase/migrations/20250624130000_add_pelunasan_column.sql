-- Migration: Add pelunasan and tax_checked columns to orders table
-- Date: 2025-01-24

-- Add pelunasan column to orders table for tracking final payment
ALTER TABLE public.orders 
ADD COLUMN pelunasan DECIMAL(15,2) DEFAULT 0;

-- Add tax_checked column to orders table for tracking tax checkbox state
ALTER TABLE public.orders 
ADD COLUMN tax_checked BOOLEAN DEFAULT false;

-- Add comment to document the new columns
COMMENT ON COLUMN public.orders.pelunasan IS 'Final payment amount for the order';
COMMENT ON COLUMN public.orders.tax_checked IS 'Whether tax is applied to this order'; 
-- Migration: Add payment_update column to orders table
-- Date: 2025-01-15
-- Description: Add payment_update field to track when order was created or last payment was made

-- Add payment_update column to orders table for tracking payment activity
-- IMPORTANT: Don't use DEFAULT now() to avoid setting current timestamp for all existing records
ALTER TABLE public.orders 
ADD COLUMN payment_update TIMESTAMP WITH TIME ZONE;

-- Add comment to document the new column
COMMENT ON COLUMN public.orders.payment_update IS 'Date when order was created or last payment was made (DP/pelunasan). Initially set to created_at, updated when payment fields change.';

-- Update existing records to set payment_update = created_at initially
-- This ensures all existing orders have payment_update = created_at (not current time)
UPDATE public.orders 
SET payment_update = created_at 
WHERE payment_update IS NULL;

-- Create a function to automatically update payment_update when payment fields change
CREATE OR REPLACE FUNCTION update_payment_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if down_payment or pelunasan has actually changed
  IF (OLD.down_payment IS DISTINCT FROM NEW.down_payment) OR 
     (OLD.pelunasan IS DISTINCT FROM NEW.pelunasan) THEN
    
    -- Only update if the new payment values are meaningful (> 0)
    IF (COALESCE(NEW.down_payment, 0) > 0 OR COALESCE(NEW.pelunasan, 0) > 0) THEN
      NEW.payment_update = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update payment_update when payment fields change
DROP TRIGGER IF EXISTS trigger_update_payment_update ON public.orders;
CREATE TRIGGER trigger_update_payment_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_update_timestamp();

-- Add comment about the trigger
COMMENT ON TRIGGER trigger_update_payment_update ON public.orders IS 'Automatically updates payment_update timestamp when down_payment or pelunasan fields change meaningfully';

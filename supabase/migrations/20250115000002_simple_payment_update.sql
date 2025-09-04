-- Migration: Simple payment_update column addition
-- Date: 2025-01-15
-- Description: Add payment_update field step by step to avoid errors

-- Step 1: Add the column without any default
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_update TIMESTAMP WITH TIME ZONE;

-- Step 2: Add comment
COMMENT ON COLUMN public.orders.payment_update IS 'Date when order was created or last payment was made';

-- Step 3: Set initial values for existing records
UPDATE public.orders 
SET payment_update = created_at 
WHERE payment_update IS NULL;

-- Step 4: Create a simple function
CREATE OR REPLACE FUNCTION update_payment_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if there's a meaningful payment change
  IF (COALESCE(NEW.down_payment, 0) > 0 OR COALESCE(NEW.pelunasan, 0) > 0) THEN
    NEW.payment_update = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS trigger_update_payment_update ON public.orders;
CREATE TRIGGER trigger_update_payment_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_update_timestamp();

-- Migration: Add payment_update trigger and function
-- Date: 2025-01-15
-- Description: Add the trigger after the column is created

-- Create the function
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

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_payment_update ON public.orders;
CREATE TRIGGER trigger_update_payment_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_update_timestamp();

-- Migration: Fix payment_update trigger to only update when payment actually changes
-- Date: 2025-01-17
-- Description: Fix trigger to check if down_payment or pelunasan actually changed, not just if they exist

-- Drop and recreate the function with correct logic
CREATE OR REPLACE FUNCTION update_payment_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if down_payment or pelunasan has ACTUALLY changed (not just exists)
  IF (OLD.down_payment IS DISTINCT FROM NEW.down_payment) OR 
     (OLD.pelunasan IS DISTINCT FROM NEW.pelunasan) THEN
    
    -- Only update payment_update if the new payment values are meaningful (> 0)
    IF (COALESCE(NEW.down_payment, 0) > 0 OR COALESCE(NEW.pelunasan, 0) > 0) THEN
      NEW.payment_update = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the fixed function
DROP TRIGGER IF EXISTS trigger_update_payment_update ON public.orders;
CREATE TRIGGER trigger_update_payment_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_update_timestamp();

-- Add comment to clarify the trigger behavior
COMMENT ON TRIGGER trigger_update_payment_update ON public.orders IS 
'Automatically updates payment_update timestamp ONLY when down_payment or pelunasan values actually change (not just when order is updated)';

-- Add comment to the function
COMMENT ON FUNCTION update_payment_update_timestamp() IS 
'Updates payment_update field only when down_payment or pelunasan columns have changed their values';


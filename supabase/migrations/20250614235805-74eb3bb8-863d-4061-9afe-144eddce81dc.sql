
-- Drop the existing function and sequence since we won't need sequential generation
DROP FUNCTION IF EXISTS generate_customer_code();
DROP SEQUENCE IF EXISTS customer_id_seq;

-- Create a new function that finds the smallest unused customer code
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER := 1;
    new_code TEXT;
    max_attempts INTEGER := 10000;
    attempt_count INTEGER := 0;
BEGIN
    -- Find the smallest unused number
    LOOP
        -- Generate the code with 4 digits padding
        new_code := 'CUST' || LPAD(next_id::TEXT, 4, '0');
        
        -- Check if this code already exists
        IF NOT EXISTS (SELECT 1 FROM customers WHERE kode = new_code) THEN
            RETURN new_code;
        END IF;
        
        -- Move to next number
        next_id := next_id + 1;
        
        -- Safety check to prevent infinite loops
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique customer code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

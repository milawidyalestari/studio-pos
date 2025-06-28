
-- Drop the existing function and sequence to recreate them properly
DROP FUNCTION IF EXISTS generate_customer_code();
DROP SEQUENCE IF EXISTS customer_id_seq;

-- Create a new sequence starting from a safe number
CREATE SEQUENCE customer_id_seq;

-- Set the sequence to start after the highest existing customer code
DO $$
DECLARE
    max_code_num INTEGER := 0;
BEGIN
    -- Find the highest existing customer code number
    SELECT COALESCE(MAX(CAST(SUBSTRING(kode FROM 5) AS INTEGER)), 0) 
    INTO max_code_num
    FROM customers 
    WHERE kode ~ '^CUST[0-9]+$';
    
    -- Set the sequence to start from the next available number
    PERFORM setval('customer_id_seq', max_code_num + 1);
END $$;

-- Create an improved function that ensures uniqueness
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    new_code TEXT;
    max_attempts INTEGER := 100;
    attempt_count INTEGER := 0;
BEGIN
    LOOP
        -- Get the next value from the sequence
        SELECT nextval('customer_id_seq') INTO next_id;
        
        -- Generate the code with 4 digits padding
        new_code := 'CUST' || LPAD(next_id::TEXT, 4, '0');
        
        -- Check if this code already exists
        IF NOT EXISTS (SELECT 1 FROM customers WHERE kode = new_code) THEN
            RETURN new_code;
        END IF;
        
        -- Safety check to prevent infinite loops
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique customer code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- Create a sequence for customer IDs
CREATE SEQUENCE IF NOT EXISTS customer_id_seq START 1;

-- Create a function to generate sequential customer codes
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Get the next value from the sequence
    SELECT nextval('customer_id_seq') INTO next_id;
    
    -- Return formatted customer code (CUST001, CUST002, etc.)
    RETURN 'CUST' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- First, find the highest existing sequential customer code number
DO $$
DECLARE
    max_existing_num INTEGER := 0;
    customer_record RECORD;
    counter INTEGER := 1;
    new_code TEXT;
BEGIN
    -- Find the highest existing CUST number
    SELECT COALESCE(MAX(CAST(SUBSTRING(kode FROM 5) AS INTEGER)), 0) 
    INTO max_existing_num
    FROM customers 
    WHERE kode ~ '^CUST[0-9]{3}$';
    
    -- Set counter to start after the highest existing number
    counter := max_existing_num + 1;
    
    -- Update customers that don't have properly formatted codes
    FOR customer_record IN 
        SELECT id FROM customers 
        WHERE kode !~ '^CUST[0-9]{3}$' 
        ORDER BY created_at
    LOOP
        -- Generate a unique code
        LOOP
            new_code := 'CUST' || LPAD(counter::TEXT, 3, '0');
            
            -- Check if this code already exists
            IF NOT EXISTS (SELECT 1 FROM customers WHERE kode = new_code) THEN
                EXIT; -- Code is unique, break the loop
            END IF;
            
            counter := counter + 1;
        END LOOP;
        
        -- Update the customer with the unique code
        UPDATE customers 
        SET kode = new_code
        WHERE id = customer_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    -- Set the sequence to continue from where we left off
    PERFORM setval('customer_id_seq', counter);
END $$;

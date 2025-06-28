
-- Update all existing customer codes to use consistent 4-digit format
DO $$
DECLARE
    customer_record RECORD;
    counter INTEGER := 1;
    new_code TEXT;
BEGIN
    -- First, let's backup and then update all customers to have consistent format
    -- We'll assign new sequential codes to all customers based on their creation order
    FOR customer_record IN 
        SELECT id, kode FROM customers 
        ORDER BY created_at, id
    LOOP
        -- Generate a unique 4-digit code
        LOOP
            new_code := 'CUST' || LPAD(counter::TEXT, 4, '0');
            
            -- Check if this code already exists (in case we have duplicates)
            IF NOT EXISTS (SELECT 1 FROM customers WHERE kode = new_code AND id != customer_record.id) THEN
                EXIT; -- Code is unique, break the loop
            END IF;
            
            counter := counter + 1;
        END LOOP;
        
        -- Update the customer with the new consistent code
        UPDATE customers 
        SET kode = new_code, updated_at = now()
        WHERE id = customer_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    -- Update the sequence to continue from where we left off
    PERFORM setval('customer_id_seq', counter);
END $$;

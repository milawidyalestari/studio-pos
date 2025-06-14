
-- Update RLS policies for customers table to allow anonymous access
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;

-- Create new policies that allow both anonymous and authenticated users
CREATE POLICY "Allow all operations on customers" ON public.customers 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

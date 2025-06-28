
-- First, let's create a customer modal/form functionality by adding a new customer creation function
-- Then we'll update the orders table to properly reference customers

-- Add a foreign key constraint to link orders to customers
-- First, let's add the customer_id column if it doesn't exist properly and set up the relationship
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_customer_id 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- Update the orders table to make customer_id not nullable (after we handle existing data)
-- We'll need to handle existing orders that might not have a customer_id
UPDATE public.orders 
SET customer_id = (
  SELECT c.id 
  FROM public.customers c 
  WHERE c.nama = orders.customer_name 
  LIMIT 1
)
WHERE customer_id IS NULL AND customer_name IS NOT NULL;

-- For any remaining orders without a customer match, we'll create a default customer
INSERT INTO public.customers (kode, nama) 
SELECT DISTINCT 
  'CUST' || LPAD(ROW_NUMBER() OVER (ORDER BY customer_name)::text, 3, '0'),
  customer_name
FROM public.orders 
WHERE customer_id IS NULL 
  AND customer_name IS NOT NULL 
  AND customer_name NOT IN (SELECT nama FROM public.customers)
ON CONFLICT (kode) DO NOTHING;

-- Update remaining orders with the newly created customers
UPDATE public.orders 
SET customer_id = (
  SELECT c.id 
  FROM public.customers c 
  WHERE c.nama = orders.customer_name 
  LIMIT 1
)
WHERE customer_id IS NULL AND customer_name IS NOT NULL;

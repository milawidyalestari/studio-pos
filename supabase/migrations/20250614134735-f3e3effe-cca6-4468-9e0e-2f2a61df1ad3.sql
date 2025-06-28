
-- Update RLS policies for orders table to allow public access
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Update RLS policies for order_items table to allow public access
DROP POLICY IF EXISTS "Allow all operations on order_items" ON public.order_items;
CREATE POLICY "Allow all operations on order_items" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

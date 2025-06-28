
-- Enable Row Level Security (RLS) for the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow all users to select (read) products (public access)
CREATE POLICY "Allow read access to all" ON public.products
  FOR SELECT
  USING (true);

-- Allow all users to insert products (public access)
CREATE POLICY "Allow insert access to all" ON public.products
  FOR INSERT
  WITH CHECK (true);

-- Allow all users to update products (public access)
CREATE POLICY "Allow update access to all" ON public.products
  FOR UPDATE
  USING (true);

-- Allow all users to delete products (public access)
CREATE POLICY "Allow delete access to all" ON public.products
  FOR DELETE
  USING (true);

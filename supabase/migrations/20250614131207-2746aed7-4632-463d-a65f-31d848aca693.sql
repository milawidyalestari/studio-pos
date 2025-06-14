
-- Create enum types for better data consistency
CREATE TYPE order_status AS ENUM ('pending', 'in-progress', 'ready', 'done');
CREATE TYPE customer_level AS ENUM ('Regular', 'Premium', 'VIP');
CREATE TYPE employee_status AS ENUM ('Active', 'Inactive');
CREATE TYPE payment_type AS ENUM ('cash', 'transfer', 'credit');

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  level customer_level DEFAULT 'Regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  payment_terms VARCHAR(100),
  outstanding_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  posisi VARCHAR(100),
  status employee_status DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products/Materials table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(20) UNIQUE NOT NULL,
  jenis VARCHAR(100),
  nama VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  satuan VARCHAR(50),
  harga_beli DECIMAL(15,2) DEFAULT 0,
  harga_jual DECIMAL(15,2) DEFAULT 0,
  stok_awal INTEGER DEFAULT 0,
  stok_masuk INTEGER DEFAULT 0,
  stok_keluar INTEGER DEFAULT 0,
  stok_opname INTEGER DEFAULT 0,
  stok_minimum INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  customer_name VARCHAR(255),
  tanggal DATE NOT NULL,
  waktu TIME,
  estimasi VARCHAR(50),
  estimasi_waktu TIME,
  outdoor BOOLEAN DEFAULT false,
  laser_printing BOOLEAN DEFAULT false,
  mug_nota BOOLEAN DEFAULT false,
  status order_status DEFAULT 'pending',
  jasa_desain DECIMAL(15,2) DEFAULT 0,
  biaya_lain DECIMAL(15,2) DEFAULT 0,
  sub_total DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  ppn DECIMAL(5,2) DEFAULT 10,
  total_amount DECIMAL(15,2) DEFAULT 0,
  payment_type payment_type,
  bank VARCHAR(100),
  down_payment DECIMAL(15,2) DEFAULT 0,
  remaining_payment DECIMAL(15,2) DEFAULT 0,
  admin_id UUID REFERENCES public.employees(id),
  desainer_id UUID REFERENCES public.employees(id),
  komputer VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id VARCHAR(50),
  bahan VARCHAR(100),
  item_name VARCHAR(255) NOT NULL,
  panjang DECIMAL(10,2),
  lebar DECIMAL(10,2),
  quantity INTEGER NOT NULL,
  finishing VARCHAR(100),
  unit_price DECIMAL(15,2) DEFAULT 0,
  sub_total DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inventory movements table
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id),
  movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50), -- 'order', 'purchase', 'adjustment'
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transactions table (for financial tracking)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  customer_name VARCHAR(255),
  transaction_date DATE NOT NULL,
  estimated_date DATE,
  status VARCHAR(50),
  category VARCHAR(100),
  amount DECIMAL(15,2) NOT NULL,
  payment_method payment_type,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(20) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_date DATE NOT NULL,
  expected_delivery DATE,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Purchase order items
CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust these based on your security requirements)
-- For now, allowing all operations for authenticated users

-- Customers policies
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Suppliers policies
CREATE POLICY "Allow all operations on suppliers" ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Employees policies
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Product categories policies
CREATE POLICY "Allow all operations on product_categories" ON public.product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products policies
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order items policies
CREATE POLICY "Allow all operations on order_items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inventory movements policies
CREATE POLICY "Allow all operations on inventory_movements" ON public.inventory_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Transactions policies
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchase orders policies
CREATE POLICY "Allow all operations on purchase_orders" ON public.purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchase order items policies
CREATE POLICY "Allow all operations on purchase_order_items" ON public.purchase_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_customers_kode ON public.customers(kode);
CREATE INDEX idx_customers_level ON public.customers(level);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_tanggal ON public.orders(tanggal);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_products_kode ON public.products(kode);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX idx_transactions_transaction_date ON public.transactions(transaction_date);

-- Insert some sample product categories
INSERT INTO public.product_categories (name, description) VALUES
('Vinyl', 'Vinyl materials for printing'),
('Banner', 'Banner materials and fabrics'),
('Sticker', 'Sticker and adhesive materials'),
('Canvas', 'Canvas materials for printing'),
('Paper', 'Paper products for printing');

-- Insert some sample finishing options as products
INSERT INTO public.products (kode, jenis, nama, satuan, harga_beli, harga_jual) VALUES
('FIN001', 'Finishing', 'Laminating', 'pcs', 5000, 8000),
('FIN002', 'Finishing', 'Cutting', 'pcs', 3000, 5000),
('FIN003', 'Finishing', 'Mounting', 'pcs', 7000, 12000),
('FIN004', 'Finishing', 'Grommets', 'pcs', 2000, 4000);

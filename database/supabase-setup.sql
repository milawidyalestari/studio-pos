-- Azuro - Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    color TEXT NOT NULL DEFAULT '#6b7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    level TEXT CHECK (level IN ('Premium', 'Regular', 'VIP')) DEFAULT 'Regular',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    jenis TEXT NOT NULL,
    nama TEXT NOT NULL,
    satuan TEXT NOT NULL,
    harga_beli DECIMAL(15,2) DEFAULT 0,
    harga_jual DECIMAL(15,2) DEFAULT 0,
    stok_awal INTEGER DEFAULT 0,
    stok_masuk INTEGER DEFAULT 0,
    stok_keluar INTEGER DEFAULT 0,
    stok_opname INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    satuan TEXT NOT NULL,
    stok_akhir INTEGER DEFAULT 0,
    stok_opname INTEGER DEFAULT 0,
    lebar_maksimum DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    tanggal DATE NOT NULL,
    waktu TIME,
    estimasi TEXT,
    estimasi_waktu TEXT,
    outdoor BOOLEAN DEFAULT false,
    laser_printing BOOLEAN DEFAULT false,
    mug_nota BOOLEAN DEFAULT false,
    jasa_desain DECIMAL(15,2) DEFAULT 0,
    biaya_lain DECIMAL(15,2) DEFAULT 0,
    sub_total DECIMAL(15,2) DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    ppn DECIMAL(5,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    payment_type TEXT,
    bank TEXT,
    admin_id TEXT,
    desainer_id TEXT,
    komputer TEXT,
    notes TEXT,
    status_id INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

CREATE INDEX IF NOT EXISTS idx_customers_kode ON customers(kode);
CREATE INDEX IF NOT EXISTS idx_customers_nama ON customers(nama);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE INDEX IF NOT EXISTS idx_products_kode ON products(kode);
CREATE INDEX IF NOT EXISTS idx_products_nama ON products(nama);

CREATE INDEX IF NOT EXISTS idx_materials_kode ON materials(kode);
CREATE INDEX IF NOT EXISTS idx_materials_nama ON materials(nama);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Insert default categories
INSERT INTO categories (name, type, color) VALUES 
    ('Penjualan', 'income', '#10b981'),
    ('Jasa', 'income', '#059669'),
    ('Bahan Baku', 'expense', '#ef4444'),
    ('Operasional', 'expense', '#dc2626')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- For development purposes, allowing all operations
-- In production, you should implement proper user authentication and authorization

-- Transactions policies
DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
CREATE POLICY "Enable read access for all users" ON transactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON transactions;
CREATE POLICY "Enable insert for all users" ON transactions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON transactions;
CREATE POLICY "Enable update for all users" ON transactions
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON transactions;
CREATE POLICY "Enable delete for all users" ON transactions
    FOR DELETE USING (true);

-- Categories policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
CREATE POLICY "Enable insert for all users" ON categories
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON categories;
CREATE POLICY "Enable update for all users" ON categories
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON categories;
CREATE POLICY "Enable delete for all users" ON categories
    FOR DELETE USING (true);

-- Customers policies
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
CREATE POLICY "Enable read access for all users" ON customers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON customers;
CREATE POLICY "Enable insert for all users" ON customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON customers;
CREATE POLICY "Enable update for all users" ON customers
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON customers;
CREATE POLICY "Enable delete for all users" ON customers
    FOR DELETE USING (true);

-- Products policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON products;
CREATE POLICY "Enable insert for all users" ON products
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON products;
CREATE POLICY "Enable update for all users" ON products
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON products;
CREATE POLICY "Enable delete for all users" ON products
    FOR DELETE USING (true);

-- Materials policies
DROP POLICY IF EXISTS "Enable read access for all users" ON materials;
CREATE POLICY "Enable read access for all users" ON materials
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON materials;
CREATE POLICY "Enable insert for all users" ON materials
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON materials;
CREATE POLICY "Enable update for all users" ON materials
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON materials;
CREATE POLICY "Enable delete for all users" ON materials
    FOR DELETE USING (true);

-- Orders policies
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON orders;
CREATE POLICY "Enable update for all users" ON orders
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON orders;
CREATE POLICY "Enable delete for all users" ON orders
    FOR DELETE USING (true);

-- Insert sample data for development
INSERT INTO transactions (date, type, category, description, amount, payment_method, status) VALUES 
    (CURRENT_DATE, 'income', 'Penjualan', 'Spanduk Florist 2 Pass', 150000, 'Cash', 'completed'),
    (CURRENT_DATE, 'income', 'Penjualan', 'Spanduk Glossy 280 Gsm', 400000, 'Transfer', 'completed'),
    (CURRENT_DATE - INTERVAL '1 day', 'expense', 'Bahan Baku', 'Kertas A3 80gsm', 250000, 'Cash', 'completed'),
    (CURRENT_DATE - INTERVAL '1 day', 'expense', 'Operasional', 'Biaya Listrik', 150000, 'Transfer', 'completed'),
    (CURRENT_DATE - INTERVAL '2 days', 'income', 'Penjualan', 'Cincin / Mata Ayam', 250000, 'Cash', 'pending'),
    (CURRENT_DATE - INTERVAL '30 days', 'income', 'Jasa', 'Desain Logo', 500000, 'Transfer', 'completed'),
    (CURRENT_DATE - INTERVAL '35 days', 'expense', 'Bahan Baku', 'Tinta Printer', 300000, 'Cash', 'completed'),
    (CURRENT_DATE - INTERVAL '60 days', 'income', 'Penjualan', 'Banner Event', 750000, 'Transfer', 'completed'),
    (CURRENT_DATE - INTERVAL '65 days', 'expense', 'Operasional', 'Biaya Internet', 200000, 'Transfer', 'completed'),
    (CURRENT_DATE - INTERVAL '90 days', 'income', 'Jasa', 'Editing Video', 350000, 'Cash', 'completed');

-- Create a view for financial summary (optional)
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_expense,
    COALESCE(SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END), 0) as net_profit,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
    COALESCE(SUM(CASE WHEN type = 'income' AND status = 'completed' AND date >= date_trunc('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as this_month_income,
    COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'completed' AND date >= date_trunc('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as this_month_expense
FROM transactions;

-- Verification queries
SELECT 'Setup completed successfully!' as message;
SELECT 'Categories count: ' || COUNT(*) as categories_info FROM categories;
SELECT 'Transactions count: ' || COUNT(*) as transactions_info FROM transactions;
SELECT 'Sample financial summary:' as summary_info;
SELECT * FROM financial_summary;
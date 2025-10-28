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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

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
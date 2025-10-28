-- Azuro - SQLite Database Schema
-- Compatible with SQLite for Electron app

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')) NOT NULL DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    color TEXT NOT NULL DEFAULT '#6b7280',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    tanggal TEXT NOT NULL,
    waktu TEXT,
    estimasi TEXT,
    estimasi_waktu TEXT,
    outdoor INTEGER DEFAULT 0,
    laser_printing INTEGER DEFAULT 0,
    mug_nota INTEGER DEFAULT 0,
    jasa_desain REAL DEFAULT 0,
    biaya_lain REAL DEFAULT 0,
    sub_total REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    ppn REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    payment_type TEXT,
    bank TEXT,
    admin_id TEXT,
    desainer_id TEXT,
    komputer TEXT,
    notes TEXT,
    status_id INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    jenis TEXT NOT NULL,
    nama TEXT NOT NULL,
    satuan TEXT NOT NULL,
    harga_beli REAL DEFAULT 0,
    harga_jual REAL DEFAULT 0,
    stok_awal INTEGER DEFAULT 0,
    stok_masuk INTEGER DEFAULT 0,
    stok_keluar INTEGER DEFAULT 0,
    stok_opname INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    whatsapp TEXT,
    level TEXT CHECK (level IN ('Premium', 'Regular', 'VIP')) DEFAULT 'Regular',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    payment_terms TEXT,
    outstanding_balance REAL DEFAULT 0,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    posisi TEXT,
    status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT CHECK (role IN ('admin', 'user', 'cashier', 'manager')) DEFAULT 'user',
    full_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_products_kode ON products(kode);
CREATE INDEX IF NOT EXISTS idx_products_nama ON products(nama);

CREATE INDEX IF NOT EXISTS idx_customers_kode ON customers(kode);
CREATE INDEX IF NOT EXISTS idx_customers_nama ON customers(nama);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

CREATE INDEX IF NOT EXISTS idx_employees_kode ON employees(kode);
CREATE INDEX IF NOT EXISTS idx_employees_nama ON employees(nama);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default categories
INSERT OR IGNORE INTO categories (id, name, type, color) VALUES 
    (hex(randomblob(16)), 'Penjualan', 'income', '#10b981'),
    (hex(randomblob(16)), 'Jasa', 'income', '#059669'),
    (hex(randomblob(16)), 'Bahan Baku', 'expense', '#ef4444'),
    (hex(randomblob(16)), 'Operasional', 'expense', '#dc2626');

-- Insert default admin user
INSERT OR IGNORE INTO users (id, username, password, email, role, full_name, is_active) VALUES 
    ('admin', 'admin', 'admin123', 'admin@studio-pos.com', 'admin', 'Administrator', 1);

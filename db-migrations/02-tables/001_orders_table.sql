-- =====================================================
-- MIGRATION: Orders Table
-- Version: 002.001
-- Date: 2025-01-15
-- Description: Tabel untuk mengelola order/pesanan
-- =====================================================

-- =====================================================
-- ORDER STATUS ENUM
-- =====================================================
CREATE TYPE order_status AS ENUM (
    'Unnest',
    'Design', 
    'Cek File',
    'Konfirmasi',
    'Export',
    'Done',
    'Proses Cetak'
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Order Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Payment Information
    down_payment DECIMAL(15,2) DEFAULT 0,
    pelunasan DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(50),
    
    -- Status and Dates
    status order_status DEFAULT 'Unnest',
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    completed_date DATE,
    
    -- Additional Info
    notes TEXT,
    is_urgent BOOLEAN DEFAULT false,
    receipt_printed BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_update TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_update ON orders(payment_update);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE orders IS 'Tabel untuk mengelola pesanan/order dari customer';
COMMENT ON COLUMN orders.payment_update IS 'Timestamp terakhir kali pembayaran diupdate (DP/pelunasan)';
COMMENT ON COLUMN orders.receipt_printed IS 'Flag untuk menandai apakah nota sudah dicetak';
COMMENT ON COLUMN orders.pelunasan IS 'Pembayaran pelunasan/sisa pembayaran';


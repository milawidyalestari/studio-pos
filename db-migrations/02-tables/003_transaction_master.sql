-- =====================================================
-- MIGRATION: Transaction Master Table
-- Version: 002.003
-- Date: 2025-01-17
-- Description: Tabel master untuk transaksi keuangan
-- =====================================================

-- =====================================================
-- TRANSACTION MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transaction_master (
    id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Transaction Details
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Payment Information
    payment_method VARCHAR(100),
    bank_reference VARCHAR(100),
    
    -- Dates
    transaction_date DATE NOT NULL,
    due_date DATE,
    
    -- Status and Priority
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    
    -- Recurring Information
    recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(50),
    recurring_end_date DATE,
    
    -- Additional Information
    notes TEXT,
    attachments TEXT[],
    tags TEXT[],
    
    -- Approval
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- CHECK CONSTRAINTS
-- =====================================================
ALTER TABLE transaction_master 
ADD CONSTRAINT transaction_master_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE transaction_master 
ADD CONSTRAINT transaction_master_status_check 
CHECK (status IN ('pending', 'completed', 'cancelled', 'rejected'));

ALTER TABLE transaction_master 
ADD CONSTRAINT transaction_master_transaction_type_check 
CHECK (transaction_type IN ('income', 'expense', 'transfer', 'adjustment'));

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transaction_master_transaction_code 
ON transaction_master(transaction_code);

CREATE INDEX IF NOT EXISTS idx_transaction_master_transaction_type 
ON transaction_master(transaction_type);

CREATE INDEX IF NOT EXISTS idx_transaction_master_category_id 
ON transaction_master(category_id);

CREATE INDEX IF NOT EXISTS idx_transaction_master_transaction_date 
ON transaction_master(transaction_date);

CREATE INDEX IF NOT EXISTS idx_transaction_master_status 
ON transaction_master(status);

CREATE INDEX IF NOT EXISTS idx_transaction_master_created_by 
ON transaction_master(created_by);

CREATE INDEX IF NOT EXISTS idx_transaction_master_recurring 
ON transaction_master(recurring);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE transaction_master IS 'Tabel master untuk semua transaksi keuangan';
COMMENT ON COLUMN transaction_master.transaction_code IS 'Kode unik transaksi (auto-generated)';
COMMENT ON COLUMN transaction_master.recurring IS 'Flag untuk transaksi berulang';
COMMENT ON COLUMN transaction_master.priority IS 'Prioritas transaksi: low, normal, high, urgent';
COMMENT ON COLUMN transaction_master.attachments IS 'Array path file attachment';
COMMENT ON COLUMN transaction_master.tags IS 'Array tag untuk kategorisasi tambahan';


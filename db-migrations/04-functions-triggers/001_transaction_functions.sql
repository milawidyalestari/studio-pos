-- =====================================================
-- MIGRATION: Transaction Functions & Triggers
-- Version: 004.001
-- Date: 2025-01-17
-- Description: Functions dan triggers untuk transaction master
-- =====================================================

-- =====================================================
-- FUNCTION: Generate Transaction Code
-- =====================================================
CREATE OR REPLACE FUNCTION generate_transaction_code()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    transaction_code TEXT;
BEGIN
    SELECT COALESCE(MAX(id), 0) + 1 INTO next_id FROM transaction_master;
    transaction_code := 'TRX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(next_id::TEXT, 4, '0');
    RETURN transaction_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Update Transaction Master Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_transaction_master_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Auto Generate Transaction Code
-- =====================================================
CREATE OR REPLACE FUNCTION auto_generate_transaction_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_code IS NULL OR NEW.transaction_code = '' THEN
        NEW.transaction_code := generate_transaction_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto Generate Transaction Code
-- =====================================================
DROP TRIGGER IF EXISTS trigger_auto_generate_transaction_code ON transaction_master;
CREATE TRIGGER trigger_auto_generate_transaction_code 
    BEFORE INSERT ON transaction_master 
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_transaction_code();

-- =====================================================
-- TRIGGER: Update Transaction Master Timestamp
-- =====================================================
DROP TRIGGER IF EXISTS trigger_transaction_master_updated_at ON transaction_master;
CREATE TRIGGER trigger_transaction_master_updated_at 
    BEFORE UPDATE ON transaction_master 
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_master_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION generate_transaction_code() IS 'Generate kode transaksi unik dengan format TRX-YYYYMMDD-XXXX';
COMMENT ON FUNCTION update_transaction_master_updated_at() IS 'Auto update timestamp updated_at pada transaction_master';
COMMENT ON FUNCTION auto_generate_transaction_code() IS 'Auto generate transaction_code jika kosong saat insert';


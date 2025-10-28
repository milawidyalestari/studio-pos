-- =====================================================
-- MIGRATION: Payment Update Trigger
-- Version: 004.002
-- Date: 2025-01-15
-- Description: Trigger untuk update payment timestamp
-- =====================================================

-- =====================================================
-- FUNCTION: Update Payment Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_payment_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Cek apakah down_payment atau pelunasan berubah
    IF (OLD.down_payment IS DISTINCT FROM NEW.down_payment) OR 
       (OLD.pelunasan IS DISTINCT FROM NEW.pelunasan) THEN
        
        -- Update timestamp hanya jika nilai pembayaran meaningful (> 0)
        IF (COALESCE(NEW.down_payment, 0) > 0 OR COALESCE(NEW.pelunasan, 0) > 0) THEN
            NEW.payment_update = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto Update Payment Timestamp
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_payment_update ON orders;
CREATE TRIGGER trigger_update_payment_update
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_update_timestamp();

-- =====================================================
-- FUNCTION: Initialize Payment Update for Existing Records
-- =====================================================
CREATE OR REPLACE FUNCTION initialize_payment_update()
RETURNS VOID AS $$
BEGIN
    -- Set payment_update = created_at untuk record yang belum ada payment_update
    UPDATE orders 
    SET payment_update = created_at 
    WHERE payment_update IS NULL;
    
    RAISE NOTICE 'Payment update timestamps initialized for existing records';
END;
$$ LANGUAGE plpgsql;

-- Jalankan inisialisasi untuk record yang sudah ada
SELECT initialize_payment_update();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION update_payment_update_timestamp() IS 'Auto update payment_update timestamp ketika down_payment atau pelunasan berubah';
COMMENT ON FUNCTION initialize_payment_update() IS 'Inisialisasi payment_update untuk record yang sudah ada';
COMMENT ON TRIGGER trigger_update_payment_update ON orders IS 'Trigger untuk auto update payment_update timestamp';


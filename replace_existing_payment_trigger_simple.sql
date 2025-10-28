-- =====================================================
-- REPLACE EXISTING PAYMENT UPDATE TRIGGER (SIMPLE VERSION)
-- Version: 1.0
-- Date: 2025-01-15
-- Description: Script sederhana untuk mengganti trigger payment_update yang sudah ada
-- =====================================================

-- =====================================================
-- STEP 1: Drop Existing Trigger and Function
-- =====================================================
-- Hapus trigger yang sudah ada
DROP TRIGGER IF EXISTS trigger_update_payment_update ON orders;

-- Hapus function yang sudah ada (jika ada)
DROP FUNCTION IF EXISTS update_payment_update_timestamp();

-- =====================================================
-- STEP 2: Create Enhanced Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_payment_update_timestamp_enhanced()
RETURNS TRIGGER AS $$
DECLARE
    payment_changed BOOLEAN := FALSE;
    old_dp DECIMAL(15,2);
    new_dp DECIMAL(15,2);
    old_remaining DECIMAL(15,2);
    new_remaining DECIMAL(15,2);
    old_pelunasan DECIMAL(15,2);
    new_pelunasan DECIMAL(15,2);
BEGIN
    -- Normalize values untuk menghindari masalah dengan NULL
    old_dp := COALESCE(OLD.down_payment, 0);
    new_dp := COALESCE(NEW.down_payment, 0);
    old_remaining := COALESCE(OLD.remaining_payment, 0);
    new_remaining := COALESCE(NEW.remaining_payment, 0);
    old_pelunasan := COALESCE(OLD.pelunasan, 0);
    new_pelunasan := COALESCE(NEW.pelunasan, 0);
    
    -- Cek apakah ada perubahan pada down_payment
    IF OLD.down_payment IS DISTINCT FROM NEW.down_payment THEN
        payment_changed := TRUE;
    END IF;
    
    -- Cek apakah ada perubahan pada remaining_payment
    IF OLD.remaining_payment IS DISTINCT FROM NEW.remaining_payment THEN
        payment_changed := TRUE;
    END IF;
    
    -- Cek apakah ada perubahan pada pelunasan (jika kolom ini ada)
    IF OLD.pelunasan IS DISTINCT FROM NEW.pelunasan THEN
        payment_changed := TRUE;
    END IF;
    
    -- Update payment_update jika ada perubahan pembayaran
    IF payment_changed THEN
        -- Update timestamp ke waktu sekarang
        NEW.payment_update := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: Create Enhanced Trigger
-- =====================================================
CREATE TRIGGER trigger_update_payment_update_enhanced
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_update_timestamp_enhanced();

-- =====================================================
-- STEP 4: Create Helper Functions
-- =====================================================
-- Function untuk inisialisasi payment_update
CREATE OR REPLACE FUNCTION initialize_payment_update_all()
RETURNS VOID AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Set payment_update = created_at untuk semua record yang belum ada payment_update
    UPDATE orders 
    SET payment_update = created_at 
    WHERE payment_update IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
END;
$$ LANGUAGE plpgsql;

-- Function untuk reset payment_update order tertentu
CREATE OR REPLACE FUNCTION reset_payment_update(order_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    order_exists BOOLEAN;
BEGIN
    -- Cek apakah order ada
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = order_uuid) INTO order_exists;
    
    IF NOT order_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Reset payment_update ke created_at
    UPDATE orders 
    SET payment_update = created_at 
    WHERE id = order_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function untuk mendapatkan history pembayaran
CREATE OR REPLACE FUNCTION get_payment_history(order_uuid UUID)
RETURNS TABLE (
    order_number VARCHAR(50),
    down_payment DECIMAL(15,2),
    remaining_payment DECIMAL(15,2),
    pelunasan DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    payment_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_number,
        o.down_payment,
        o.remaining_payment,
        o.pelunasan,
        o.total_amount,
        o.payment_update,
        o.created_at
    FROM orders o
    WHERE o.id = order_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: Create Payment Status View
-- =====================================================
CREATE OR REPLACE VIEW orders_payment_status AS
SELECT 
    id,
    order_number,
    customer_id,
    customer_name,
    total_amount,
    down_payment,
    remaining_payment,
    pelunasan,
    (down_payment + COALESCE(pelunasan, 0)) as total_paid,
    remaining_payment as remaining_amount,
    CASE 
        WHEN remaining_payment <= 0 OR (down_payment + COALESCE(pelunasan, 0)) >= total_amount THEN 'Fully Paid'
        WHEN (down_payment + COALESCE(pelunasan, 0)) > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END as payment_status,
    payment_update,
    created_at,
    updated_at,
    tanggal,
    status_id
FROM orders
ORDER BY payment_update DESC NULLS LAST;

-- =====================================================
-- STEP 6: Add Comments and Documentation
-- =====================================================
COMMENT ON FUNCTION update_payment_update_timestamp_enhanced() IS 
'Enhanced function untuk auto update payment_update timestamp ketika down_payment, remaining_payment, atau pelunasan berubah.';

COMMENT ON FUNCTION initialize_payment_update_all() IS 
'Inisialisasi payment_update untuk semua record yang sudah ada.';

COMMENT ON FUNCTION reset_payment_update(UUID) IS 
'Reset payment_update timestamp untuk order tertentu ke created_at.';

COMMENT ON FUNCTION get_payment_history(UUID) IS 
'Mengambil history pembayaran untuk order tertentu.';

COMMENT ON VIEW orders_payment_status IS 
'View untuk melihat status pembayaran semua order dengan informasi lengkap.';

COMMENT ON TRIGGER trigger_update_payment_update_enhanced ON orders IS 
'Enhanced trigger untuk auto update payment_update timestamp ketika ada perubahan pada down_payment, remaining_payment, atau pelunasan.';

-- =====================================================
-- STEP 7: Initialize Existing Records
-- =====================================================
-- Jalankan inisialisasi untuk record yang sudah ada
SELECT initialize_payment_update_all();

-- =====================================================
-- STEP 8: Verification
-- =====================================================
-- Cek apakah trigger berhasil dibuat
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'orders' AND t.tgname = 'trigger_update_payment_update_enhanced';

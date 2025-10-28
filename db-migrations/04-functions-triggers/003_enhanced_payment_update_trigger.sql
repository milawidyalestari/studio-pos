-- =====================================================
-- MIGRATION: Enhanced Payment Update Trigger
-- Version: 004.003
-- Date: 2025-01-15
-- Description: Enhanced trigger untuk mendeteksi perubahan DP/remaining_payment
-- dan otomatis update payment_update timestamp dengan logging
-- Sesuai dengan struktur tabel orders yang sebenarnya
-- =====================================================

-- =====================================================
-- FUNCTION: Enhanced Payment Update Detection
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
        
        -- Log perubahan untuk debugging (opsional)
        RAISE NOTICE 'Down payment changed from % to % for order %', 
            old_dp, new_dp, NEW.order_number;
    END IF;
    
    -- Cek apakah ada perubahan pada remaining_payment
    IF OLD.remaining_payment IS DISTINCT FROM NEW.remaining_payment THEN
        payment_changed := TRUE;
        
        -- Log perubahan untuk debugging (opsional)
        RAISE NOTICE 'Remaining payment changed from % to % for order %', 
            old_remaining, new_remaining, NEW.order_number;
    END IF;
    
    -- Cek apakah ada perubahan pada pelunasan (jika kolom ini ada)
    IF OLD.pelunasan IS DISTINCT FROM NEW.pelunasan THEN
        payment_changed := TRUE;
        
        -- Log perubahan untuk debugging (opsional)
        RAISE NOTICE 'Pelunasan changed from % to % for order %', 
            old_pelunasan, new_pelunasan, NEW.order_number;
    END IF;
    
    -- Update payment_update jika ada perubahan pembayaran
    IF payment_changed THEN
        -- Update timestamp ke waktu sekarang
        NEW.payment_update := NOW();
        
        -- Log update untuk tracking
        RAISE NOTICE 'Payment update timestamp updated to % for order %', 
            NEW.payment_update, NEW.order_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Enhanced Payment Update Detection
-- =====================================================
-- Hapus trigger lama jika ada
DROP TRIGGER IF EXISTS trigger_update_payment_update ON orders;
DROP TRIGGER IF EXISTS trigger_update_payment_update_enhanced ON orders;

-- Buat trigger baru yang lebih robust
CREATE TRIGGER trigger_update_payment_update_enhanced
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_update_timestamp_enhanced();

-- =====================================================
-- FUNCTION: Initialize Payment Update for All Records
-- =====================================================
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
    
    RAISE NOTICE 'Payment update timestamps initialized for % existing records', updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Reset Payment Update for Specific Order
-- =====================================================
CREATE OR REPLACE FUNCTION reset_payment_update(order_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    order_exists BOOLEAN;
BEGIN
    -- Cek apakah order ada
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = order_uuid) INTO order_exists;
    
    IF NOT order_exists THEN
        RAISE NOTICE 'Order with ID % not found', order_uuid;
        RETURN FALSE;
    END IF;
    
    -- Reset payment_update ke created_at
    UPDATE orders 
    SET payment_update = created_at 
    WHERE id = order_uuid;
    
    RAISE NOTICE 'Payment update timestamp reset for order %', order_uuid;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get Payment History for Order
-- =====================================================
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
-- VIEW: Orders with Payment Status
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
-- COMMENTS AND DOCUMENTATION
-- =====================================================
COMMENT ON FUNCTION update_payment_update_timestamp_enhanced() IS 
'Enhanced function untuk auto update payment_update timestamp ketika down_payment, remaining_payment, atau pelunasan berubah. 
Mendeteksi perubahan dengan lebih akurat dan menyediakan logging untuk debugging.';

COMMENT ON FUNCTION initialize_payment_update_all() IS 
'Inisialisasi payment_update untuk semua record yang sudah ada. 
Mengembalikan jumlah record yang diupdate.';

COMMENT ON FUNCTION reset_payment_update(UUID) IS 
'Reset payment_update timestamp untuk order tertentu ke created_at. 
Mengembalikan true jika berhasil, false jika order tidak ditemukan.';

COMMENT ON FUNCTION get_payment_history(UUID) IS 
'Mengambil history pembayaran untuk order tertentu. 
Mengembalikan informasi pembayaran dan timestamp.';

COMMENT ON VIEW orders_payment_status IS 
'View untuk melihat status pembayaran semua order dengan informasi lengkap. 
Termasuk total yang sudah dibayar, sisa pembayaran, dan status pembayaran.';

COMMENT ON TRIGGER trigger_update_payment_update_enhanced ON orders IS 
'Enhanced trigger untuk auto update payment_update timestamp ketika ada perubahan pada down_payment, remaining_payment, atau pelunasan. 
Menyediakan logging dan handling yang lebih robust.';

-- =====================================================
-- EXECUTE INITIALIZATION
-- =====================================================
-- Jalankan inisialisasi untuk record yang sudah ada
SELECT initialize_payment_update_all();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- Tampilkan informasi trigger berhasil dibuat
DO $$
BEGIN
    RAISE NOTICE 'Enhanced payment update trigger successfully installed!';
    RAISE NOTICE 'Trigger will detect changes in: down_payment, remaining_payment, pelunasan';
    RAISE NOTICE 'Use orders_payment_status view to monitor payment status';
    RAISE NOTICE 'Use get_payment_history(uuid) function to get payment history for specific order';
END $$;

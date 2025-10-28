-- =====================================================
-- TEST SCRIPT: Payment Update Trigger
-- Description: Script untuk test trigger payment_update
-- Sesuai dengan struktur tabel orders yang sebenarnya
-- =====================================================

-- =====================================================
-- SETUP TEST DATA
-- =====================================================
-- Buat test order jika belum ada
INSERT INTO orders (
    id,
    order_number,
    customer_id,
    customer_name,
    tanggal,
    total_amount,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_type,
    status_id,
    created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'TEST-001',
    NULL,
    'Test Customer',
    CURRENT_DATE,
    1000000,
    0,
    1000000,
    0,
    NULL,
    1,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TEST 1: Update Down Payment
-- =====================================================
RAISE NOTICE '=== TEST 1: Update Down Payment ===';

-- Lihat status sebelum update
SELECT 
    order_number,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_update,
    created_at
FROM orders 
WHERE order_number = 'TEST-001';

-- Update down payment
UPDATE orders 
SET down_payment = 500000 
WHERE order_number = 'TEST-001';

-- Lihat status setelah update
SELECT 
    order_number,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_update,
    created_at
FROM orders 
WHERE order_number = 'TEST-001';

-- =====================================================
-- TEST 2: Update Remaining Payment
-- =====================================================
RAISE NOTICE '=== TEST 2: Update Remaining Payment ===';

-- Update remaining payment
UPDATE orders 
SET remaining_payment = 500000 
WHERE order_number = 'TEST-001';

-- Lihat status setelah update
SELECT 
    order_number,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_update,
    created_at
FROM orders 
WHERE order_number = 'TEST-001';

-- =====================================================
-- TEST 3: Update Both Payment Fields
-- =====================================================
RAISE NOTICE '=== TEST 3: Update Both Payment Fields ===';

-- Update kedua field sekaligus
UPDATE orders 
SET 
    down_payment = 300000,
    remaining_payment = 700000
WHERE order_number = 'TEST-001';

-- Lihat status setelah update
SELECT 
    order_number,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_update,
    created_at
FROM orders 
WHERE order_number = 'TEST-001';

-- =====================================================
-- TEST 4: Update Non-Payment Fields (Should Not Trigger)
-- =====================================================
RAISE NOTICE '=== TEST 4: Update Non-Payment Fields (Should Not Trigger) ===';

-- Simpan payment_update sebelum update
SELECT payment_update INTO @old_payment_update
FROM orders 
WHERE order_number = 'TEST-001';

-- Update field non-payment
UPDATE orders 
SET 
    customer_name = 'Updated Test Customer',
    notes = 'Updated notes'
WHERE order_number = 'TEST-001';

-- Lihat status setelah update (payment_update tidak boleh berubah)
SELECT 
    order_number,
    customer_name,
    notes,
    payment_update,
    @old_payment_update as old_payment_update
FROM orders 
WHERE order_number = 'TEST-001';

-- =====================================================
-- TEST 5: Test Payment Status View
-- =====================================================
RAISE NOTICE '=== TEST 5: Test Payment Status View ===';

-- Lihat status pembayaran melalui view
SELECT 
    order_number,
    total_amount,
    down_payment,
    remaining_payment,
    pelunasan,
    total_paid,
    remaining_amount,
    payment_status,
    payment_update
FROM orders_payment_status 
WHERE order_number = 'TEST-001';

-- =====================================================
-- TEST 6: Test Payment History Function
-- =====================================================
RAISE NOTICE '=== TEST 6: Test Payment History Function ===';

-- Lihat history pembayaran
SELECT * FROM get_payment_history('11111111-1111-1111-1111-111111111111');

-- =====================================================
-- TEST 7: Test Reset Payment Update Function
-- =====================================================
RAISE NOTICE '=== TEST 7: Test Reset Payment Update Function ===';

-- Reset payment_update
SELECT reset_payment_update('11111111-1111-1111-1111-111111111111');

-- Lihat status setelah reset
SELECT 
    order_number,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_update,
    created_at
FROM orders 
WHERE order_number = 'TEST-001';

-- =====================================================
-- TEST 8: Test NULL Values
-- =====================================================
RAISE NOTICE '=== TEST 8: Test NULL Values ===';

-- Test dengan NULL values
UPDATE orders 
SET 
    down_payment = NULL,
    remaining_payment = NULL,
    pelunasan = NULL
WHERE order_number = 'TEST-001';

-- Lihat status
SELECT 
    order_number,
    down_payment,
    remaining_payment,
    pelunasan,
    payment_update
FROM orders 
WHERE order_number = 'TEST-001';

-- Update kembali dengan nilai
UPDATE orders 
SET 
    down_payment = 0,
    remaining_payment = 1000000,
    pelunasan = 0
WHERE order_number = 'TEST-001';

-- =====================================================
-- CLEANUP TEST DATA
-- =====================================================
RAISE NOTICE '=== CLEANUP TEST DATA ===';

-- Hapus test data
DELETE FROM orders WHERE order_number = 'TEST-001';

RAISE NOTICE 'Test completed successfully!';

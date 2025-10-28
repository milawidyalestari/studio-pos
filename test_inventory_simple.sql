-- =====================================================
-- TEST SCRIPT: Inventory Auto Deduction System (Simple)
-- Description: Script untuk test sistem inventory otomatis
-- Sesuai dengan struktur tabel yang sebenarnya
-- =====================================================

-- =====================================================
-- SETUP TEST DATA
-- =====================================================

-- 1. Buat test materials jika belum ada
INSERT INTO materials (id, name, unit, stok_aktif, stok_minimum, cost_per_unit) VALUES
('11111111-1111-1111-1111-111111111111', 'Kertas A4', 'lembar', 1000, 100, 500),
('22222222-2222-2222-2222-222222222222', 'Tinta Hitam', 'ml', 500, 50, 1000),
('33333333-3333-3333-3333-333333333333', 'Tinta Warna', 'ml', 300, 30, 1500)
ON CONFLICT (id) DO NOTHING;

-- 2. Buat test products jika belum ada
INSERT INTO products (id, kode, nama, kategori, harga) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRD001', 'Print A4 Hitam Putih', 'Print', 2000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PRD002', 'Print A4 Warna', 'Print', 5000)
ON CONFLICT (id) DO NOTHING;

-- 3. Buat relasi product-materials
INSERT INTO product_materials (product_id, material_id, quantity_per_unit) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1.0),  -- 1 lembar kertas A4
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 0.5),  -- 0.5ml tinta hitam
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1.0),  -- 1 lembar kertas A4
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 1.0)   -- 1ml tinta warna
ON CONFLICT (product_id, material_id) DO NOTHING;

-- 4. Buat test order
INSERT INTO orders (
    id, order_number, customer_name, tanggal, total_amount, status_id
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'TEST-INV-001',
    'Test Customer Inventory',
    CURRENT_DATE,
    15000,
    1  -- Unnest status
) ON CONFLICT (id) DO NOTHING;

-- 5. Buat test order items
INSERT INTO order_items (order_id, item_id, item_name, quantity, unit_price, sub_total) VALUES
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Print A4 Hitam Putih', 5, 2000, 10000),
('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Print A4 Warna', 1, 5000, 5000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TEST 1: Check Material Requirements
-- =====================================================
RAISE NOTICE '=== TEST 1: Check Material Requirements ===';

-- Lihat bahan yang dibutuhkan untuk order
SELECT * FROM get_order_material_requirements('55555555-5555-5555-5555-555555555555');

-- =====================================================
-- TEST 2: Check Stock Availability
-- =====================================================
RAISE NOTICE '=== TEST 2: Check Stock Availability ===';

-- Cek ketersediaan stok
SELECT * FROM check_stock_availability('55555555-5555-5555-5555-555555555555');

-- =====================================================
-- TEST 3: Manual Process Inventory
-- =====================================================
RAISE NOTICE '=== TEST 3: Manual Process Inventory ===';

-- Proses inventory secara manual
SELECT * FROM manual_process_order_inventory('55555555-5555-5555-5555-555555555555');

-- =====================================================
-- TEST 4: Check Materials After Deduction
-- =====================================================
RAISE NOTICE '=== TEST 4: Check Materials After Deduction ===';

-- Lihat stok bahan setelah pengurangan
SELECT 
    name,
    unit,
    stok_aktif,
    stok_keluar,
    stok_minimum
FROM materials 
WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
)
ORDER BY name;

-- =====================================================
-- TEST 5: Check Inventory Movements
-- =====================================================
RAISE NOTICE '=== TEST 5: Check Inventory Movements ===';

-- Lihat pergerakan inventory
SELECT 
    m.name as material_name,
    im.tipe_mutasi,
    im.jumlah,
    im.keterangan,
    im.tanggal
FROM inventory_movements im
JOIN materials m ON im.material_id = m.id
WHERE im.keterangan LIKE '%order: 55555555-5555-5555-5555-555555555555%'
ORDER BY im.tanggal;

-- =====================================================
-- TEST 6: Test Order Status Change (Automatic)
-- =====================================================
RAISE NOTICE '=== TEST 6: Test Order Status Change (Automatic) ===';

-- Buat order baru untuk test otomatis
INSERT INTO orders (
    id, order_number, customer_name, tanggal, total_amount, status_id
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'TEST-INV-002',
    'Test Customer Auto',
    CURRENT_DATE,
    4000,
    1  -- Unnest status
) ON CONFLICT (id) DO NOTHING;

-- Buat order items
INSERT INTO order_items (order_id, item_id, item_name, quantity, unit_price, sub_total) VALUES
('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Print A4 Hitam Putih', 2, 2000, 4000)
ON CONFLICT DO NOTHING;

-- Simpan stok sebelum perubahan status
SELECT 
    name,
    stok_aktif as stock_before
FROM materials 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Ubah status order ke "Proses Cetak" (status_id = 6)
UPDATE orders 
SET status_id = 6 
WHERE id = '66666666-6666-6666-6666-666666666666';

-- Lihat stok setelah perubahan status
SELECT 
    name,
    stok_aktif as stock_after,
    stok_keluar
FROM materials 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- =====================================================
-- TEST 7: Check Inventory Usage Summary
-- =====================================================
RAISE NOTICE '=== TEST 7: Check Inventory Usage Summary ===';

-- Lihat summary penggunaan inventory
SELECT * FROM inventory_usage_summary 
WHERE order_id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
)
ORDER BY deduction_date DESC;

-- =====================================================
-- TEST 8: Check Low Stock Alert
-- =====================================================
RAISE NOTICE '=== TEST 8: Check Low Stock Alert ===';

-- Lihat alert stok rendah
SELECT * FROM low_stock_alert;

-- =====================================================
-- CLEANUP TEST DATA
-- =====================================================
RAISE NOTICE '=== CLEANUP TEST DATA ===';

-- Hapus test data
DELETE FROM inventory_movements WHERE keterangan LIKE '%order: 55555555-5555-5555-5555-555555555555%' 
   OR keterangan LIKE '%order: 66666666-6666-6666-6666-666666666666%';

DELETE FROM order_items WHERE order_id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

DELETE FROM orders WHERE id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

-- Reset stok materials ke nilai awal
UPDATE materials SET 
    stok_aktif = 1000, 
    stok_keluar = 0 
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE materials SET 
    stok_aktif = 500, 
    stok_keluar = 0 
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE materials SET 
    stok_aktif = 300, 
    stok_keluar = 0 
WHERE id = '33333333-3333-3333-3333-333333333333';

RAISE NOTICE 'Inventory auto deduction system test completed successfully!';

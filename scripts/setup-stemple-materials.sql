-- Script untuk mengonfigurasi bahan produk Stemple
-- Jalankan script ini untuk mengatur bahan yang digunakan pada produk Stemple

-- 1. Pastikan bahan sudah ada di tabel materials
-- Jika belum ada, tambahkan bahan-bahan yang diperlukan:

-- Bahan Gagang 2743
INSERT INTO materials (name, description, unit, kategori, stok_aktif, stok_minimum, stok_akhir, stok_opname, is_active)
VALUES (
    'Gagang 2743', 
    'Gagang untuk stempel', 
    'pcs', 
    'Komponen Stempel', 
    100, -- stok awal
    10,  -- stok minimum
    100, -- stok akhir
    100, -- stok opname
    true
) ON CONFLICT (name) DO NOTHING;

-- Bahan Tinta Merah
INSERT INTO materials (name, description, unit, kategori, stok_aktif, stok_minimum, stok_akhir, stok_opname, is_active)
VALUES (
    'Tinta Merah', 
    'Tinta warna merah untuk stempel', 
    'pcs', 
    'Tinta', 
    50,  -- stok awal
    5,   -- stok minimum
    50,  -- stok akhir
    50,  -- stok opname
    true
) ON CONFLICT (name) DO NOTHING;

-- 2. Cari ID produk Stemple (ganti dengan ID yang sesuai)
-- Anda perlu mencari ID produk Stemple terlebih dahulu
-- SELECT id, nama FROM products WHERE nama ILIKE '%stemple%';

-- 3. Kaitkan bahan dengan produk Stemple
-- Ganti 'PRODUCT_ID_STEMPLE' dengan ID produk Stemple yang sebenarnya
-- Ganti 'MATERIAL_ID_GAGANG' dengan ID bahan Gagang 2743
-- Ganti 'MATERIAL_ID_TINTA' dengan ID bahan Tinta Merah

-- Contoh (ganti ID-nya dengan yang sebenarnya):
/*
INSERT INTO product_materials (product_id, material_id, quantity_per_unit, notes)
VALUES 
    ('PRODUCT_ID_STEMPLE', 'MATERIAL_ID_GAGANG', 1, '1 gagang per stempel'),
    ('PRODUCT_ID_STEMPLE', 'MATERIAL_ID_TINTA', 1, '1 tinta merah per stempel')
ON CONFLICT (product_id, material_id) DO UPDATE SET
    quantity_per_unit = EXCLUDED.quantity_per_unit,
    notes = EXCLUDED.notes;
*/

-- 4. Query untuk melihat konfigurasi yang sudah dibuat
SELECT 
    p.nama as produk,
    m.name as bahan,
    pm.quantity_per_unit,
    pm.notes
FROM products p
JOIN product_materials pm ON p.id = pm.product_id
JOIN materials m ON pm.material_id = m.id
WHERE p.nama ILIKE '%stemple%'
ORDER BY p.nama, m.name;

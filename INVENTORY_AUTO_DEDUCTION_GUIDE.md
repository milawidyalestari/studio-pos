# Inventory Auto Deduction System Guide

## Overview
Sistem ini secara otomatis mengurangi stok bahan dari inventory ketika order berubah status menjadi "Proses Cetak", "Done", atau "Selesai Diambil". Sistem ini memastikan bahwa penggunaan bahan tercatat dengan akurat dan stok inventory selalu up-to-date.

## Fitur Utama

### 1. Deteksi Perubahan Status Order Otomatis
- Trigger yang mendeteksi perubahan `status_id` pada tabel `orders`
- Hanya memproses status: "Proses Cetak", "Done", "Selesai Diambil"
- Mencegah duplikasi pengurangan stok

### 2. Perhitungan Bahan Otomatis
- Menghitung total bahan yang dibutuhkan berdasarkan `order_items`
- Menggunakan relasi `product_materials` untuk menentukan jumlah bahan per produk
- Mempertimbangkan quantity order items

### 3. Pengecekan Ketersediaan Stok
- Mengecek apakah stok bahan mencukupi sebelum pengurangan
- Memberikan warning jika stok tidak mencukupi
- Tetap memproses dengan stok yang tersedia

### 4. Pencatatan Pergerakan Inventory
- Mencatat setiap pengurangan stok di `inventory_movements`
- Menyimpan informasi stok sebelum dan sesudah
- Menyimpan referensi ke order yang menyebabkan pengurangan

## Struktur Database yang Dibutuhkan

### Tabel Utama:
- `orders` - Tabel order dengan `status_id`
- `order_items` - Item dalam order dengan `item_id` (product_id)
- `products` - Produk yang dipesan
- `materials` - Bahan baku dengan `stok_aktif`, `stok_keluar`
- `product_materials` - Relasi produk-bahan dengan `quantity_per_unit`
- `inventory_movements` - Pergerakan stok
- `order_statuses` - Status order

### Kolom Penting:
- `materials.stok_aktif` - Stok yang tersedia
- `materials.stok_keluar` - Total stok yang keluar
- `product_materials.quantity_per_unit` - Jumlah bahan per unit produk
- `inventory_movements.movement_type` - 'out' untuk stok keluar

## Functions yang Tersedia

### 1. `calculate_material_usage_for_order(order_uuid)`
Menghitung total bahan yang dibutuhkan untuk order tertentu.
```sql
SELECT * FROM calculate_material_usage_for_order('order-uuid-here');
```

### 2. `check_stock_availability(order_uuid)`
Mengecek ketersediaan stok untuk order tertentu.
```sql
SELECT * FROM check_stock_availability('order-uuid-here');
```

### 3. `deduct_materials_from_inventory(order_uuid)`
Mengurangi stok bahan dari inventory.
```sql
SELECT * FROM deduct_materials_from_inventory('order-uuid-here');
```

### 4. `manual_process_order_inventory(order_uuid)`
Memproses inventory secara manual untuk order tertentu.
```sql
SELECT * FROM manual_process_order_inventory('order-uuid-here');
```

### 5. `get_order_material_requirements(order_uuid)`
Mendapatkan daftar bahan yang dibutuhkan untuk order.
```sql
SELECT * FROM get_order_material_requirements('order-uuid-here');
```

## Views yang Tersedia

### 1. `inventory_usage_summary`
View untuk monitoring penggunaan bahan dari order.
```sql
SELECT * FROM inventory_usage_summary 
WHERE order_id = 'order-uuid-here';
```

### 2. `low_stock_alert`
View untuk alert stok bahan yang rendah.
```sql
SELECT * FROM low_stock_alert;
```

## Cara Menggunakan

### 1. Installasi Sistem
```sql
-- Jalankan script utama
\i inventory_auto_deduction_system.sql
```

### 2. Test Sistem
```sql
-- Jalankan test script
\i test_inventory_auto_deduction.sql
```

### 3. Monitoring Inventory
```sql
-- Lihat penggunaan bahan
SELECT * FROM inventory_usage_summary 
ORDER BY deduction_date DESC;

-- Lihat alert stok rendah
SELECT * FROM low_stock_alert;

-- Lihat pergerakan stok
SELECT 
    m.name,
    im.movement_type,
    im.quantity,
    im.stock_before,
    im.stock_after,
    im.created_at
FROM inventory_movements im
JOIN materials m ON im.material_id = m.id
WHERE im.reference_type = 'order'
ORDER BY im.created_at DESC;
```

## Workflow Sistem

### 1. Order Dibuat
- Order dibuat dengan status awal (biasanya "Unnest")
- Order items ditambahkan dengan referensi ke products
- Belum ada pengurangan stok

### 2. Order Berubah Status
- User mengubah status order ke "Proses Cetak", "Done", atau "Selesai Diambil"
- Trigger `trigger_order_inventory_deduction` aktif
- Function `process_order_inventory_deduction()` dipanggil

### 3. Perhitungan Bahan
- Sistem menghitung total bahan yang dibutuhkan
- Berdasarkan order items × quantity_per_unit dari product_materials
- Mengecek ketersediaan stok

### 4. Pengurangan Stok
- Mengurangi `stok_aktif` di tabel `materials`
- Menambah `stok_keluar` di tabel `materials`
- Mencatat pergerakan di `inventory_movements`

### 5. Pencatatan
- Setiap pengurangan dicatat dengan detail lengkap
- Menyimpan referensi ke order yang menyebabkan pengurangan
- Menyimpan stok sebelum dan sesudah

## Contoh Skenario

### Skenario 1: Order Normal
```
Order: Print A4 Hitam Putih x 10
Product: PRD001 (Print A4 Hitam Putih)
Materials needed:
- Kertas A4: 10 lembar (10 × 1.0)
- Tinta Hitam: 5 ml (10 × 0.5)

Status berubah ke "Proses Cetak" → Stok otomatis dikurangi
```

### Skenario 2: Order dengan Bahan Ganda
```
Order: 
- Print A4 Hitam Putih x 5
- Print A4 Warna x 2

Materials needed:
- Kertas A4: 7 lembar (5×1.0 + 2×1.0)
- Tinta Hitam: 2.5 ml (5×0.5)
- Tinta Warna: 2 ml (2×1.0)
```

### Skenario 3: Stok Tidak Mencukupi
```
Order: Print A4 Hitam Putih x 1000
Required: 1000 lembar kertas A4
Available: 100 lembar kertas A4
Result: Warning + hanya mengurangi 100 lembar
```

## Monitoring dan Alert

### 1. Low Stock Alert
```sql
-- Lihat bahan yang stoknya rendah
SELECT * FROM low_stock_alert;
```

### 2. Inventory Usage Report
```sql
-- Laporan penggunaan bahan per periode
SELECT 
    DATE(deduction_date) as tanggal,
    material_name,
    SUM(quantity_used) as total_digunakan
FROM inventory_usage_summary 
WHERE deduction_date >= '2025-01-01'
GROUP BY DATE(deduction_date), material_name
ORDER BY tanggal DESC;
```

### 3. Order Material Requirements
```sql
-- Lihat kebutuhan bahan untuk order tertentu
SELECT * FROM get_order_material_requirements('order-uuid-here');
```

## Troubleshooting

### 1. Stok Tidak Berkurang
- Pastikan order status berubah ke status yang benar
- Cek apakah `product_materials` sudah terisi
- Pastikan `order_items.item_id` sesuai dengan `products.id`

### 2. Duplikasi Pengurangan
- Sistem sudah mencegah duplikasi dengan mengecek `inventory_movements`
- Jika terjadi duplikasi, cek data di `inventory_movements`

### 3. Stok Negatif
- Sistem tidak mengizinkan stok negatif
- Jika stok tidak mencukupi, akan mengurangi sebatas yang tersedia
- Cek log warning untuk detail

### 4. Performance Issues
- Pastikan ada index pada `order_items.order_id`
- Pastikan ada index pada `product_materials.product_id`
- Pastikan ada index pada `inventory_movements.material_id`

## Maintenance

### 1. Backup Data
```sql
-- Backup inventory movements
SELECT * FROM inventory_movements 
WHERE created_at >= '2025-01-01';
```

### 2. Reset Stok (Hati-hati!)
```sql
-- Reset stok keluar (jangan di production!)
UPDATE materials SET stok_keluar = 0;
```

### 3. Audit Trail
```sql
-- Lihat semua pergerakan stok
SELECT 
    m.name,
    im.movement_type,
    im.quantity,
    im.reference_type,
    o.order_number,
    im.created_at
FROM inventory_movements im
JOIN materials m ON im.material_id = m.id
LEFT JOIN orders o ON im.reference_id = o.id
ORDER BY im.created_at DESC;
```

## Keamanan

### 1. Data Integrity
- Sistem menggunakan transaction untuk memastikan konsistensi
- Rollback otomatis jika terjadi error

### 2. Audit Trail
- Semua pergerakan stok tercatat dengan detail
- Tidak ada data yang bisa dihapus tanpa trace

### 3. Validation
- Validasi ketersediaan stok sebelum pengurangan
- Validasi data input sebelum pemrosesan

## Kesimpulan

Sistem Inventory Auto Deduction ini memberikan:
- ✅ Pengurangan stok otomatis saat order berubah status
- ✅ Pencatatan pergerakan inventory yang akurat
- ✅ Monitoring dan alert stok rendah
- ✅ Audit trail lengkap
- ✅ Pencegahan duplikasi pengurangan
- ✅ Handling stok tidak mencukupi
- ✅ Performance yang optimal

Sistem ini memastikan bahwa inventory selalu akurat dan penggunaan bahan tercatat dengan detail untuk keperluan akuntansi dan manajemen.

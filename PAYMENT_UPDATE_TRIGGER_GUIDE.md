# Payment Update Trigger Guide

## Overview
Trigger ini secara otomatis mendeteksi perubahan pada kolom `down_payment` (DP), `remaining_payment`, atau `pelunasan` di tabel `orders` dan memperbarui kolom `payment_update` dengan timestamp saat perubahan terjadi.

## Fitur Utama

### 1. Deteksi Perubahan Otomatis
- Mendeteksi perubahan pada kolom `down_payment`, `remaining_payment`, dan `pelunasan`
- Menggunakan `IS DISTINCT FROM` untuk mendeteksi perubahan yang akurat (termasuk NULL)
- Hanya memperbarui `payment_update` jika benar-benar ada perubahan

### 2. Logging dan Debugging
- Menyediakan log untuk setiap perubahan pembayaran
- Mencatat nilai lama dan baru untuk debugging
- Menampilkan order number yang diupdate

### 3. Handling Edge Cases
- Menangani nilai NULL dengan benar
- Normalisasi nilai ke 0 untuk perbandingan
- Tidak memperbarui jika hanya field non-payment yang berubah

## File yang Dibuat

### 1. Migration Script
- `db-migrations/04-functions-triggers/003_enhanced_payment_update_trigger.sql`
- Script migration untuk menerapkan trigger ke database

### 2. Test Script
- `test_payment_update_trigger.sql`
- Script untuk testing dan verifikasi trigger

### 3. Standalone Script
- `payment_update_trigger_enhanced.sql`
- Script lengkap untuk implementasi manual

## Cara Menggunakan

### 1. Menerapkan Trigger
```sql
-- Jalankan migration script
\i db-migrations/04-functions-triggers/003_enhanced_payment_update_trigger.sql
```

### 2. Inisialisasi Data Existing
```sql
-- Set payment_update untuk semua record yang sudah ada
SELECT initialize_payment_update_all();
```

### 3. Testing Trigger
```sql
-- Jalankan test script
\i test_payment_update_trigger.sql
```

## Functions yang Tersedia

### 1. `update_payment_update_timestamp_enhanced()`
- Function utama untuk trigger
- Mendeteksi perubahan pada `down_payment`, `remaining_payment`, dan `pelunasan`
- Update timestamp dan menyediakan logging

### 2. `initialize_payment_update_all()`
- Inisialisasi payment_update untuk semua record existing
- Mengembalikan jumlah record yang diupdate

### 3. `reset_payment_update(order_uuid)`
- Reset payment_update untuk order tertentu
- Mengembalikan boolean (true/false)

### 4. `get_payment_history(order_uuid)`
- Mengambil history pembayaran untuk order tertentu
- Mengembalikan tabel dengan informasi pembayaran lengkap termasuk `remaining_payment`

## Views yang Tersedia

### `orders_payment_status`
View yang menampilkan status pembayaran semua order:
```sql
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
FROM orders_payment_status;
```

## Contoh Penggunaan

### 1. Update Down Payment
```sql
UPDATE orders 
SET down_payment = 500000 
WHERE order_number = 'ORD-001';
-- payment_update akan otomatis diupdate ke timestamp sekarang
```

### 2. Update Remaining Payment
```sql
UPDATE orders 
SET remaining_payment = 500000 
WHERE order_number = 'ORD-001';
-- payment_update akan otomatis diupdate ke timestamp sekarang
```

### 3. Update Pelunasan
```sql
UPDATE orders 
SET pelunasan = 1000000 
WHERE order_number = 'ORD-001';
-- payment_update akan otomatis diupdate ke timestamp sekarang
```

### 4. Update Multiple Payment Fields
```sql
UPDATE orders 
SET 
    down_payment = 300000,
    remaining_payment = 700000
WHERE order_number = 'ORD-001';
-- payment_update akan otomatis diupdate ke timestamp sekarang
```

### 5. Update Field Non-Payment
```sql
UPDATE orders 
SET customer_name = 'New Customer Name' 
WHERE order_number = 'ORD-001';
-- payment_update TIDAK akan berubah
```

## Monitoring dan Debugging

### 1. Melihat Log Perubahan
Trigger akan menampilkan log seperti:
```
NOTICE: Down payment changed from 0 to 500000 for order ORD-001
NOTICE: Remaining payment changed from 1000000 to 500000 for order ORD-001
NOTICE: Payment update timestamp updated to 2025-01-15 10:30:45.123+07 for order ORD-001
```

### 2. Melihat Status Pembayaran
```sql
-- Lihat status pembayaran semua order
SELECT * FROM orders_payment_status 
ORDER BY payment_update DESC;

-- Lihat history pembayaran order tertentu
SELECT * FROM get_payment_history('order-uuid-here');
```

### 3. Reset Payment Update
```sql
-- Reset payment_update untuk order tertentu
SELECT reset_payment_update('order-uuid-here');
```

## Troubleshooting

### 1. Trigger Tidak Berfungsi
- Pastikan trigger sudah dibuat: `\d+ orders`
- Cek log PostgreSQL untuk error
- Pastikan function `update_payment_update_timestamp_enhanced()` ada

### 2. Payment Update Tidak Berubah
- Pastikan ada perubahan pada `down_payment`, `remaining_payment`, atau `pelunasan`
- Cek apakah nilai benar-benar berbeda (termasuk NULL)
- Lihat log untuk debugging

### 3. Performance Issues
- Trigger hanya berjalan pada UPDATE, tidak pada INSERT
- Logging dapat di-disable jika tidak diperlukan
- Index pada `payment_update` sudah tersedia

## Konfigurasi

### 1. Disable Logging
Untuk disable logging, edit function dan hapus baris `RAISE NOTICE`:
```sql
-- Hapus baris-baris ini dari function:
-- RAISE NOTICE 'Down payment changed from % to % for order %', old_dp, new_dp, NEW.order_number;
-- RAISE NOTICE 'Pelunasan changed from % to % for order %', old_pelunasan, new_pelunasan, NEW.order_number;
-- RAISE NOTICE 'Payment update timestamp updated to % for order %', NEW.payment_update, NEW.order_number;
```

### 2. Custom Logging
Anda dapat menambahkan custom logging atau menyimpan ke tabel log:
```sql
-- Contoh: Simpan ke tabel audit_log
INSERT INTO audit_log (table_name, operation, old_values, new_values, timestamp)
VALUES ('orders', 'payment_update', 
        json_build_object('down_payment', OLD.down_payment, 'pelunasan', OLD.pelunasan),
        json_build_object('down_payment', NEW.down_payment, 'pelunasan', NEW.pelunasan),
        NOW());
```

## Maintenance

### 1. Backup Trigger
```sql
-- Backup function
pg_dump -t orders --schema-only > orders_backup.sql
```

### 2. Update Trigger
```sql
-- Update function jika diperlukan
CREATE OR REPLACE FUNCTION update_payment_update_timestamp_enhanced()
-- ... function body ...
```

### 3. Monitor Performance
```sql
-- Cek performa trigger
SELECT 
    schemaname,
    tablename,
    triggername,
    enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE tablename = 'orders';
```

## Kesimpulan

Trigger ini memberikan solusi yang robust untuk:
- ✅ Deteksi otomatis perubahan DP/remaining_payment/pelunasan
- ✅ Update timestamp payment_update secara otomatis
- ✅ Logging untuk debugging dan monitoring
- ✅ Handling edge cases (NULL, zero values)
- ✅ Functions dan views untuk management
- ✅ Testing dan dokumentasi lengkap

Trigger ini memastikan bahwa `payment_update` selalu mencerminkan waktu terakhir kali pembayaran diupdate, memberikan akurasi data yang tinggi untuk sistem POS Anda.

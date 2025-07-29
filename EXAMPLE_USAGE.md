# Contoh Penggunaan Sistem Pengurangan Stok Bahan

## Skenario 1: Setup Awal

### 1. Setup Bahan di Inventory
```sql
-- Contoh data bahan
INSERT INTO materials (id, kode, nama, stok_akhir, stok_keluar, stok_aktif, stok_minimum) VALUES
('mat-001', 'BHN0001', 'Kertas A4 80gsm', 1000, 0, true, 100),
('mat-002', 'BHN0002', 'Tinta Hitam', 50, 0, true, 10),
('mat-003', 'BHN0003', 'Tinta Warna', 30, 0, true, 5);
```

### 2. Setup Produk di Master Data
```sql
-- Contoh data produk
INSERT INTO products (id, kode, nama, jenis, harga_jual) VALUES
('prod-001', 'PRD0001', 'Print A4 Hitam Putih', 'Product', 500),
('prod-002', 'PRD0002', 'Print A4 Berwarna', 'Product', 1000);
```

### 3. Hubungkan Produk dengan Bahan
```sql
-- Produk Print A4 Hitam Putih menggunakan Kertas A4 dan Tinta Hitam
INSERT INTO product_materials (product_id, material_id) VALUES
('prod-001', 'mat-001'), -- Kertas A4
('prod-001', 'mat-002'); -- Tinta Hitam

-- Produk Print A4 Berwarna menggunakan Kertas A4 dan Tinta Warna
INSERT INTO product_materials (product_id, material_id) VALUES
('prod-002', 'mat-001'), -- Kertas A4
('prod-002', 'mat-003'); -- Tinta Warna
```

## Skenario 2: Membuat Order

### Order 1: Print A4 Hitam Putih (10 lembar)
```javascript
// Data order
const orderData = {
  orderNumber: 'ORD-2025-001',
  customer: 'John Doe',
  items: [
    {
      item_name: 'PRD0001', // Kode produk Print A4 Hitam Putih
      quantity: 10,
      subTotal: 5000
    }
  ]
};

// Hasil pengurangan stok otomatis:
// - Kertas A4: stok_akhir = 1000 - 10 = 990
// - Tinta Hitam: stok_akhir = 50 - 10 = 40
```

### Order 2: Print A4 Berwarna (5 lembar)
```javascript
const orderData = {
  orderNumber: 'ORD-2025-002',
  customer: 'Jane Smith',
  items: [
    {
      item_name: 'PRD0002', // Kode produk Print A4 Berwarna
      quantity: 5,
      subTotal: 5000
    }
  ]
};

// Hasil pengurangan stok otomatis:
// - Kertas A4: stok_akhir = 990 - 5 = 985
// - Tinta Warna: stok_akhir = 30 - 5 = 25
```

## Skenario 3: Update Order

### Update Order 1: Mengubah quantity dari 10 menjadi 15
```javascript
// Sebelum update:
// - Kertas A4: stok_akhir = 985
// - Tinta Hitam: stok_akhir = 40

// Proses update:
// 1. Kembalikan stok lama: +10 untuk Kertas A4 dan Tinta Hitam
// 2. Kurangi stok baru: -15 untuk Kertas A4 dan Tinta Hitam

// Setelah update:
// - Kertas A4: stok_akhir = 985 + 10 - 15 = 980
// - Tinta Hitam: stok_akhir = 40 + 10 - 15 = 35
```

## Skenario 4: Hapus Order

### Hapus Order 2
```javascript
// Sebelum hapus:
// - Kertas A4: stok_akhir = 980
// - Tinta Warna: stok_akhir = 25

// Proses hapus:
// 1. Kembalikan stok: +5 untuk Kertas A4 dan Tinta Warna

// Setelah hapus:
// - Kertas A4: stok_akhir = 980 + 5 = 985
// - Tinta Warna: stok_akhir = 25 + 5 = 30
```

## Skenario 5: Bahan Non-Aktif

### Bahan dengan stok_aktif = false
```sql
-- Update bahan menjadi non-aktif
UPDATE materials SET stok_aktif = false WHERE kode = 'BHN0002';

-- Order dengan produk yang menggunakan bahan non-aktif
const orderData = {
  orderNumber: 'ORD-2025-003',
  customer: 'Bob Wilson',
  items: [
    {
      item_name: 'PRD0001', // Menggunakan Tinta Hitam (non-aktif)
      quantity: 20,
      subTotal: 10000
    }
  ]
};

// Hasil:
// - Kertas A4: stok_akhir = 985 - 20 = 965 (berkurang)
// - Tinta Hitam: stok_akhir = 35 (tidak berubah, karena non-aktif)
// Console log: "Material Tinta Hitam is not active, skipping stock reduction"
```

## Monitoring dan Log

### Console Log untuk Order 1
```
Starting material stock reduction for order items: [Array]
Product found: Print A4 Hitam Putih
No materials found for product: Print A4 Hitam Putih
Material Kertas A4 is active, processing...
Successfully reduced stock for material Kertas A4: 10 units
Material Tinta Hitam is active, processing...
Successfully reduced stock for material Tinta Hitam: 10 units
Material stock reduction completed successfully
```

### Inventory Movements Log
```sql
-- Pergerakan stok untuk Order 1
INSERT INTO inventory_movements (material_id, tanggal, tipe_mutasi, jumlah, keterangan) VALUES
('mat-001', '2025-01-15 10:30:00', 'penggunaan', -10, 'Penggunaan untuk order: PRD0001 (10 unit)'),
('mat-002', '2025-01-15 10:30:00', 'penggunaan', -10, 'Penggunaan untuk order: PRD0001 (10 unit)');
```

### Warning Stok Minimum
```javascript
// Jika stok mencapai minimum
if (newStokAkhir <= material.stok_minimum) {
  console.warn(`Warning: Material ${material.nama} stock is at or below minimum (${newStokAkhir}/${material.stok_minimum})`);
}

// Output:
// Warning: Material Tinta Hitam stock is at or below minimum (35/10)
```

## Testing Checklist

### 1. Setup Testing
- [ ] Buat bahan dengan stok_aktif = true
- [ ] Buat produk di Master Data
- [ ] Hubungkan produk dengan bahan melalui ProductForm
- [ ] Pastikan stok awal sudah diset dengan benar

### 2. Test Create Order
- [ ] Buat order dengan produk yang memiliki bahan terkait
- [ ] Verifikasi stok bahan berkurang sesuai quantity
- [ ] Cek tabel inventory_movements untuk pencatatan
- [ ] Cek console log untuk konfirmasi proses

### 3. Test Update Order
- [ ] Update quantity order
- [ ] Verifikasi stok lama dikembalikan
- [ ] Verifikasi stok baru dikurangi
- [ ] Cek inventory_movements untuk kedua operasi

### 4. Test Delete Order
- [ ] Hapus order
- [ ] Verifikasi stok dikembalikan
- [ ] Cek inventory_movements untuk pengembalian

### 5. Test Edge Cases
- [ ] Order dengan bahan non-aktif
- [ ] Order dengan quantity 0
- [ ] Order dengan produk tanpa bahan terkait
- [ ] Error handling saat database error

## Performance Considerations

### 1. Batch Processing
- Sistem memproses setiap bahan secara individual
- Untuk order dengan banyak bahan, pertimbangkan batch processing

### 2. Database Indexes
```sql
-- Index untuk optimasi query
CREATE INDEX idx_product_materials_product_id ON product_materials(product_id);
CREATE INDEX idx_product_materials_material_id ON product_materials(material_id);
CREATE INDEX idx_materials_stok_aktif ON materials(stok_aktif);
```

### 3. Caching
- Pertimbangkan caching untuk data bahan yang sering diakses
- Cache dapat di-invalidate ketika ada perubahan stok

## Security Considerations

### 1. Transaction Management
- Semua operasi stok sebaiknya dalam satu transaction
- Rollback jika terjadi error pada salah satu operasi

### 2. User Permissions
- Pastikan hanya user yang berwenang yang dapat mengubah stok
- Log user_id untuk audit trail

### 3. Data Validation
- Validasi quantity tidak boleh negatif
- Validasi stok tidak boleh kurang dari 0
- Validasi produk dan bahan harus ada sebelum operasi 
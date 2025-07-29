# Update Fitur Quantity Per Unit

## Perubahan yang Sudah Dilakukan

### 1. Database Migration
- File: `supabase/migrations/20250712000000_add_quantity_per_unit_to_product_materials.sql`
- Menambahkan kolom `quantity_per_unit` (DECIMAL(10,2), NOT NULL, DEFAULT 1.0)
- Menambahkan kolom `notes` (TEXT, NULLABLE)
- Menambahkan constraint dan index

### 2. ProductForm.tsx
- **Props baru**: `initialMaterialData` untuk menerima data quantity_per_unit saat edit
- **State baru**: `materialQuantities` untuk menyimpan quantity per bahan
- **UI baru**: Input field untuk setiap bahan yang dipilih
- **Logic baru**: 
  - Saat edit: load quantity_per_unit dari database
  - Saat submit: kirim data dengan quantity_per_unit
  - Default: placeholder kosong (bukan 1)

### 3. MasterData.tsx
- **State baru**: `editingProductMaterialData` untuk menyimpan data quantity_per_unit
- **Update handleEditProduct**: fetch `material_id` dan `quantity_per_unit` dari database
- **Update ProductForm props**: kirim `initialMaterialData` ke ProductForm

### 4. orderService.ts
- **Update reduceMaterialStock**: hitung pengurangan stok = `quantity order × quantity_per_unit`
- **Update restoreMaterialStock**: hitung pengembalian stok = `quantity order × quantity_per_unit`
- **Update logging**: tampilkan detail perhitungan di inventory_movements

## Cara Kerja

### Saat Membuat Produk Baru:
1. User pilih bahan dari multi-select
2. Input field quantity muncul untuk setiap bahan
3. User input quantity per unit (misal: 4 untuk kartu nama)
4. Saat submit, data tersimpan dengan quantity_per_unit

### Saat Edit Produk:
1. Data bahan dan quantity_per_unit di-fetch dari database
2. Multi-select ter-populate dengan bahan yang sudah ada
3. Input field ter-populate dengan quantity yang sudah ada
4. User bisa edit quantity atau tambah/hapus bahan

### Saat Order:
1. Sistem ambil quantity_per_unit dari tabel product_materials
2. Hitung pengurangan stok = quantity order × quantity_per_unit
3. Update stok bahan dan catat di inventory_movements

## Contoh Penggunaan

### Kartu Nama (1 box = 4 lembar art paper)
- Product: Kartu Nama
- Bahan: Art Paper 260gsm
- Quantity per unit: 4
- Order: 2 box
- Pengurangan stok: 2 × 4 = 8 lembar art paper

### Banner Outdoor (1 meter = 1.5 meter kain)
- Product: Banner Outdoor
- Bahan: Kain Banner
- Quantity per unit: 1.5
- Order: 3 meter
- Pengurangan stok: 3 × 1.5 = 4.5 meter kain

## Migration yang Diperlukan

Jalankan migration SQL melalui Supabase Dashboard:
```sql
-- Copy isi dari file run_migration.sql
```

## Testing Checklist

- [ ] Migration berhasil dijalankan
- [ ] Buat produk baru dengan bahan dan quantity
- [ ] Edit produk dan cek quantity ter-load dengan benar
- [ ] Buat order dan cek pengurangan stok sesuai perhitungan
- [ ] Edit order dan cek pengembalian/pengurangan stok
- [ ] Hapus order dan cek pengembalian stok

## Troubleshooting

### Error "column does not exist"
- Migration belum dijalankan
- Jalankan migration SQL di Supabase Dashboard

### Quantity tidak ter-load saat edit
- Cek console log untuk `initialMaterialData`
- Pastikan data ter-fetch dari database dengan benar

### Pengurangan stok tidak sesuai
- Cek console log untuk perhitungan quantity
- Pastikan quantity_per_unit > 0 di database 
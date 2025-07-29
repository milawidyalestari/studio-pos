# Sistem Pengurangan Stok Bahan Otomatis

## Overview
Sistem ini mengimplementasikan pengurangan stok bahan otomatis ketika order dibuat dengan produk yang memiliki bahan terkait. Sistem ini memastikan bahwa stok bahan berkurang secara otomatis dan akurat setiap kali ada order yang dibuat.

## Cara Kerja

### 1. Setup Produk dan Bahan
- Di halaman **Master Data**, produk dapat dihubungkan dengan bahan melalui tabel `product_materials`
- Bahan harus memiliki `stok_aktif = true` untuk dapat diproses pengurangan stoknya
- Setiap produk dapat memiliki multiple bahan terkait

### 2. Proses Pengurangan Stok
Ketika order dibuat:

1. **Pencarian Produk**: Sistem mencari produk berdasarkan `item_name` (kode produk)
2. **Pencarian Bahan Terkait**: Sistem mencari bahan yang terkait dengan produk melalui tabel `product_materials`
3. **Validasi Bahan Aktif**: Hanya bahan dengan `stok_aktif = true` yang akan diproses
4. **Perhitungan Pengurangan**: Jumlah yang dikurangi = `quantity` dari order item
5. **Update Stok**: 
   - `stok_keluar` = `stok_keluar` + `quantity`
   - `stok_akhir` = `stok_akhir` - `quantity`
6. **Pencatatan Pergerakan**: Setiap pengurangan dicatat di tabel `inventory_movements`

### 3. Proses Pengembalian Stok
Ketika order diupdate atau dihapus:

1. **Pengembalian Stok Lama**: Jika order diupdate, stok lama dikembalikan terlebih dahulu
2. **Pengurangan Stok Baru**: Kemudian stok baru dikurangi sesuai order yang diupdate
3. **Penghapusan Order**: Jika order dihapus, semua stok yang terkait dikembalikan

## Database Schema

### Tabel `product_materials`
```sql
CREATE TABLE product_materials (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, material_id)
);
```

### Tabel `materials`
```sql
CREATE TABLE materials (
  id uuid PRIMARY KEY,
  kode varchar NOT NULL,
  nama varchar NOT NULL,
  stok_akhir integer,
  stok_keluar integer,
  stok_aktif boolean DEFAULT false,
  stok_minimum integer,
  -- ... other fields
);
```

### Tabel `inventory_movements`
```sql
CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY,
  material_id uuid REFERENCES materials(id),
  tanggal timestamp,
  tipe_mutasi varchar, -- 'penggunaan', 'pengembalian', 'koreksi'
  jumlah integer, -- positif untuk pengembalian, negatif untuk penggunaan
  keterangan text,
  user_id uuid
);
```

## File yang Dimodifikasi

### 1. `src/services/orderService.ts`
- Menambahkan fungsi `reduceMaterialStock()` untuk mengurangi stok
- Menambahkan fungsi `restoreMaterialStock()` untuk mengembalikan stok
- Mengintegrasikan fungsi-fungsi tersebut ke dalam `createNewOrder()` dan `updateExistingOrder()`

### 2. `src/services/deleteOrderService.ts`
- Menambahkan fungsi `restoreMaterialStock()` untuk mengembalikan stok ketika order dihapus
- Mengintegrasikan fungsi tersebut ke dalam `deleteOrderFromDatabase()`

### 3. `src/hooks/useOrders.ts`
- Mengupdate `deleteOrderMutation` untuk menggunakan service yang sudah diupdate

## Fitur Keamanan

### 1. Validasi Stok Aktif
- Hanya bahan dengan `stok_aktif = true` yang akan diproses
- Bahan non-aktif akan di-skip dengan log warning

### 2. Validasi Quantity
- Quantity harus > 0 untuk diproses
- Menggunakan `Math.max(0, ...)` untuk mencegah stok keluar menjadi negatif

### 3. Error Handling
- Setiap operasi database memiliki error handling
- Jika terjadi error pada satu bahan, proses tetap dilanjutkan untuk bahan lainnya
- Semua error dicatat dalam console log

### 4. Pencatatan Pergerakan
- Setiap perubahan stok dicatat di `inventory_movements`
- Memudahkan audit trail dan debugging

## Monitoring dan Alert

### 1. Stok Minimum
- Sistem akan memberikan warning ketika stok mencapai atau di bawah minimum
- Warning dicatat dalam console log

### 2. Logging
- Semua operasi stok dicatat dalam console log
- Memudahkan debugging dan monitoring

## Cara Penggunaan

### 1. Setup Bahan
1. Buka halaman **Inventory**
2. Pastikan bahan yang ingin digunakan memiliki `stok_aktif = true`
3. Set `stok_minimum` sesuai kebutuhan

### 2. Setup Produk
1. Buka halaman **Master Data** → **Produk & Jasa**
2. Edit produk yang ingin dihubungkan dengan bahan
3. Pilih bahan yang terkait dengan produk tersebut
4. Simpan perubahan

### 3. Membuat Order
1. Buka halaman **Orderan**
2. Buat order baru dengan produk yang sudah dihubungkan dengan bahan
3. Stok bahan akan berkurang otomatis ketika order disimpan

### 4. Monitoring
1. Cek halaman **Inventory** untuk melihat perubahan stok
2. Cek tabel `inventory_movements` untuk melihat riwayat pergerakan stok
3. Monitor console log untuk warning dan error

## Troubleshooting

### 1. Stok Tidak Berkurang
- Pastikan bahan memiliki `stok_aktif = true`
- Pastikan produk sudah dihubungkan dengan bahan di Master Data
- Cek console log untuk error messages

### 2. Stok Berkurang Terlalu Banyak
- Cek apakah ada order yang diupdate berulang kali
- Cek tabel `inventory_movements` untuk melihat riwayat pergerakan

### 3. Error Database
- Cek koneksi database
- Cek apakah tabel `product_materials` sudah dibuat
- Cek apakah foreign key constraints sudah benar

## Catatan Penting

1. **Backup Database**: Selalu backup database sebelum melakukan perubahan besar
2. **Testing**: Test fitur ini di environment development terlebih dahulu
3. **Monitoring**: Monitor penggunaan stok secara berkala
4. **Maintenance**: Lakukan maintenance database secara berkala untuk optimalisasi performa 
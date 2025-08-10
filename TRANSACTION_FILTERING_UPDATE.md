# Update Filtering Halaman Transaksi - Piutang

## Overview
Telah dilakukan update pada halaman transaksi untuk hanya menampilkan orderan yang memenuhi kriteria tertentu sesuai permintaan user.

## Kriteria Filtering Baru
Halaman transaksi sekarang hanya menampilkan orderan yang memenuhi **SEMUA** kriteria berikut:

1. **Sudah melakukan pembayaran** - Orderan harus memiliki DP (Down Payment) atau Pelunasan
2. **Status order selesai** - Status order harus "Done" atau "Selesai-Diambil"
3. **Receipt sudah tercetak** - Field `receipt_printed` harus `true`

## Perubahan yang Dilakukan

### 1. Update Filtering Logic
```typescript
// Sebelumnya (OR logic - salah satu kondisi terpenuhi):
const paymentTransactions = allTransactionData.filter(t =>
  t.down_payment > 0 ||
  t.pelunasan > 0 ||
  t.receipt_printed === true ||
  t.order_status_name === 'Done' ||
  t.order_status_name === 'Selesai-Diambil'
);

// Sekarang (AND logic - semua kondisi harus terpenuhi):
const paymentTransactions = allTransactionData.filter(t =>
  // Harus ada pembayaran (DP atau Pelunasan)
  (t.down_payment > 0 || t.pelunasan > 0) &&
  // Status harus Done atau Selesai-Diambil
  (t.order_status_name === 'Done' || t.order_status_name === 'Selesai-Diambil') &&
  // Receipt harus sudah tercetak
  t.receipt_printed === true
);
```

### 2. Update UI Labels
- **Tab Label**: "Semua Transaksi" → "Transaksi Lunas & Selesai"
- **Table Header**: "Daftar Pembayaran" → "Daftar Transaksi Lunas & Selesai"
- **Page Description**: Menambahkan "lunas & selesai" untuk kejelasan

### 3. Update Statistics Descriptions
- **Total Pendapatan**: "Total pembayaran orderan lunas & selesai"
- **Total Order**: "Order lunas & selesai dengan receipt tercetak"
- **Orderan Lunas**: "Jumlah orderan lunas & selesai"
- **Orderan Belum Lunas**: "Jumlah orderan lunas & selesai (belum tercetak)"
- **Belum Dibayar**: "Jumlah orderan lunas & selesai (belum tercetak)"

### 4. Update Comments dan Documentation
- Interface comment: "data transaksi dari orders yang sudah lunas dan receipt tercetak"
- Filter comment: Menambahkan penjelasan detail kriteria filtering
- Statistics comment: "transaksi lunas & selesai"

## Dampak Perubahan

### Yang Berubah:
- Halaman transaksi sekarang hanya menampilkan orderan yang **lunas dan selesai**
- Orderan yang belum lunas atau belum selesai tidak akan muncul di tab transaksi
- Orderan yang belum memiliki receipt tercetak tidak akan muncul

### Yang Tidak Berubah:
- Tab Piutang tetap menampilkan orderan yang belum lunas
- Semua fitur lain tetap berfungsi normal
- Filter dan pencarian tetap berfungsi untuk data yang ditampilkan

## File yang Diubah
- `src/pages/Transaction.tsx` - File utama dengan logic filtering dan UI

## Testing
Setelah perubahan ini, halaman transaksi seharusnya:
1. Hanya menampilkan orderan dengan pembayaran (DP/Pelunasan)
2. Hanya menampilkan orderan dengan status "Done" atau "Selesai-Diambil"
3. Hanya menampilkan orderan dengan receipt tercetak
4. Menampilkan label dan deskripsi yang sesuai dengan kriteria baru

## Catatan
- Perubahan ini menggunakan AND logic, bukan OR logic seperti sebelumnya
- Semua kriteria harus terpenuhi agar orderan muncul di halaman transaksi
- Orderan yang tidak memenuhi kriteria akan tetap tersimpan di database, hanya tidak ditampilkan di tab transaksi

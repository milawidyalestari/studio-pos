# Perbaikan Tanggal Pembayaran di Tab Transaksi

## Masalah
Pada Halaman Report di Tab Transaksi, tanggal pembayaran masih menggunakan tanggal terakhir order diedit, bukan berdasarkan kapan kolom DP atau Pelunasan diedit.

## Penyebab
1. **Frontend Issue (SUDAH DIPERBAIKI)**: Di `src/hooks/useOrders.ts`, ada logika yang salah yang mengupdate `payment_update` setiap kali order di-update, meskipun nilai payment tidak berubah.

2. **Database Trigger Issue (PERLU DIPERBAIKI)**: Trigger database yang ada menggunakan logika yang salah - trigger mengupdate `payment_update` setiap kali order di-update dengan `down_payment > 0` atau `pelunasan > 0`, bukan hanya saat nilai payment benar-benar berubah.

## Solusi

### Langkah 1: Jalankan Migrasi Database (PENTING!)

Anda perlu menjalankan file migrasi SQL berikut di database Supabase Anda:

**File**: `supabase/migrations/20250117000000_fix_payment_update_trigger.sql`

#### Cara Menjalankan Migrasi:

**Opsi A: Menggunakan Supabase Dashboard (Paling Mudah)**

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy seluruh isi file `supabase/migrations/20250117000000_fix_payment_update_trigger.sql`
6. Paste ke SQL Editor
7. Klik **Run** untuk menjalankan query

**Opsi B: Menggunakan Supabase CLI**

```bash
# Pastikan Supabase CLI sudah terinstall
# Jika belum: npm install -g supabase

# Login ke Supabase (jika belum)
supabase login

# Link ke project Anda (jika belum)
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migrasi
supabase db push
```

### Langkah 2: Verifikasi Perbaikan

Setelah menjalankan migrasi, verifikasi bahwa trigger sudah benar:

1. Buka Supabase Dashboard > SQL Editor
2. Jalankan query berikut untuk melihat trigger:

```sql
SELECT 
  tgname AS trigger_name,
  pg_get_functiondef(tgfoid) AS function_definition
FROM pg_trigger
JOIN pg_proc ON tgfoid = pg_proc.oid
WHERE tgname = 'trigger_update_payment_update';
```

3. Pastikan function definition mengandung:
   - `OLD.down_payment IS DISTINCT FROM NEW.down_payment`
   - `OLD.pelunasan IS DISTINCT FROM NEW.pelunasan`

### Langkah 3: Test Perbaikan

1. Buka aplikasi Studio POS
2. Pergi ke halaman **Orderan** atau **Transaction**
3. Edit sebuah order dan ubah **hanya** field selain DP/Pelunasan (misalnya customer name atau notes)
4. Simpan perubahan
5. Buka halaman **Report** > Tab **Transaksi**
6. Verifikasi bahwa **Tanggal Pembayaran** untuk order tersebut TIDAK berubah

7. Sekarang edit order yang sama dan ubah nilai **DP** atau **Pelunasan**
8. Simpan perubahan
9. Refresh halaman Report
10. Verifikasi bahwa **Tanggal Pembayaran** untuk order tersebut BERUBAH menjadi tanggal saat ini

## Penjelasan Teknis

### Trigger Database yang Benar

Trigger yang benar menggunakan `IS DISTINCT FROM` untuk memeriksa apakah nilai payment benar-benar berubah:

```sql
CREATE OR REPLACE FUNCTION update_payment_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Cek apakah down_payment atau pelunasan BENAR-BENAR berubah
  IF (OLD.down_payment IS DISTINCT FROM NEW.down_payment) OR 
     (OLD.pelunasan IS DISTINCT FROM NEW.pelunasan) THEN
    
    -- Hanya update jika nilai payment > 0
    IF (COALESCE(NEW.down_payment, 0) > 0 OR COALESCE(NEW.pelunasan, 0) > 0) THEN
      NEW.payment_update = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Perubahan di Frontend

Di `src/hooks/useOrders.ts`, logika manual untuk mengupdate `payment_update` telah dihapus. Sekarang trigger database yang menangani semuanya secara otomatis.

**Sebelum:**
```typescript
// ❌ SALAH - Mengupdate payment_update setiap kali field payment ada
if (hasDownPaymentChange || hasPelunasanChange) {
  const newDownPayment = orderData.down_payment || 0;
  const newPelunasan = orderData.pelunasan || 0;
  
  if (newDownPayment > 0 || newPelunasan > 0) {
    updateData.payment_update = new Date().toISOString();
  }
}
```

**Sesudah:**
```typescript
// ✅ BENAR - Biarkan database trigger yang handle
const updateData = { ...orderData };
// Trigger database akan otomatis update payment_update
```

## Catatan Penting

1. **Data Lama**: Order-order yang sudah ada mungkin memiliki `payment_update` yang tidak akurat. Nilai-nilai ini akan mulai akurat setelah perbaikan ini diterapkan dan order di-update dengan perubahan payment yang sebenarnya.

2. **Filtering di Report**: Tab Transaksi di Report sudah menggunakan `payment_update` untuk filtering berdasarkan tanggal, jadi setelah perbaikan ini, filter tanggal akan bekerja dengan benar.

3. **Backup**: Selalu buat backup database sebelum menjalankan migrasi, meskipun migrasi ini hanya mengubah trigger dan tidak mengubah data.

## Troubleshooting

### Problem: Tanggal Pembayaran Masih Berubah Saat Edit Order
- **Solusi**: Pastikan migrasi database sudah dijalankan dengan benar
- Cek trigger dengan query di Langkah 2 Verifikasi

### Problem: Error saat menjalankan migrasi
- **Solusi**: Pastikan Anda menggunakan user dengan permission yang cukup (service_role atau postgres user)
- Coba jalankan statement satu per satu di SQL Editor

### Problem: payment_update NULL untuk beberapa order
- **Solusi**: Jalankan query berikut untuk mengisi nilai default:
```sql
UPDATE public.orders 
SET payment_update = created_at 
WHERE payment_update IS NULL;
```

## Kontak

Jika ada masalah atau pertanyaan, silakan hubungi tim development.

---
**Tanggal**: 17 Januari 2025
**Versi**: 1.0


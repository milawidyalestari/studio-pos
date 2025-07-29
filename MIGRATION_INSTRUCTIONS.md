# Instruksi Migration quantity_per_unit

## Masalah
Docker Desktop tidak berjalan dengan baik, sehingga tidak bisa menjalankan `supabase db push` secara otomatis.

## Solusi Manual

### Opsi 1: Melalui Supabase Dashboard (Direkomendasikan)
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy dan paste isi dari file `run_migration.sql`
5. Klik **Run** untuk menjalankan migration

### Opsi 2: Melalui psql (jika punya akses langsung)
```bash
psql -h aws-0-ap-southeast-1.pooler.supabase.com -U postgres.oojmuyalhveuefjbwysj -d postgres -f run_migration.sql
```

### Opsi 3: Melalui Database Client
1. Buka database client (pgAdmin, DBeaver, dll)
2. Connect ke database Supabase Anda
3. Jalankan query dari file `run_migration.sql`

## Verifikasi Migration
Setelah migration berhasil, cek dengan query:
```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'product_materials' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

Anda harus melihat kolom baru:
- `quantity_per_unit` (DECIMAL(10,2), NOT NULL, DEFAULT 1.0)
- `notes` (TEXT, NULLABLE)

## Setelah Migration Selesai
1. Restart aplikasi React Anda
2. Test fitur baru:
   - Buat/edit produk dengan bahan
   - Input quantity per unit untuk setiap bahan
   - Buat order dan cek pengurangan stok bahan

## Troubleshooting
Jika ada error "column does not exist", berarti migration belum berhasil dijalankan.
Jika ada error constraint, cek apakah ada data existing yang melanggar constraint baru. 
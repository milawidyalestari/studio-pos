-- Migration: Rename stok_opname to stok_akhir and add new stok_opname column
-- Date: 2025-07-11

-- 1. Rename stok_opname menjadi stok_akhir
ALTER TABLE public.materials RENAME COLUMN stok_opname TO stok_akhir;
COMMENT ON COLUMN public.materials.stok_akhir IS 'Stok akhir/tersisa hasil perhitungan';

-- 2. Tambahkan kolom stok_opname baru
ALTER TABLE public.materials ADD COLUMN stok_opname INTEGER NULL DEFAULT 0;
COMMENT ON COLUMN public.materials.stok_opname IS 'Stok hasil opname fisik (stock opname)'; 
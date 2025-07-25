-- Migration: Add stok_aktif column to materials table
-- Date: 2025-07-11

ALTER TABLE public.materials
ADD COLUMN stok_aktif BOOLEAN NOT NULL DEFAULT true;
 
COMMENT ON COLUMN public.materials.stok_aktif IS 'Menandakan apakah stok bahan ini aktif atau tidak'; 
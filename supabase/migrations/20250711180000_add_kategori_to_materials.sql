-- Migration: Add kategori column to materials table
-- Date: 2025-07-11

ALTER TABLE public.materials
ADD COLUMN kategori uuid NULL REFERENCES public.categories(id);

COMMENT ON COLUMN public.materials.kategori IS 'Relasi ke kategori bahan/barang (categories.id)'; 
-- Migration: Add stok_minimum column to materials table
-- Date: 2025-07-11

ALTER TABLE public.materials
ADD COLUMN stok_minimum INTEGER NOT NULL DEFAULT 0;
 
COMMENT ON COLUMN public.materials.stok_minimum IS 'Stok minimum untuk peringatan low stock'; 
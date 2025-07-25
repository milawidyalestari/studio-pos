-- Migration: Create inventory_movements table
-- Date: 2025-07-11

CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id),
  tanggal timestamp with time zone NOT NULL DEFAULT now(),
  tipe_mutasi varchar(20) NOT NULL, -- masuk, keluar, opname, koreksi
  jumlah integer NOT NULL,
  keterangan text NULL,
  user_id uuid NULL REFERENCES public.employees(id)
);

COMMENT ON TABLE public.inventory_movements IS 'Log mutasi keluar/masuk/opname stok';
COMMENT ON COLUMN public.inventory_movements.material_id IS 'Relasi ke bahan/material';
COMMENT ON COLUMN public.inventory_movements.tipe_mutasi IS 'Jenis mutasi: masuk, keluar, opname, koreksi';
COMMENT ON COLUMN public.inventory_movements.jumlah IS 'Jumlah mutasi (positif/negatif sesuai tipe)';
COMMENT ON COLUMN public.inventory_movements.user_id IS 'User yang melakukan mutasi'; 
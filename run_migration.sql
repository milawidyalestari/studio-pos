-- Migration: Add quantity_per_unit to product_materials table
-- Date: 2025-07-12

-- Tambahkan kolom quantity_per_unit dengan default value 1
ALTER TABLE public.product_materials 
ADD COLUMN quantity_per_unit DECIMAL(10,2) NOT NULL DEFAULT 1.0;

-- Tambahkan kolom notes untuk catatan tambahan (opsional)
ALTER TABLE public.product_materials 
ADD COLUMN notes TEXT;

-- Update existing records untuk memiliki quantity_per_unit = 1
UPDATE public.product_materials 
SET quantity_per_unit = 1.0 
WHERE quantity_per_unit IS NULL;

-- Buat index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_product_materials_quantity_per_unit 
ON public.product_materials(quantity_per_unit);

-- Tambahkan constraint untuk memastikan quantity_per_unit tidak negatif
ALTER TABLE public.product_materials 
ADD CONSTRAINT check_quantity_per_unit_positive 
CHECK (quantity_per_unit > 0);

-- Verifikasi perubahan
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'product_materials' 
AND table_schema = 'public'
ORDER BY ordinal_position; 
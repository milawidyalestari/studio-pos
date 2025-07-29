-- Migration: Add quantity_per_unit to product_materials table
-- Date: 2025-07-12

ALTER TABLE public.product_materials 
ADD COLUMN quantity_per_unit DECIMAL(10,2) NOT NULL DEFAULT 1.0;

ALTER TABLE public.product_materials 
ADD COLUMN notes TEXT;

UPDATE public.product_materials 
SET quantity_per_unit = 1.0 
WHERE quantity_per_unit IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_materials_quantity_per_unit 
ON public.product_materials(quantity_per_unit);

ALTER TABLE public.product_materials 
ADD CONSTRAINT check_quantity_per_unit_positive 
CHECK (quantity_per_unit > 0); 
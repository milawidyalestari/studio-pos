-- Tabel relasi many-to-many antara products dan materials
CREATE TABLE IF NOT EXISTS public.product_materials (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON public.product_materials (product_id);
CREATE INDEX IF NOT EXISTS idx_product_materials_material_id ON public.product_materials (material_id); 
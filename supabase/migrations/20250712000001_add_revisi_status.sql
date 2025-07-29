-- Migration: Add Revisi status to order_statuses table
-- Date: 2025-07-12

-- Insert Revisi status
INSERT INTO public.order_statuses (name, description, color, sort_order)
VALUES ('Revisi', 'Order memerlukan revisi dari customer', 'orange', 4)
ON CONFLICT (name) DO NOTHING;

-- Update sort_order untuk status yang ada agar Revisi berada di posisi yang tepat
UPDATE public.order_statuses 
SET sort_order = 5 
WHERE name = 'Export';

UPDATE public.order_statuses 
SET sort_order = 6 
WHERE name = 'Proses Cetak';

UPDATE public.order_statuses 
SET sort_order = 7 
WHERE name = 'Done';

-- Verify the insertion
SELECT * FROM public.order_statuses ORDER BY sort_order; 
-- Create the order_statuses table
CREATE TABLE public.order_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_order INT
);

-- Insert the predefined statuses
INSERT INTO public.order_statuses (name, display_order) VALUES
('Unnest', 0),
('Design', 1),
('Cek File', 2),
('Konfirmasi', 3),
('Export', 4),
('Done', 5),
('Proses Cetak', 6);

-- Add a temporary column to orders to hold the new status_id
ALTER TABLE public.orders ADD COLUMN status_id INT;

-- Create an index on the old status column to speed up the update
CREATE INDEX IF NOT EXISTS idx_orders_status_temp ON public.orders(status);

-- Update the new status_id column based on the existing status enum
-- This is a bit manual, but ensures a correct mapping
UPDATE public.orders o
SET status_id = os.id
FROM public.order_statuses os
WHERE o.status::text = os.name;

-- Now that data is migrated, we can add the foreign key constraint
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_status_id 
FOREIGN KEY (status_id) 
REFERENCES public.order_statuses(id);

-- We can now drop the old status column
ALTER TABLE public.orders DROP COLUMN status;

-- Drop the old status enum, it's no longer needed
DROP TYPE public.order_status;

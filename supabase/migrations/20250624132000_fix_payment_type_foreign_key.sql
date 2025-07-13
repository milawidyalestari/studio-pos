-- Migration: Fix payment_type column to use foreign key to payment_types table
-- Date: 2025-01-24

-- First, change the payment_type column to UUID to match payment_types.id
ALTER TABLE public.orders 
ALTER COLUMN payment_type TYPE UUID USING NULL;

-- Add foreign key constraint to payment_types table
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_payment_type 
FOREIGN KEY (payment_type) 
REFERENCES public.payment_types(id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.orders.payment_type IS 'Foreign key reference to payment_types table'; 
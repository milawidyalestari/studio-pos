-- Migration: Add receipt_printed field to orders table
-- Date: 2025-07-01

ALTER TABLE public.orders
ADD COLUMN receipt_printed boolean NOT NULL DEFAULT false;
 
COMMENT ON COLUMN public.orders.receipt_printed IS 'True jika receipt sudah pernah di-print'; 
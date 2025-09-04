-- Migration: Fix payment_update data for existing records
-- Date: 2025-01-15
-- Description: Fix payment_update field that might have been incorrectly set to current time

-- First, let's check what the current state is
-- Run this query to see the current data:
-- SELECT order_number, created_at, payment_update, down_payment, pelunasan FROM orders LIMIT 10;

-- Fix existing records: Set payment_update = created_at for orders that don't have meaningful payments
-- This ensures that orders without payments show their original creation date
UPDATE public.orders 
SET payment_update = created_at 
WHERE (down_payment IS NULL OR down_payment = 0) 
  AND (pelunasan IS NULL OR pelunasan = 0)
  AND payment_update != created_at;

-- For orders that have payments, set payment_update to the most recent payment date
-- If we can't determine the exact payment date, keep payment_update as is
-- (This is a conservative approach to avoid losing actual payment timestamps)

-- Verify the fix worked
-- Run this query to verify:
-- SELECT 
--   order_number, 
--   created_at, 
--   payment_update, 
--   down_payment, 
--   pelunasan,
--   CASE 
--     WHEN (down_payment IS NULL OR down_payment = 0) AND (pelunasan IS NULL OR pelunasan = 0) 
--     THEN 'No Payment' 
--     ELSE 'Has Payment' 
--   END as payment_status
-- FROM orders 
-- ORDER BY created_at DESC 
-- LIMIT 10;

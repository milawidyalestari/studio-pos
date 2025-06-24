-- First, let's clear the transactions table and set up the proper structure
TRUNCATE TABLE public.transactions;

-- Create a function to automatically create transaction records when orders are completed
CREATE OR REPLACE FUNCTION create_transaction_from_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction if status changed to 'Done'
  IF LOWER(NEW.status::text) = 'done' AND (OLD.status IS NULL OR LOWER(OLD.status::text) <> 'done') THEN
    INSERT INTO public.transactions (
      order_id,
      customer_name,
      transaction_date,
      amount,
      payment_method,
      category,
      notes
    ) VALUES (
      NEW.id,
      NEW.customer_name,
      CURRENT_DATE,
      NEW.total_amount,
      CASE 
        WHEN NEW.payment_type = 'cash' THEN 'cash'
        WHEN NEW.payment_type = 'transfer' THEN 'transfer'
        WHEN NEW.payment_type = 'credit' THEN 'credit'
        ELSE 'cash'
      END,
      'Order Completion',
      CONCAT('Order #', NEW.order_number, ' - ', NEW.notes)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create transactions when orders are completed
DROP TRIGGER IF EXISTS create_transaction_on_order_completion ON public.orders;
CREATE TRIGGER create_transaction_on_order_completion
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_transaction_from_order();

-- Insert some sample completed orders to generate transaction data
INSERT INTO public.orders (
  order_number,
  customer_name,
  tanggal,
  status,
  total_amount,
  payment_type,
  notes,
  created_at
) VALUES
('ORD-2025-001', 'Ahmad Wijaya', '2025-01-10', 'Done', 150000, 'cash', 'Spanduk promosi toko', '2025-01-10 10:30:00'),
('ORD-2025-002', 'Siti Nurhaliza', '2025-01-09', 'Done', 75000, 'transfer', 'Sticker logo perusahaan', '2025-01-09 14:15:00'),
('ORD-2025-003', 'Budi Santoso', '2025-01-08', 'Done', 120000, 'cash', 'Kartu nama 500 pcs', '2025-01-08 09:45:00'),
('ORD-2025-004', 'Rina Permata', '2025-01-07', 'Done', 200000, 'credit', 'Cutting sticker mobil', '2025-01-07 16:20:00'),
('ORD-2025-005', 'Eko Prasetyo', '2025-01-06', 'Done', 180000, 'transfer', 'Banner event launching', '2025-01-06 11:30:00'),
('ORD-2025-006', 'Dewi Sartika', '2025-01-05', 'Done', 45000, 'cash', 'Laminating dokumen', '2025-01-05 13:45:00'),
('ORD-2025-007', 'Hendra Gunawan', '2025-01-04', 'Done', 95000, 'transfer', 'Poster A1 promosi', '2025-01-04 10:15:00'),
('ORD-2025-008', 'Maya Indira', '2025-01-03', 'Done', 85000, 'cash', 'Sticker kemasan produk', '2025-01-03 15:30:00'),
('ORD-2025-009', 'Rizki Ramadan', '2025-01-02', 'Done', 220000, 'credit', 'Banner outdoor besar', '2025-01-02 08:45:00'),
('ORD-2025-010', 'Lestari Putri', '2025-01-01', 'Done', 65000, 'transfer', 'Kartu nama premium', '2025-01-01 12:00:00');

-- Add some December 2024 completed orders
INSERT INTO public.orders (
  order_number,
  customer_name,
  tanggal,
  status,
  total_amount,
  payment_type,
  notes,
  created_at
) VALUES
('ORD-2024-091', 'Fajar Nugroho', '2024-12-28', 'Done', 175000, 'cash', 'Sticker kaca toko', '2024-12-28 11:30:00'),
('ORD-2024-092', 'Indah Sari', '2024-12-25', 'Done', 300000, 'transfer', 'Banner natal besar', '2024-12-25 09:15:00'),
('ORD-2024-093', 'Bayu Setiawan', '2024-12-22', 'Done', 55000, 'cash', 'Sticker produk natal', '2024-12-22 14:30:00'),
('ORD-2024-094', 'Sari Dewi', '2024-12-20', 'Done', 125000, 'credit', 'Poster promosi akhir tahun', '2024-12-20 16:45:00'),
('ORD-2024-095', 'Dani Pratama', '2024-12-18', 'Done', 90000, 'transfer', 'Kartu nama tahun baru', '2024-12-18 10:20:00');

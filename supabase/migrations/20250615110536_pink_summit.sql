/*
  # Insert Dummy Transaction Data

  1. New Data
    - Insert 30 dummy transaction records
    - Various payment methods (cash, transfer, credit)
    - Different categories (Banner, Sticker, Business Cards, etc.)
    - Date range from last 3 months to present
    - Realistic amounts and customer names

  2. Data Structure
    - Links to existing orders where possible
    - Realistic Indonesian customer names
    - Various transaction amounts
    - Different payment methods and categories
*/

-- Insert dummy transaction data
INSERT INTO public.transactions (
  customer_name,
  transaction_date,
  estimated_date,
  status,
  category,
  amount,
  payment_method,
  notes
) VALUES
-- Recent transactions (this month)
('Ahmad Wijaya', '2025-01-10', '2025-01-12', 'completed', 'Banner', 150000, 'cash', 'Spanduk promosi toko'),
('Siti Nurhaliza', '2025-01-09', '2025-01-11', 'completed', 'Sticker', 75000, 'transfer', 'Sticker logo perusahaan'),
('Budi Santoso', '2025-01-08', '2025-01-10', 'completed', 'Business Cards', 120000, 'cash', 'Kartu nama 500 pcs'),
('Rina Permata', '2025-01-07', '2025-01-09', 'completed', 'Vinyl', 200000, 'credit', 'Cutting sticker mobil'),
('Eko Prasetyo', '2025-01-06', '2025-01-08', 'completed', 'Banner', 180000, 'transfer', 'Banner event launching'),
('Dewi Sartika', '2025-01-05', '2025-01-07', 'completed', 'Laminating', 45000, 'cash', 'Laminating dokumen'),
('Hendra Gunawan', '2025-01-04', '2025-01-06', 'completed', 'Poster', 95000, 'transfer', 'Poster A1 promosi'),
('Maya Indira', '2025-01-03', '2025-01-05', 'completed', 'Sticker', 85000, 'cash', 'Sticker kemasan produk'),
('Rizki Ramadan', '2025-01-02', '2025-01-04', 'completed', 'Banner', 220000, 'credit', 'Banner outdoor besar'),
('Lestari Putri', '2025-01-01', '2025-01-03', 'completed', 'Business Cards', 65000, 'transfer', 'Kartu nama premium'),

-- Last month transactions (December 2024)
('Fajar Nugroho', '2024-12-28', '2024-12-30', 'completed', 'Vinyl', 175000, 'cash', 'Sticker kaca toko'),
('Indah Sari', '2024-12-25', '2024-12-27', 'completed', 'Banner', 300000, 'transfer', 'Banner natal besar'),
('Bayu Setiawan', '2024-12-22', '2024-12-24', 'completed', 'Sticker', 55000, 'cash', 'Sticker produk natal'),
('Sari Dewi', '2024-12-20', '2024-12-22', 'completed', 'Poster', 125000, 'credit', 'Poster promosi akhir tahun'),
('Dani Pratama', '2024-12-18', '2024-12-20', 'completed', 'Business Cards', 90000, 'transfer', 'Kartu nama tahun baru'),
('Nisa Amalia', '2024-12-15', '2024-12-17', 'completed', 'Banner', 250000, 'cash', 'Banner promosi diskon'),
('Arif Rahman', '2024-12-12', '2024-12-14', 'completed', 'Vinyl', 140000, 'transfer', 'Cutting sticker motor'),
('Wulan Dari', '2024-12-10', '2024-12-12', 'completed', 'Laminating', 35000, 'cash', 'Laminating sertifikat'),
('Yudi Kurniawan', '2024-12-08', '2024-12-10', 'completed', 'Sticker', 110000, 'credit', 'Sticker branding cafe'),
('Fitri Handayani', '2024-12-05', '2024-12-07', 'completed', 'Banner', 195000, 'transfer', 'Banner grand opening'),

-- November 2024 transactions
('Agus Salim', '2024-11-28', '2024-11-30', 'completed', 'Business Cards', 80000, 'cash', 'Kartu nama wedding organizer'),
('Diana Putri', '2024-11-25', '2024-11-27', 'completed', 'Poster', 160000, 'transfer', 'Poster event musik'),
('Hendro Susilo', '2024-11-22', '2024-11-24', 'completed', 'Vinyl', 210000, 'credit', 'Sticker mobil box'),
('Ratna Sari', '2024-11-20', '2024-11-22', 'completed', 'Banner', 275000, 'cash', 'Banner festival kuliner'),
('Iwan Setiadi', '2024-11-18', '2024-11-20', 'completed', 'Sticker', 95000, 'transfer', 'Sticker packaging'),
('Ani Yulianti', '2024-11-15', '2024-11-17', 'completed', 'Laminating', 50000, 'cash', 'Laminating menu restoran'),
('Rudi Hermawan', '2024-11-12', '2024-11-14', 'completed', 'Business Cards', 105000, 'credit', 'Kartu nama real estate'),
('Lia Amelia', '2024-11-10', '2024-11-12', 'completed', 'Banner', 185000, 'transfer', 'Banner seminar bisnis'),
('Dedy Kurniawan', '2024-11-08', '2024-11-10', 'completed', 'Vinyl', 155000, 'cash', 'Sticker helm custom'),
('Sinta Maharani', '2024-11-05', '2024-11-07', 'completed', 'Poster', 135000, 'transfer', 'Poster wedding invitation');

-- Update the sequence if needed
SELECT setval(pg_get_serial_sequence('transactions', 'id'), (SELECT MAX(id) FROM transactions));
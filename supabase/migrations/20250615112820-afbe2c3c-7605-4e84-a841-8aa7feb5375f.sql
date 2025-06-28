
-- Clear any existing dummy data first, then insert fresh data
DELETE FROM public.transactions WHERE customer_name IN (
  'Ahmad Wijaya', 'Siti Nurhaliza', 'Budi Santoso', 'Rina Permata', 'Eko Prasetyo',
  'Dewi Sartika', 'Hendra Gunawan', 'Maya Indira', 'Rizki Ramadan', 'Lestari Putri',
  'Fajar Nugroho', 'Indah Sari', 'Bayu Setiawan', 'Sari Dewi', 'Dani Pratama',
  'Nisa Amalia', 'Arif Rahman', 'Wulan Dari', 'Yudi Kurniawan', 'Fitri Handayani',
  'Agus Salim', 'Diana Putri', 'Hendro Susilo', 'Ratna Sari', 'Iwan Setiadi',
  'Ani Yulianti', 'Rudi Hermawan', 'Lia Amelia', 'Dedy Kurniawan', 'Sinta Maharani'
);

-- Insert fresh dummy transaction data
INSERT INTO public.transactions (
  customer_name,
  transaction_date,
  amount,
  payment_method,
  category,
  notes
) VALUES
-- Recent transactions (January 2025)
('Ahmad Wijaya', '2025-01-10', 150000, 'cash', 'Banner', 'Spanduk promosi toko'),
('Siti Nurhaliza', '2025-01-09', 75000, 'transfer', 'Sticker', 'Sticker logo perusahaan'),
('Budi Santoso', '2025-01-08', 120000, 'cash', 'Business Cards', 'Kartu nama 500 pcs'),
('Rina Permata', '2025-01-07', 200000, 'credit', 'Vinyl', 'Cutting sticker mobil'),
('Eko Prasetyo', '2025-01-06', 180000, 'transfer', 'Banner', 'Banner event launching'),
('Dewi Sartika', '2025-01-05', 45000, 'cash', 'Laminating', 'Laminating dokumen'),
('Hendra Gunawan', '2025-01-04', 95000, 'transfer', 'Poster', 'Poster A1 promosi'),
('Maya Indira', '2025-01-03', 85000, 'cash', 'Sticker', 'Sticker kemasan produk'),
('Rizki Ramadan', '2025-01-02', 220000, 'credit', 'Banner', 'Banner outdoor besar'),
('Lestari Putri', '2025-01-01', 65000, 'transfer', 'Business Cards', 'Kartu nama premium'),

-- December 2024 transactions
('Fajar Nugroho', '2024-12-28', 175000, 'cash', 'Vinyl', 'Sticker kaca toko'),
('Indah Sari', '2024-12-25', 300000, 'transfer', 'Banner', 'Banner natal besar'),
('Bayu Setiawan', '2024-12-22', 55000, 'cash', 'Sticker', 'Sticker produk natal'),
('Sari Dewi', '2024-12-20', 125000, 'credit', 'Poster', 'Poster promosi akhir tahun'),
('Dani Pratama', '2024-12-18', 90000, 'transfer', 'Business Cards', 'Kartu nama tahun baru'),
('Nisa Amalia', '2024-12-15', 250000, 'cash', 'Banner', 'Banner promosi diskon'),
('Arif Rahman', '2024-12-12', 140000, 'transfer', 'Vinyl', 'Cutting sticker motor'),
('Wulan Dari', '2024-12-10', 35000, 'cash', 'Laminating', 'Laminating sertifikat'),
('Yudi Kurniawan', '2024-12-08', 110000, 'credit', 'Sticker', 'Sticker branding cafe'),
('Fitri Handayani', '2024-12-05', 195000, 'transfer', 'Banner', 'Banner grand opening'),

-- November 2024 transactions
('Agus Salim', '2024-11-28', 80000, 'cash', 'Business Cards', 'Kartu nama wedding organizer'),
('Diana Putri', '2024-11-25', 160000, 'transfer', 'Poster', 'Poster event musik'),
('Hendro Susilo', '2024-11-22', 210000, 'credit', 'Vinyl', 'Sticker mobil box'),
('Ratna Sari', '2024-11-20', 275000, 'cash', 'Banner', 'Banner festival kuliner'),
('Iwan Setiadi', '2024-11-18', 95000, 'transfer', 'Sticker', 'Sticker packaging'),
('Ani Yulianti', '2024-11-15', 50000, 'cash', 'Laminating', 'Laminating menu restoran'),
('Rudi Hermawan', '2024-11-12', 105000, 'credit', 'Business Cards', 'Kartu nama real estate'),
('Lia Amelia', '2024-11-10', 185000, 'transfer', 'Banner', 'Banner seminar bisnis'),
('Dedy Kurniawan', '2024-11-08', 155000, 'cash', 'Vinyl', 'Sticker helm custom'),
('Sinta Maharani', '2024-11-05', 135000, 'transfer', 'Poster', 'Poster wedding invitation');

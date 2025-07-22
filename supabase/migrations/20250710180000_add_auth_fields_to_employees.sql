-- Add authentication fields to employees table
ALTER TABLE public.employees
  ADD COLUMN username VARCHAR(50) UNIQUE,
  ADD COLUMN password VARCHAR(255),
  ADD COLUMN role VARCHAR(50);
-- Semua kolom boleh NULL, hanya diisi untuk karyawan yang bisa login ke program 
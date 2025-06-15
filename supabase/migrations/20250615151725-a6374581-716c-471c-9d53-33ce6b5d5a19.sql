
-- Create table for group data (kelompok)
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for unit data (satuan)
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for non-cash payment types (jenis non tunai)
CREATE TABLE public.payment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  payment_method VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add some initial data for groups
INSERT INTO public.groups (code, name) VALUES
('GRP001', 'Printing Materials'),
('GRP002', 'Finishing Tools'),
('GRP003', 'Design Services');

-- Add some initial data for units
INSERT INTO public.units (code, name) VALUES
('UNIT001', 'Roll'),
('UNIT002', 'Pack'),
('UNIT003', 'Meter');

-- Add some initial data for payment types
INSERT INTO public.payment_types (code, type, payment_method) VALUES
('PAY001', 'Digital', 'QRIS'),
('PAY002', 'Digital', 'E-wallet'),
('PAY003', 'Card', 'Debit Card');

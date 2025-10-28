-- PostgreSQL Schema for Studio POS
-- Fixed version with proper ENUM types

-- Create ENUM types first
CREATE TYPE customer_level AS ENUM ('Regular', 'VIP', 'Premium');
CREATE TYPE employee_status AS ENUM ('Active', 'Inactive', 'Suspended');

-- Create tables
CREATE TABLE public.cash_accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  account_id uuid,
  account_name character varying NOT NULL,
  initial_balance numeric DEFAULT 0,
  current_balance numeric DEFAULT 0,
  currency character varying DEFAULT 'IDR'::character varying,
  is_primary boolean DEFAULT false,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cash_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT cash_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id)
);

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL UNIQUE,
  group_name character varying NOT NULL,
  category_name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chart_of_accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  account_code character varying NOT NULL UNIQUE,
  account_name character varying NOT NULL,
  account_type character varying NOT NULL CHECK (account_type::text = ANY (ARRAY['asset'::character varying, 'liability'::character varying, 'equity'::character varying, 'income'::character varying, 'expense'::character varying]::text[])),
  parent_account_id uuid,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT chart_of_accounts_parent_account_id_fkey FOREIGN KEY (parent_account_id) REFERENCES public.chart_of_accounts(id)
);

CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kode character varying NOT NULL UNIQUE,
  nama character varying NOT NULL,
  whatsapp character varying,
  email character varying,
  address text,
  level customer_level DEFAULT 'Regular'::customer_level,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kode character varying NOT NULL UNIQUE,
  nama character varying NOT NULL,
  posisi character varying,
  status employee_status DEFAULT 'Active'::employee_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  username character varying UNIQUE,
  password character varying,
  role character varying,
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);

CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL,
  name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT groups_pkey PRIMARY KEY (id)
);

CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kode character varying NOT NULL UNIQUE,
  nama character varying NOT NULL,
  lebar_maksimum numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  satuan character varying,
  stok_awal integer DEFAULT 0,
  stok_masuk integer DEFAULT 0,
  stok_keluar integer DEFAULT 0,
  stok_akhir integer DEFAULT 0,
  harga_per_meter integer,
  stok_aktif boolean NOT NULL DEFAULT false,
  stok_minimum integer NOT NULL DEFAULT 0,
  stok_opname integer DEFAULT 0,
  kategori uuid,
  CONSTRAINT materials_pkey PRIMARY KEY (id),
  CONSTRAINT materials_kategori_fkey FOREIGN KEY (kategori) REFERENCES public.categories(id)
);

CREATE TABLE public.inventory_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL,
  tanggal timestamp with time zone NOT NULL DEFAULT now(),
  tipe_mutasi character varying NOT NULL,
  jumlah integer NOT NULL,
  keterangan text,
  user_id uuid,
  CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_movements_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id),
  CONSTRAINT inventory_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(id)
);

CREATE TABLE public.journal_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  entry_number character varying NOT NULL UNIQUE,
  transaction_date date NOT NULL,
  description text,
  reference_type character varying CHECK (reference_type::text = ANY (ARRAY['sale'::character varying, 'purchase'::character varying, 'cash_in'::character varying, 'cash_out'::character varying, 'transfer'::character varying, 'adjustment'::character varying]::text[])),
  reference_id uuid,
  total_debit numeric DEFAULT 0,
  total_credit numeric DEFAULT 0,
  status character varying DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'posted'::character varying, 'cancelled'::character varying]::text[])),
  created_by uuid,
  approved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT journal_entries_pkey PRIMARY KEY (id)
);

CREATE TABLE public.journal_entry_lines (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  journal_entry_id uuid,
  account_id uuid,
  debit_amount numeric DEFAULT 0,
  credit_amount numeric DEFAULT 0,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id),
  CONSTRAINT journal_entry_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id),
  CONSTRAINT journal_entry_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id)
);

CREATE TABLE public.order_statuses (
  id integer NOT NULL DEFAULT nextval('order_statuses_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL,
  color text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_statuses_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payment_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL,
  type character varying NOT NULL,
  payment_method character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_types_pkey PRIMARY KEY (id)
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number character varying NOT NULL UNIQUE,
  customer_id uuid,
  customer_name character varying,
  tanggal date NOT NULL,
  waktu time without time zone,
  estimasi character varying,
  estimasi_waktu time without time zone,
  outdoor boolean DEFAULT false,
  laser_printing boolean DEFAULT false,
  mug_nota boolean DEFAULT false,
  jasa_desain numeric DEFAULT 0,
  biaya_lain numeric DEFAULT 0,
  sub_total numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  ppn numeric DEFAULT 10,
  total_amount numeric DEFAULT 0,
  payment_type uuid,
  down_payment numeric DEFAULT 0,
  remaining_payment numeric DEFAULT 0,
  admin_id uuid,
  desainer_id uuid,
  komputer character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status_id integer,
  pelunasan numeric DEFAULT 0,
  tax_checked boolean DEFAULT false,
  bank character varying,
  receipt_printed boolean NOT NULL DEFAULT false,
  payment_update timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT orders_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.employees(id),
  CONSTRAINT orders_desainer_id_fkey FOREIGN KEY (desainer_id) REFERENCES public.employees(id),
  CONSTRAINT fk_orders_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT orders_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.order_statuses(id),
  CONSTRAINT fk_orders_payment_type FOREIGN KEY (payment_type) REFERENCES public.payment_types(id)
);

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  bahan character varying,
  item_name character varying NOT NULL,
  panjang numeric,
  lebar numeric,
  quantity integer NOT NULL,
  finishing character varying,
  unit_price numeric DEFAULT 0,
  sub_total numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['order_created'::text, 'order_deleted'::text, 'order_updated'::text, 'order_processing'::text, 'order_completed'::text])),
  order_id uuid,
  user_name text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false,
  order_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

CREATE TABLE public.positions (
  id integer NOT NULL DEFAULT nextval('positions_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT positions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kode character varying NOT NULL UNIQUE,
  jenis character varying,
  nama character varying NOT NULL,
  category_id uuid,
  satuan character varying,
  harga_beli numeric DEFAULT 0,
  harga_jual numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  kunci_harga boolean DEFAULT false,
  bahan_id uuid,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.product_materials (
  product_id uuid NOT NULL,
  material_id uuid NOT NULL,
  quantity_per_unit numeric DEFAULT 1.0 CHECK (quantity_per_unit > 0::numeric),
  notes text,
  CONSTRAINT product_materials_pkey PRIMARY KEY (product_id, material_id),
  CONSTRAINT product_materials_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id)
);

CREATE TABLE public.role_permissions (
  id integer NOT NULL DEFAULT nextval('role_permissions_id_seq'::regclass),
  role character varying NOT NULL,
  menu character varying NOT NULL,
  action character varying NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.roles (
  id integer NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  contact_person character varying,
  email character varying,
  phone character varying,
  address text,
  payment_terms character varying,
  outstanding_balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transaction_master (
  id integer NOT NULL DEFAULT nextval('transaction_master_id_seq'::regclass),
  transaction_code character varying NOT NULL UNIQUE,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['income'::character varying, 'expense'::character varying, 'transfer'::character varying, 'adjustment'::character varying]::text[])),
  category_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency character varying DEFAULT 'IDR'::character varying,
  payment_method character varying,
  bank_reference character varying,
  transaction_date date NOT NULL,
  due_date date,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'rejected'::character varying]::text[])),
  priority character varying DEFAULT 'normal'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  recurring boolean DEFAULT false,
  recurring_pattern character varying,
  recurring_end_date date,
  notes text,
  attachments text[],
  tags text[],
  created_by uuid,
  approved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT transaction_master_pkey PRIMARY KEY (id),
  CONSTRAINT fk_transaction_master_category FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL,
  name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT units_pkey PRIMARY KEY (id)
);

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS order_statuses_id_seq;
CREATE SEQUENCE IF NOT EXISTS positions_id_seq;
CREATE SEQUENCE IF NOT EXISTS role_permissions_id_seq;
CREATE SEQUENCE IF NOT EXISTS roles_id_seq;
CREATE SEQUENCE IF NOT EXISTS transaction_master_id_seq;

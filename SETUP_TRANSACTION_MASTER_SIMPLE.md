# Setup Transaction Master Table (Simplified Version)

## Langkah-langkah untuk Membuat Tabel transaction_master di Supabase

### 1. Buka Supabase Dashboard
1. Kunjungi: https://supabase.com/dashboard
2. Login ke akun Anda
3. Pilih project: `oojmuyalhveuefjbwysj`

### 2. Buka SQL Editor
1. Di sidebar kiri, klik "SQL Editor"
2. Klik "New query"

### 3. Jalankan SQL Script (Simplified)
Copy dan paste script SQL berikut ke dalam SQL Editor:

```sql
-- Create transaction_master table (simplified version)
create table if not exists public.transaction_master (
  id serial not null,
  transaction_code character varying(50) not null,
  transaction_type character varying(50) not null,
  category_id uuid null,
  description text not null,
  amount numeric(15, 2) not null default 0,
  currency character varying(3) null default 'IDR'::character varying,
  payment_method character varying(100) null,
  bank_reference character varying(100) null,
  transaction_date date not null,
  due_date date null,
  status character varying(20) not null default 'pending'::character varying,
  priority character varying(20) null default 'normal'::character varying,
  recurring boolean null default false,
  recurring_pattern character varying(50) null,
  recurring_end_date date null,
  notes text null,
  attachments text[] null,
  tags text[] null,
  created_by uuid null,
  approved_by uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint transaction_master_pkey primary key (id),
  constraint transaction_master_transaction_code_key unique (transaction_code)
);

-- Add check constraints
alter table public.transaction_master 
  add constraint if not exists transaction_master_priority_check 
  check (priority in ('low', 'normal', 'high', 'urgent'));

alter table public.transaction_master 
  add constraint if not exists transaction_master_status_check 
  check (status in ('pending', 'completed', 'cancelled', 'rejected'));

alter table public.transaction_master 
  add constraint if not exists transaction_master_transaction_type_check 
  check (transaction_type in ('income', 'expense', 'transfer', 'adjustment'));

-- Create indexes
create index if not exists idx_transaction_master_transaction_code on public.transaction_master using btree (transaction_code);
create index if not exists idx_transaction_master_transaction_type on public.transaction_master using btree (transaction_type);
create index if not exists idx_transaction_master_category_id on public.transaction_master using btree (category_id);
create index if not exists idx_transaction_master_transaction_date on public.transaction_master using btree (transaction_date);
create index if not exists idx_transaction_master_status on public.transaction_master using btree (status);
create index if not exists idx_transaction_master_created_by on public.transaction_master using btree (created_by);
create index if not exists idx_transaction_master_recurring on public.transaction_master using btree (recurring);

-- Create function for updating updated_at timestamp
create or replace function update_transaction_master_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updating updated_at
drop trigger if exists trigger_transaction_master_updated_at on transaction_master;
create trigger trigger_transaction_master_updated_at 
  before update on transaction_master 
  for each row
  execute function update_transaction_master_updated_at();

-- Create function to generate transaction code
create or replace function generate_transaction_code()
returns text as $$
declare
  next_id integer;
  transaction_code text;
begin
  select coalesce(max(id), 0) + 1 into next_id from transaction_master;
  transaction_code := 'TRX-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(next_id::text, 4, '0');
  return transaction_code;
end;
$$ language plpgsql;

-- Enable RLS (Row Level Security)
alter table public.transaction_master enable row level security;

-- Create policies
drop policy if exists "Enable read access for all users" on public.transaction_master;
create policy "Enable read access for all users" on public.transaction_master
  for select using (true);

drop policy if exists "Enable insert for authenticated users only" on public.transaction_master;
create policy "Enable insert for authenticated users only" on public.transaction_master
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Enable update for authenticated users only" on public.transaction_master;
create policy "Enable update for authenticated users only" on public.transaction_master
  for update using (auth.role() = 'authenticated');

drop policy if exists "Enable delete for authenticated users only" on public.transaction_master;
create policy "Enable delete for authenticated users only" on public.transaction_master
  for delete using (auth.role() = 'authenticated');
```

### 4. Jalankan Query
1. Klik tombol "Run" atau tekan Ctrl+Enter
2. Pastikan tidak ada error yang muncul

### 5. Verifikasi Tabel
1. Setelah query berhasil dijalankan, buka "Table Editor" di sidebar
2. Anda seharusnya melihat tabel `transaction_master` di daftar tabel

## Perbedaan dengan Versi Lengkap

Versi ini **TIDAK** memiliki:
- Foreign key constraint ke tabel `categories`
- Ini memungkinkan transaksi dibuat tanpa masalah foreign key

## Keuntungan Versi Simplified

1. **Tidak ada error foreign key** - Transaksi bisa dibuat langsung
2. **Lebih sederhana** - Tidak perlu setup kategori terlebih dahulu
3. **Fungsionalitas tetap lengkap** - Semua fitur transaksi tetap berfungsi

## Cara Menambah Foreign Key Nanti

Setelah tabel berfungsi dengan baik, Anda bisa menambahkan foreign key constraint:

```sql
-- Add foreign key constraint (optional, run later)
alter table public.transaction_master 
  add constraint fk_transaction_master_category 
  foreign key (category_id) references categories (id) on delete set null;
```

## Testing

Setelah tabel dibuat dengan versi simplified ini:
1. Buka aplikasi di browser
2. Navigasi ke halaman Keuangan
3. Test fitur pemasukan dan pengeluaran di tab "Arus Kas"
4. Transaksi seharusnya bisa dibuat tanpa error




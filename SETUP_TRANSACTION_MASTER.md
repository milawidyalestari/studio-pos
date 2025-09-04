# Setup Transaction Master Table

## Langkah-langkah untuk Membuat Tabel transaction_master di Supabase

### 1. Buka Supabase Dashboard
1. Kunjungi: https://supabase.com/dashboard
2. Login ke akun Anda
3. Pilih project: `oojmuyalhveuefjbwysj`

### 2. Buka SQL Editor
1. Di sidebar kiri, klik "SQL Editor"
2. Klik "New query"

### 3. Jalankan SQL Script
Copy dan paste script SQL berikut ke dalam SQL Editor:

```sql
-- Create transaction_master table
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

-- Add foreign key constraints
alter table public.transaction_master 
  add constraint if not exists fk_transaction_master_category 
  foreign key (category_id) references categories (id) on delete set null;

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

## Fitur yang Sudah Diimplementasikan

### ✅ Database Structure
- Tabel `transaction_master` dengan semua field yang diperlukan
- Foreign key ke tabel `categories`
- Check constraints untuk validasi data
- Indexes untuk performa query
- Trigger untuk update timestamp otomatis
- Function untuk generate transaction code

### ✅ TypeScript Types
- Definisi tipe lengkap untuk `transaction_master`
- Enum untuk transaction_type, status, dan priority
- Type safety untuk semua operasi CRUD

### ✅ Custom Hook
- `useTransactionMaster` dengan CRUD operations lengkap
- Filtering capabilities
- Auto-refresh functionality
- Error handling

### ✅ Finance Page Integration
- Halaman Keuangan menggunakan `transaction_master` sebagai data source
- Dashboard dengan data transaksi real-time
- Modal input untuk pemasukan dan pengeluaran
- Charts berdasarkan kategori transaksi
- Status management untuk transaksi

### ✅ Features
- **Transaction Types**: income, expense, transfer, adjustment
- **Status Management**: pending, completed, cancelled, rejected
- **Priority Levels**: low, normal, high, urgent
- **Category Integration**: Links ke existing categories table
- **Employee Tracking**: Created by dan approved by fields
- **Recurring Transactions**: Support untuk recurring patterns
- **Attachments and Tags**: Array fields untuk additional data

## Cara Menggunakan

### 1. Menambah Transaksi
1. Buka halaman Keuangan
2. Klik tab "Arus Kas"
3. Klik tombol "Pemasukan" atau "Pengeluaran"
4. Isi form dengan data yang diperlukan
5. Klik "Simpan"

### 2. Melihat Dashboard
1. Buka halaman Keuangan
2. Tab "Dashboard" akan menampilkan:
   - Pendapatan hari ini
   - Pengeluaran hari ini
   - Profit/laba bersih
   - Grafik tren 7 hari terakhir
   - Chart kategori transaksi

### 3. Melihat Laporan
1. Buka halaman Keuangan
2. Klik tab "Laporan"
3. Pilih periode laporan
4. Export data jika diperlukan

## Testing

Setelah tabel dibuat, Anda dapat test dengan:
1. Menambah beberapa transaksi pemasukan dan pengeluaran
2. Memverifikasi data muncul di dashboard
3. Mengecek grafik dan chart berfungsi dengan benar
4. Memastikan filter dan pencarian berfungsi

## Troubleshooting

Jika ada error:
1. Pastikan tabel `categories` sudah ada
2. Periksa foreign key constraints
3. Pastikan RLS policies sudah dibuat dengan benar
4. Cek console browser untuk error JavaScript




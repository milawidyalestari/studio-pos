-- Fix transaction_master table structure and add missing components

-- 1. Create function for updating updated_at timestamp
create or replace function update_transaction_master_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Create function to generate transaction code
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

-- 3. Enable RLS (Row Level Security)
alter table public.transaction_master enable row level security;

-- 4. Create policies
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

-- 5. Create alternative policies for non-authenticated access (for development)
drop policy if exists "Enable insert for all users" on public.transaction_master;
create policy "Enable insert for all users" on public.transaction_master
  for insert with check (true);

drop policy if exists "Enable update for all users" on public.transaction_master;
create policy "Enable update for all users" on public.transaction_master
  for update using (true);

drop policy if exists "Enable delete for all users" on public.transaction_master;
create policy "Enable delete for all users" on public.transaction_master
  for delete using (true);

-- 6. Test the generate_transaction_code function
select generate_transaction_code();

-- 7. Verify table structure
select 
    column_name,
    data_type,
    is_nullable,
    column_default
from information_schema.columns 
where table_name = 'transaction_master' 
and table_schema = 'public'
order by ordinal_position;




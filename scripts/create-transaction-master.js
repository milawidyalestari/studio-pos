const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsZ2h2ZXVlZmJ3eXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5MCwiZXhwIjoyMDUwMTczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTransactionMasterTable() {
  try {
    console.log('Creating transaction_master table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'create_transaction_master.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Continue with next statement
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('Transaction master table creation completed!');
    
  } catch (error) {
    console.error('Error creating transaction_master table:', error);
  }
}

// Alternative approach using direct SQL execution
async function createTransactionMasterTableDirect() {
  try {
    console.log('Creating transaction_master table using direct SQL...');
    
    const sqlStatements = [
      // Create table
      `create table if not exists public.transaction_master (
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
      )`,
      
      // Add foreign key
      `alter table public.transaction_master 
        add constraint if not exists fk_transaction_master_category 
        foreign key (category_id) references categories (id) on delete set null`,
      
      // Add check constraints
      `alter table public.transaction_master 
        add constraint if not exists transaction_master_priority_check 
        check (priority in ('low', 'normal', 'high', 'urgent'))`,
      
      `alter table public.transaction_master 
        add constraint if not exists transaction_master_status_check 
        check (status in ('pending', 'completed', 'cancelled', 'rejected'))`,
      
      `alter table public.transaction_master 
        add constraint if not exists transaction_master_transaction_type_check 
        check (transaction_type in ('income', 'expense', 'transfer', 'adjustment'))`,
      
      // Create indexes
      `create index if not exists idx_transaction_master_transaction_code on public.transaction_master using btree (transaction_code)`,
      `create index if not exists idx_transaction_master_transaction_type on public.transaction_master using btree (transaction_type)`,
      `create index if not exists idx_transaction_master_category_id on public.transaction_master using btree (category_id)`,
      `create index if not exists idx_transaction_master_transaction_date on public.transaction_master using btree (transaction_date)`,
      `create index if not exists idx_transaction_master_status on public.transaction_master using btree (status)`,
      `create index if not exists idx_transaction_master_created_by on public.transaction_master using btree (created_by)`,
      `create index if not exists idx_transaction_master_recurring on public.transaction_master using btree (recurring)`,
      
      // Create function
      `create or replace function update_transaction_master_updated_at()
        returns trigger as $$
        begin
          new.updated_at = now();
          return new;
        end;
        $$ language plpgsql`,
      
      // Create trigger
      `drop trigger if exists trigger_transaction_master_updated_at on transaction_master;
        create trigger trigger_transaction_master_updated_at 
        before update on transaction_master 
        for each row
        execute function update_transaction_master_updated_at()`,
      
      // Create function to generate transaction code
      `create or replace function generate_transaction_code()
        returns text as $$
        declare
          next_id integer;
          transaction_code text;
        begin
          select coalesce(max(id), 0) + 1 into next_id from transaction_master;
          transaction_code := 'TRX-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(next_id::text, 4, '0');
          return transaction_code;
        end;
        $$ language plpgsql`,
      
      // Enable RLS
      `alter table public.transaction_master enable row level security`,
      
      // Create policies
      `drop policy if exists "Enable read access for all users" on public.transaction_master;
        create policy "Enable read access for all users" on public.transaction_master
        for select using (true)`,
      
      `drop policy if exists "Enable insert for authenticated users only" on public.transaction_master;
        create policy "Enable insert for authenticated users only" on public.transaction_master
        for insert with check (auth.role() = 'authenticated')`,
      
      `drop policy if exists "Enable update for authenticated users only" on public.transaction_master;
        create policy "Enable update for authenticated users only" on public.transaction_master
        for update using (auth.role() = 'authenticated')`,
      
      `drop policy if exists "Enable delete for authenticated users only" on public.transaction_master;
        create policy "Enable delete for authenticated users only" on public.transaction_master
        for delete using (auth.role() = 'authenticated')`
    ];
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('Transaction master table creation completed!');
    
  } catch (error) {
    console.error('Error creating transaction_master table:', error);
  }
}

// Run the function
createTransactionMasterTableDirect();

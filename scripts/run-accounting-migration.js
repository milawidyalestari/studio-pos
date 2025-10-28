const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running accounting system migration...\n');

  try {
    // Step 1: Create chart_of_accounts table
    console.log('📋 Creating chart_of_accounts table...');
    const { error: chartError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          account_code VARCHAR(20) UNIQUE NOT NULL,
          account_name VARCHAR(100) NOT NULL,
          account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
          parent_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT true,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (chartError) {
      console.log('❌ Error creating chart_of_accounts:', chartError.message);
    } else {
      console.log('✅ chart_of_accounts table created');
    }

    // Step 2: Create cash_accounts table
    console.log('💰 Creating cash_accounts table...');
    const { error: cashError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS cash_accounts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
          account_name VARCHAR(100) NOT NULL,
          initial_balance DECIMAL(15,2) DEFAULT 0,
          current_balance DECIMAL(15,2) DEFAULT 0,
          currency VARCHAR(3) DEFAULT 'IDR',
          is_primary BOOLEAN DEFAULT false,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (cashError) {
      console.log('❌ Error creating cash_accounts:', cashError.message);
    } else {
      console.log('✅ cash_accounts table created');
    }

    // Step 3: Create journal_entries table
    console.log('📝 Creating journal_entries table...');
    const { error: journalError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS journal_entries (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          entry_number VARCHAR(50) UNIQUE NOT NULL,
          transaction_date DATE NOT NULL,
          description TEXT,
          reference_type VARCHAR(50) CHECK (reference_type IN ('sale', 'purchase', 'cash_in', 'cash_out', 'transfer', 'adjustment')),
          reference_id UUID,
          total_debit DECIMAL(15,2) DEFAULT 0,
          total_credit DECIMAL(15,2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
          created_by UUID,
          approved_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (journalError) {
      console.log('❌ Error creating journal_entries:', journalError.message);
    } else {
      console.log('✅ journal_entries table created');
    }

    // Step 4: Create journal_entry_lines table
    console.log('📄 Creating journal_entry_lines table...');
    const { error: linesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS journal_entry_lines (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
          account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
          debit_amount DECIMAL(15,2) DEFAULT 0,
          credit_amount DECIMAL(15,2) DEFAULT 0,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (linesError) {
      console.log('❌ Error creating journal_entry_lines:', linesError.message);
    } else {
      console.log('✅ journal_entry_lines table created');
    }

    // Step 5: Enable RLS
    console.log('🔒 Enabling RLS...');
    const tables = ['chart_of_accounts', 'cash_accounts', 'journal_entries', 'journal_entry_lines'];
    
    for (const table of tables) {
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      
      if (rlsError) {
        console.log(`❌ Error enabling RLS for ${table}:`, rlsError.message);
      } else {
        console.log(`✅ RLS enabled for ${table}`);
      }
    }

    // Step 6: Create RLS policies
    console.log('🛡️ Creating RLS policies...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create policies for authenticated users
        CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON chart_of_accounts
          FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON cash_accounts
          FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON journal_entries
          FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON journal_entry_lines
          FOR ALL USING (auth.role() = 'authenticated');
      `
    });

    if (policyError) {
      console.log('❌ Error creating RLS policies:', policyError.message);
    } else {
      console.log('✅ RLS policies created');
    }

    console.log('\n🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run the migration
runMigration();


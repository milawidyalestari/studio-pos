const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseError() {
  console.log('🔍 Diagnosing accounting tables error...\n');

  try {
    // Test 1: Check if tables exist
    console.log('📋 Test 1: Checking table existence...');
    
    const tables = ['chart_of_accounts', 'cash_accounts', 'journal_entries', 'journal_entry_lines'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          
          // Analyze error type
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            console.log(`   → Table ${table} does not exist`);
          } else if (error.message.includes('permission denied')) {
            console.log(`   → Permission denied for ${table}`);
          } else if (error.message.includes('RLS')) {
            console.log(`   → RLS policy issue for ${table}`);
          } else {
            console.log(`   → Other error: ${error.code}`);
          }
        } else {
          console.log(`✅ ${table}: Accessible (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Exception - ${err.message}`);
      }
    }

    // Test 2: Check RLS status
    console.log('\n🔒 Test 2: Checking RLS status...');
    
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('get_rls_status')
        .catch(() => {
          console.log('   → RLS status check function not available');
          return { data: null, error: null };
        });
      
      if (rlsData) {
        console.log('   → RLS status:', rlsData);
      }
    } catch (err) {
      console.log('   → Could not check RLS status');
    }

    // Test 3: Check authentication
    console.log('\n🔐 Test 3: Checking authentication...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('❌ No user authenticated');
    }

    // Test 4: Try simple query
    console.log('\n📊 Test 4: Testing simple query...');
    
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('id, account_code, account_name')
        .limit(1);
      
      if (error) {
        console.log('❌ Simple query failed:', error.message);
        console.log('   → Error details:', error);
      } else {
        console.log('✅ Simple query successful');
        console.log('   → Data:', data);
      }
    } catch (err) {
      console.log('❌ Simple query exception:', err.message);
    }

    // Test 5: Check table structure
    console.log('\n🏗️ Test 5: Checking table structure...');
    
    try {
      const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'chart_of_accounts' })
        .catch(() => {
          console.log('   → Table info function not available');
          return { data: null, error: null };
        });
      
      if (data) {
        console.log('   → Table structure:', data);
      }
    } catch (err) {
      console.log('   → Could not check table structure');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

async function createTablesIfMissing() {
  console.log('\n🔧 Attempting to create tables if missing...\n');

  try {
    // Create chart_of_accounts table
    console.log('Creating chart_of_accounts...');
    const { error: chartError } = await supabase
      .rpc('exec_sql', {
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
      console.log('✅ chart_of_accounts created');
    }

    // Create cash_accounts table
    console.log('Creating cash_accounts...');
    const { error: cashError } = await supabase
      .rpc('exec_sql', {
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
      console.log('✅ cash_accounts created');
    }

    // Enable RLS
    console.log('Enabling RLS...');
    const { error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
          ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
        `
      });

    if (rlsError) {
      console.log('❌ Error enabling RLS:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }

    // Create RLS policies
    console.log('Creating RLS policies...');
    const { error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON chart_of_accounts
            FOR ALL USING (auth.role() = 'authenticated');
          
          CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON cash_accounts
            FOR ALL USING (auth.role() = 'authenticated');
        `
      });

    if (policyError) {
      console.log('❌ Error creating policies:', policyError.message);
    } else {
      console.log('✅ RLS policies created');
    }

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
  }
}

// Run diagnosis
diagnoseError().then(() => {
  console.log('\n' + '='.repeat(50));
  createTablesIfMissing();
});


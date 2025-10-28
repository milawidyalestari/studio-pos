const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccountingTables() {
  console.log('🔍 Checking accounting tables...\n');

  try {
    // Check if tables exist
    const tables = ['chart_of_accounts', 'cash_accounts', 'journal_entries', 'journal_entry_lines'];
    
    for (const table of tables) {
      console.log(`📋 Checking table: ${table}`);
      
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Error accessing ${table}:`, error.message);
          
          // Check if it's a permission error
          if (error.message.includes('permission denied') || error.message.includes('relation') || error.message.includes('does not exist')) {
            console.log(`   → Table ${table} might not exist or have permission issues`);
          }
        } else {
          console.log(`✅ Table ${table} is accessible`);
        }
      } catch (err) {
        console.log(`❌ Exception accessing ${table}:`, err.message);
      }
      console.log('');
    }

    // Check RLS policies
    console.log('🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies')
      .catch(() => {
        console.log('   → Could not check RLS policies (function might not exist)');
        return { data: null, error: null };
      });

    if (policiesError) {
      console.log('   → RLS policies check failed:', policiesError.message);
    } else if (policies) {
      console.log('   → RLS policies found:', policies.length);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

async function createTablesIfNotExist() {
  console.log('🔧 Attempting to create tables if they don\'t exist...\n');

  try {
    // Try to create a simple test record in chart_of_accounts
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert({
        account_code: 'TEST001',
        account_name: 'Test Account',
        account_type: 'asset',
        description: 'Test account for verification'
      })
      .select();

    if (error) {
      console.log('❌ Could not create test record:', error.message);
      
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('   → Tables need to be created via migration');
        console.log('   → Please run the migration files in Supabase dashboard');
      }
    } else {
      console.log('✅ Test record created successfully');
      
      // Clean up test record
      await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('account_code', 'TEST001');
      console.log('   → Test record cleaned up');
    }
  } catch (error) {
    console.error('❌ Error creating test record:', error.message);
  }
}

// Run the checks
checkAccountingTables().then(() => {
  console.log('\n' + '='.repeat(50));
  createTablesIfNotExist();
});


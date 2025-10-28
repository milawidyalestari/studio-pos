const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAccountingAccess() {
  console.log('🔍 Testing accounting tables access...\n');

  try {
    // Test 1: Check authentication
    console.log('🔐 Test 1: Authentication Status');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('⚠️ No user authenticated (using anon key)');
    }

    // Test 2: Test chart_of_accounts access
    console.log('\n📋 Test 2: Chart of Accounts Access');
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log('❌ Error:', error.message);
        console.log('   → Code:', error.code);
        console.log('   → Details:', error.details);
        console.log('   → Hint:', error.hint);
      } else {
        console.log('✅ Success! Found', data?.length || 0, 'records');
        if (data && data.length > 0) {
          console.log('   → Sample record:', {
            id: data[0].id,
            account_code: data[0].account_code,
            account_name: data[0].account_name,
            account_type: data[0].account_type
          });
        }
      }
    } catch (err) {
      console.log('❌ Exception:', err.message);
    }

    // Test 3: Test cash_accounts access
    console.log('\n💰 Test 3: Cash Accounts Access');
    try {
      const { data, error } = await supabase
        .from('cash_accounts')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log('❌ Error:', error.message);
        console.log('   → Code:', error.code);
        console.log('   → Details:', error.details);
        console.log('   → Hint:', error.hint);
      } else {
        console.log('✅ Success! Found', data?.length || 0, 'records');
        if (data && data.length > 0) {
          console.log('   → Sample record:', {
            id: data[0].id,
            account_name: data[0].account_name,
            current_balance: data[0].current_balance,
            currency: data[0].currency
          });
        }
      }
    } catch (err) {
      console.log('❌ Exception:', err.message);
    }

    // Test 4: Test cash_accounts with join
    console.log('\n🔗 Test 4: Cash Accounts with Chart of Accounts Join');
    try {
      const { data, error } = await supabase
        .from('cash_accounts')
        .select(`
          *,
          chart_of_accounts (*)
        `)
        .limit(5);
      
      if (error) {
        console.log('❌ Error:', error.message);
        console.log('   → Code:', error.code);
        console.log('   → Details:', error.details);
        console.log('   → Hint:', error.hint);
      } else {
        console.log('✅ Success! Found', data?.length || 0, 'records');
        if (data && data.length > 0) {
          console.log('   → Sample record with join:', {
            id: data[0].id,
            account_name: data[0].account_name,
            chart_of_accounts: data[0].chart_of_accounts
          });
        }
      }
    } catch (err) {
      console.log('❌ Exception:', err.message);
    }

    // Test 5: Test insert operation
    console.log('\n➕ Test 5: Insert Test (will be rolled back)');
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert({
          account_code: 'TEST999',
          account_name: 'Test Account',
          account_type: 'asset',
          description: 'Test account for verification'
        })
        .select();
      
      if (error) {
        console.log('❌ Insert Error:', error.message);
        console.log('   → Code:', error.code);
        console.log('   → Details:', error.details);
        console.log('   → Hint:', error.hint);
      } else {
        console.log('✅ Insert Success!');
        console.log('   → Created record:', data[0]);
        
        // Clean up test record
        const { error: deleteError } = await supabase
          .from('chart_of_accounts')
          .delete()
          .eq('account_code', 'TEST999');
        
        if (deleteError) {
          console.log('⚠️ Could not clean up test record:', deleteError.message);
        } else {
          console.log('✅ Test record cleaned up');
        }
      }
    } catch (err) {
      console.log('❌ Insert Exception:', err.message);
    }

    // Test 6: Check table structure
    console.log('\n🏗️ Test 6: Table Structure Check');
    try {
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'chart_of_accounts' })
        .catch(() => {
          console.log('   → Table structure check function not available');
          return { data: null, error: null };
        });
      
      if (data) {
        console.log('   → Table structure:', data);
      }
    } catch (err) {
      console.log('   → Could not check table structure');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAccountingAccess();


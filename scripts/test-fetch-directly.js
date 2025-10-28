const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchDirectly() {
  console.log('🔍 Testing fetch directly - mimicking the exact error...\n');

  try {
    // Test 1: Test the exact query that's failing
    console.log('📋 Test 1: Testing chart_of_accounts?select=* (the exact failing query)');
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*');
    
    if (error) {
      console.log('❌ Error (this is the same error you see in browser):');
      console.log('   → Message:', error.message);
      console.log('   → Code:', error.code);
      console.log('   → Details:', error.details);
      console.log('   → Hint:', error.hint);
      console.log('   → Full error object:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Success! Found', data?.length || 0, 'records');
      if (data && data.length > 0) {
        console.log('   → Sample record:', data[0]);
      }
    }

    // Test 2: Test with different select patterns
    console.log('\n📋 Test 2: Testing different select patterns');
    
    // Test with specific columns
    const { data: data2, error: error2 } = await supabase
      .from('chart_of_accounts')
      .select('id, account_code, account_name, account_type');
    
    if (error2) {
      console.log('❌ Error with specific columns:', error2.message);
    } else {
      console.log('✅ Success with specific columns! Found', data2?.length || 0, 'records');
    }

    // Test with limit
    const { data: data3, error: error3 } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .limit(5);
    
    if (error3) {
      console.log('❌ Error with limit:', error3.message);
    } else {
      console.log('✅ Success with limit! Found', data3?.length || 0, 'records');
    }

    // Test 3: Test cash_accounts
    console.log('\n💰 Test 3: Testing cash_accounts');
    const { data: cashData, error: cashError } = await supabase
      .from('cash_accounts')
      .select('*');
    
    if (cashError) {
      console.log('❌ Cash accounts error:', cashError.message);
    } else {
      console.log('✅ Cash accounts success! Found', cashData?.length || 0, 'records');
    }

    // Test 4: Test cash_accounts with join (the query used in the app)
    console.log('\n🔗 Test 4: Testing cash_accounts with join');
    const { data: joinData, error: joinError } = await supabase
      .from('cash_accounts')
      .select(`
        *,
        chart_of_accounts (*)
      `);
    
    if (joinError) {
      console.log('❌ Join error:', joinError.message);
    } else {
      console.log('✅ Join success! Found', joinData?.length || 0, 'records');
    }

    // Test 5: Test authentication
    console.log('\n🔐 Test 5: Testing authentication');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('⚠️ No user authenticated (using anon key)');
    }

    // Test 6: Test with different authentication
    console.log('\n🔐 Test 6: Testing with service role key');
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwNjE5NywiZXhwIjoyMDY1NDgyMTk3fQ.example'; // This would be your service role key
    
    // Test 7: Check if table exists
    console.log('\n🏗️ Test 7: Checking if table exists');
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('chart_of_accounts')
        .select('count')
        .limit(0);
      
      if (tableError) {
        console.log('❌ Table existence check failed:', tableError.message);
      } else {
        console.log('✅ Table exists and is accessible');
      }
    } catch (err) {
      console.log('❌ Table existence check exception:', err.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testFetchDirectly();


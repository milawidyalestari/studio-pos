const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseAccountingAddAccount() {
  console.log('🔍 Diagnosing accounting add account issues...\n');

  try {
    // 1. Check if tables exist
    console.log('1. Checking if accounting tables exist...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['chart_of_accounts', 'cash_accounts', 'journal_entries', 'journal_entry_lines'])
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name));
    }

    // 2. Check RLS policies
    console.log('\n2. Checking RLS policies...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, permissive, roles, cmd, qual')
      .in('tablename', ['chart_of_accounts', 'cash_accounts']);

    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message);
    } else {
      console.log('✅ RLS Policies:');
      policies.forEach(policy => {
        console.log(`   - ${policy.tablename}: ${policy.policyname} (${policy.cmd})`);
      });
    }

    // 3. Test basic select
    console.log('\n3. Testing basic select from chart_of_accounts...');
    
    const { data: accounts, error: selectError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .limit(5);

    if (selectError) {
      console.log('❌ Select error:', selectError.message);
      console.log('   Error details:', selectError);
    } else {
      console.log('✅ Select successful, found', accounts.length, 'accounts');
      if (accounts.length > 0) {
        console.log('   Sample account:', accounts[0]);
      }
    }

    // 4. Test insert (dry run)
    console.log('\n4. Testing insert capability...');
    
    const testAccount = {
      account_code: 'TEST001',
      account_name: 'Test Account',
      account_type: 'asset',
      is_active: true,
      description: 'Test account for diagnosis'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('chart_of_accounts')
      .insert(testAccount)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('   Error details:', insertError);
      
      // Check specific error types
      if (insertError.code === 'PGRST301') {
        console.log('   → This is a Row Level Security error');
      } else if (insertError.code === '23505') {
        console.log('   → This is a unique constraint violation');
      } else if (insertError.code === '23503') {
        console.log('   → This is a foreign key constraint violation');
      }
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', insertData.id);
      console.log('   → Test data cleaned up');
    }

    // 5. Check current user authentication
    console.log('\n5. Checking authentication...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('⚠️  No user authenticated (this might be the issue)');
    }

    // 6. Check table structure
    console.log('\n6. Checking table structure...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'chart_of_accounts')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError.message);
    } else {
      console.log('✅ Chart of accounts columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run diagnosis
diagnoseAccountingAddAccount().then(() => {
  console.log('\n🏁 Diagnosis complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Diagnosis failed:', error);
  process.exit(1);
});


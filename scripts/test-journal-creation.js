// Test script untuk memverifikasi pembuatan jurnal
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://oojmuyalhveuefjbwysj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testJournalCreation() {
  console.log('🧪 Testing Journal Creation...\n');

  try {
    // 1. Test koneksi database
    console.log('1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('chart_of_accounts')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if journal_entries table exists
    console.log('\n2. Checking journal_entries table...');
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .limit(1);
    
    if (journalError) {
      console.error('❌ journal_entries table error:', journalError);
      return;
    }
    console.log('✅ journal_entries table exists');

    // 3. Check if journal_entry_lines table exists
    console.log('\n3. Checking journal_entry_lines table...');
    const { data: journalLines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .select('*')
      .limit(1);
    
    if (linesError) {
      console.error('❌ journal_entry_lines table error:', linesError);
      return;
    }
    console.log('✅ journal_entry_lines table exists');

    // 4. Check if chart_of_accounts has data
    console.log('\n4. Checking chart_of_accounts data...');
    const { data: accounts, error: accountsError } = await supabase
      .from('chart_of_accounts')
      .select('id, account_code, account_name')
      .limit(5);
    
    if (accountsError) {
      console.error('❌ chart_of_accounts error:', accountsError);
      return;
    }
    
    if (!accounts || accounts.length === 0) {
      console.warn('⚠️ No chart of accounts found. You need to create accounts first.');
      return;
    }
    console.log('✅ Chart of accounts data found:', accounts.length, 'accounts');

    // 5. Test creating a journal entry
    console.log('\n5. Testing journal entry creation...');
    const testEntryData = {
      entry_number: `TEST_${Date.now()}`,
      transaction_date: new Date().toISOString().split('T')[0],
      description: 'Test journal entry',
      reference_type: 'adjustment',
      reference_id: null,
      journal_lines: [
        {
          account_id: accounts[0].id,
          debit_amount: 100000,
          credit_amount: 0,
          description: 'Test debit'
        },
        {
          account_id: accounts[1]?.id || accounts[0].id,
          debit_amount: 0,
          credit_amount: 100000,
          description: 'Test credit'
        }
      ]
    };

    // Create journal entry
    const { data: journalEntry, error: journalError2 } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: testEntryData.entry_number,
        transaction_date: testEntryData.transaction_date,
        description: testEntryData.description,
        reference_type: testEntryData.reference_type,
        reference_id: testEntryData.reference_id,
        total_debit: testEntryData.journal_lines.reduce((sum, line) => sum + line.debit_amount, 0),
        total_credit: testEntryData.journal_lines.reduce((sum, line) => sum + line.credit_amount, 0),
        status: 'draft'
      })
      .select()
      .single();

    if (journalError2) {
      console.error('❌ Error creating journal entry:', journalError2);
      return;
    }
    console.log('✅ Journal entry created successfully:', journalEntry.id);

    // Create journal entry lines
    const journalLinesData = testEntryData.journal_lines.map(line => ({
      ...line,
      journal_entry_id: journalEntry.id
    }));

    const { error: linesError2 } = await supabase
      .from('journal_entry_lines')
      .insert(journalLinesData);

    if (linesError2) {
      console.error('❌ Error creating journal entry lines:', linesError2);
      // Clean up journal entry
      await supabase.from('journal_entries').delete().eq('id', journalEntry.id);
      return;
    }
    console.log('✅ Journal entry lines created successfully');

    // 6. Clean up test data
    console.log('\n6. Cleaning up test data...');
    await supabase.from('journal_entries').delete().eq('id', journalEntry.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Journal creation should work properly.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testJournalCreation();

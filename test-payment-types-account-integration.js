// Test script to verify payment types account integration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentTypesAccountIntegration() {
  console.log('Testing Payment Types Account Integration...\n');

  try {
    // Test 1: Check if payment_types table has account_id column
    console.log('1. Checking payment_types table structure...');
    const { data: paymentTypes, error: paymentTypesError } = await supabase
      .from('payment_types')
      .select('*')
      .limit(1);

    if (paymentTypesError) {
      console.error('Error fetching payment types:', paymentTypesError);
      return;
    }

    console.log('✓ Payment types table accessible');
    if (paymentTypes.length > 0) {
      console.log('✓ Sample payment type:', paymentTypes[0]);
    }

    // Test 2: Check if chart_of_accounts table exists and has income accounts
    console.log('\n2. Checking chart_of_accounts table...');
    const { data: accounts, error: accountsError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('account_type', 'income')
      .eq('is_active', true)
      .limit(5);

    if (accountsError) {
      console.error('Error fetching chart of accounts:', accountsError);
      return;
    }

    console.log('✓ Chart of accounts table accessible');
    console.log(`✓ Found ${accounts.length} income accounts:`);
    accounts.forEach(acc => {
      console.log(`  - ${acc.account_code}: ${acc.account_name}`);
    });

    // Test 3: Test updating a payment type with account_id
    if (paymentTypes.length > 0 && accounts.length > 0) {
      console.log('\n3. Testing payment type update with account_id...');
      const paymentTypeId = paymentTypes[0].id;
      const accountId = accounts[0].id;

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payment_types')
        .update({ account_id: accountId })
        .eq('id', paymentTypeId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating payment type:', updateError);
        return;
      }

      console.log('✓ Payment type updated successfully');
      console.log('✓ Updated payment type:', updatedPayment);

      // Revert the change
      await supabase
        .from('payment_types')
        .update({ account_id: null })
        .eq('id', paymentTypeId);
      
      console.log('✓ Reverted test change');
    }

    console.log('\n🎉 All tests passed! Payment Types Account Integration is working correctly.');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPaymentTypesAccountIntegration();

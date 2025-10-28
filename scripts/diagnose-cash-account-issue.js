const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseCashAccountIssue() {
  console.log('🔍 DIAGNOSIS: Mengapa tidak ada pemasukan di akun kas\n');

  try {
    // 1. Cek apakah akun kas ada
    console.log('1️⃣ Cek Akun Kas...');
    const { data: cashAccounts, error: cashError } = await supabase
      .from('cash_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (cashError) {
      console.error('❌ Error fetching cash accounts:', cashError);
      return;
    }

    if (!cashAccounts || cashAccounts.length === 0) {
      console.log('❌ TIDAK ADA AKUN KAS! Ini penyebab utama masalah.');
      console.log('💡 Solusi: Jalankan setup akuntansi terlebih dahulu');
      return;
    }

    console.log('✅ Akun kas ditemukan:', cashAccounts.length);
    cashAccounts.forEach(account => {
      console.log(`   - ${account.account_name}: Rp ${account.current_balance?.toLocaleString('id-ID') || 0}`);
    });

    // 2. Cek chart of accounts untuk akun 1110
    console.log('\n2️⃣ Cek Chart of Accounts (Akun 1110)...');
    const { data: chartAccounts, error: chartError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('account_code', '1110');

    if (chartError) {
      console.error('❌ Error fetching chart of accounts:', chartError);
      return;
    }

    if (!chartAccounts || chartAccounts.length === 0) {
      console.log('❌ AKUN 1110 (Kas) TIDAK ADA di chart of accounts!');
      console.log('💡 Solusi: Jalankan migration akuntansi');
      return;
    }

    console.log('✅ Akun 1110 ditemukan:', chartAccounts[0].account_name);

    // 3. Cek orders yang sudah done
    console.log('\n3️⃣ Cek Orders dengan Status Done...');
    const { data: doneOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'done')
      .order('tanggal', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    if (!doneOrders || doneOrders.length === 0) {
      console.log('❌ TIDAK ADA ORDER dengan status "done"!');
      console.log('💡 Solusi: Buat order dan ubah status ke "done"');
      return;
    }

    console.log(`✅ Ditemukan ${doneOrders.length} order dengan status done`);
    doneOrders.forEach(order => {
      console.log(`   - Order #${order.order_number}: Rp ${order.total_amount?.toLocaleString('id-ID') || 0} (${order.payment_type})`);
    });

    // 4. Cek journal entries
    console.log('\n4️⃣ Cek Journal Entries...');
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('reference_type', 'sale')
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (journalError) {
      console.error('❌ Error fetching journal entries:', journalError);
      return;
    }

    if (!journalEntries || journalEntries.length === 0) {
      console.log('❌ TIDAK ADA JOURNAL ENTRIES untuk penjualan!');
      console.log('💡 Kemungkinan trigger tidak berfungsi');
    } else {
      console.log(`✅ Ditemukan ${journalEntries.length} journal entries untuk penjualan`);
      journalEntries.forEach(entry => {
        console.log(`   - ${entry.entry_number}: Rp ${entry.total_debit?.toLocaleString('id-ID') || 0} (${entry.status})`);
      });
    }

    // 5. Cek journal entry lines untuk akun kas
    console.log('\n5️⃣ Cek Journal Entry Lines untuk Akun Kas...');
    const { data: journalLines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .select(`
        *,
        chart_of_accounts!inner(account_code, account_name)
      `)
      .eq('chart_of_accounts.account_code', '1110')
      .order('created_at', { ascending: false })
      .limit(10);

    if (linesError) {
      console.error('❌ Error fetching journal entry lines:', linesError);
      return;
    }

    if (!journalLines || journalLines.length === 0) {
      console.log('❌ TIDAK ADA JOURNAL ENTRY LINES untuk akun kas (1110)!');
      console.log('💡 Ini menunjukkan trigger tidak membuat jurnal untuk akun kas');
    } else {
      console.log(`✅ Ditemukan ${journalLines.length} journal entry lines untuk akun kas`);
      journalLines.forEach(line => {
        console.log(`   - Debit: Rp ${line.debit_amount?.toLocaleString('id-ID') || 0}, Credit: Rp ${line.credit_amount?.toLocaleString('id-ID') || 0}`);
      });
    }

    // 6. Cek trigger
    console.log('\n6️⃣ Cek Database Trigger...');
    const { data: triggers, error: triggerError } = await supabase
      .rpc('check_trigger_exists', { trigger_name: 'create_journal_entry_on_order_completion' });

    if (triggerError) {
      console.log('⚠️  Tidak bisa cek trigger (mungkin tidak ada function check_trigger_exists)');
      console.log('💡 Cek manual di Supabase SQL Editor:');
      console.log('   SELECT * FROM information_schema.triggers WHERE trigger_name = \'create_journal_entry_on_order_completion\';');
    } else {
      console.log('✅ Trigger status:', triggers);
    }

    // 7. Cek payment method mapping
    console.log('\n7️⃣ Cek Payment Method Mapping...');
    const { data: paymentMappings, error: mappingError } = await supabase
      .from('payment_method_accounts')
      .select('*')
      .eq('is_active', true);

    if (mappingError) {
      console.log('⚠️  Tabel payment_method_accounts tidak ada atau error');
    } else if (!paymentMappings || paymentMappings.length === 0) {
      console.log('❌ TIDAK ADA PAYMENT METHOD MAPPING!');
      console.log('💡 Solusi: Setup payment method mapping');
    } else {
      console.log(`✅ Ditemukan ${paymentMappings.length} payment method mappings`);
      paymentMappings.forEach(mapping => {
        console.log(`   - ${mapping.payment_method}: Debit ${mapping.debit_account_code}, Credit ${mapping.credit_account_code}`);
      });
    }

    // 8. Summary dan rekomendasi
    console.log('\n📋 SUMMARY & REKOMENDASI:');
    console.log('========================');

    if (!cashAccounts || cashAccounts.length === 0) {
      console.log('🔴 MASALAH UTAMA: Tidak ada akun kas');
      console.log('💡 SOLUSI: Jalankan scripts/setup-pos-accounting-integration.sql');
    } else if (!chartAccounts || chartAccounts.length === 0) {
      console.log('🔴 MASALAH UTAMA: Akun 1110 tidak ada di chart of accounts');
      console.log('💡 SOLUSI: Jalankan migration akuntansi');
    } else if (!doneOrders || doneOrders.length === 0) {
      console.log('🔴 MASALAH UTAMA: Tidak ada order dengan status done');
      console.log('💡 SOLUSI: Buat order di POS dan ubah status ke "done"');
    } else if (!journalEntries || journalEntries.length === 0) {
      console.log('🔴 MASALAH UTAMA: Trigger tidak membuat journal entries');
      console.log('💡 SOLUSI: Cek dan perbaiki trigger create_journal_entry_on_order_completion');
    } else if (!journalLines || journalLines.length === 0) {
      console.log('🔴 MASALAH UTAMA: Journal entries tidak mencakup akun kas');
      console.log('💡 SOLUSI: Cek payment method mapping dan logika trigger');
    } else {
      console.log('✅ Sistem terlihat normal, cek detail lebih lanjut');
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

// Jalankan diagnosis
diagnoseCashAccountIssue();



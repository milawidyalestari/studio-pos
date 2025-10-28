// Script sederhana untuk mendiagnosis masalah akun kas
// Jalankan di browser console atau Node.js dengan konfigurasi yang tepat

console.log('🔍 DIAGNOSIS: Mengapa tidak ada pemasukan di akun kas\n');

// Daftar kemungkinan penyebab dan solusi
const possibleCauses = [
  {
    cause: "Tidak ada akun kas (cash_accounts kosong)",
    solution: "Jalankan scripts/setup-pos-accounting-integration.sql",
    check: "SELECT * FROM cash_accounts;"
  },
  {
    cause: "Akun 1110 (Kas) tidak ada di chart_of_accounts",
    solution: "Jalankan migration akuntansi",
    check: "SELECT * FROM chart_of_accounts WHERE account_code = '1110';"
  },
  {
    cause: "Tidak ada order dengan status 'done'",
    solution: "Buat order di POS dan ubah status ke 'done'",
    check: "SELECT * FROM orders WHERE LOWER(status::text) = 'done';"
  },
  {
    cause: "Trigger create_journal_entry_on_order_completion tidak ada",
    solution: "Jalankan scripts/fix-cash-account-issue.sql",
    check: "SELECT * FROM information_schema.triggers WHERE trigger_name = 'create_journal_entry_on_order_completion';"
  },
  {
    cause: "Function create_journal_entry_from_order tidak ada",
    solution: "Jalankan scripts/fix-cash-account-issue.sql",
    check: "SELECT * FROM information_schema.routines WHERE routine_name = 'create_journal_entry_from_order';"
  },
  {
    cause: "Payment method mapping tidak ada",
    solution: "Jalankan scripts/fix-cash-account-issue.sql",
    check: "SELECT * FROM payment_method_accounts WHERE is_active = true;"
  },
  {
    cause: "Journal entries tidak dibuat untuk akun kas",
    solution: "Cek logika trigger dan payment method mapping",
    check: `SELECT jel.*, coa.account_code, coa.account_name 
            FROM journal_entry_lines jel
            JOIN chart_of_accounts coa ON jel.account_id = coa.id
            WHERE coa.account_code = '1110';`
  }
];

console.log('📋 KEMUNGKINAN PENYEBAB & SOLUSI:');
console.log('================================\n');

possibleCauses.forEach((item, index) => {
  console.log(`${index + 1}. ${item.cause}`);
  console.log(`   💡 Solusi: ${item.solution}`);
  console.log(`   🔍 Cek dengan: ${item.check}\n`);
});

console.log('🚀 LANGKAH PERBAIKAN:');
console.log('===================');
console.log('1. Jalankan script diagnosis: scripts/check-trigger-and-functions.sql');
console.log('2. Jika ada masalah, jalankan: scripts/fix-cash-account-issue.sql');
console.log('3. Test dengan membuat order baru dan ubah status ke "done"');
console.log('4. Cek apakah saldo kas bertambah');

console.log('\n📞 JIKA MASALAH PERSISTEN:');
console.log('========================');
console.log('1. Cek log error di Supabase dashboard');
console.log('2. Pastikan semua migration sudah dijalankan');
console.log('3. Verifikasi konfigurasi database');
console.log('4. Cek apakah ada constraint atau permission issue');



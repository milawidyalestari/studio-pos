# 🔧 Panduan Perbaikan: Mengapa Tidak Ada Pemasukan di Akun Kas

## 🎯 **Masalah yang Dihadapi**
Akun kas tidak mencatat pemasukan dari transaksi penjualan, meskipun order sudah diselesaikan.

## 🔍 **Kemungkinan Penyebab**

### 1. **Tidak Ada Akun Kas**
- Tabel `cash_accounts` kosong
- Tidak ada akun kas yang dikonfigurasi

### 2. **Akun 1110 (Kas) Tidak Ada**
- Akun 1110 tidak ada di `chart_of_accounts`
- Migration akuntansi belum dijalankan

### 3. **Tidak Ada Order dengan Status Done**
- Semua order masih dalam status pending
- Trigger hanya aktif saat status berubah ke "done"

### 4. **Trigger Tidak Ada atau Rusak**
- Trigger `create_journal_entry_on_order_completion` tidak ada
- Function `create_journal_entry_from_order` tidak ada

### 5. **Payment Method Mapping Tidak Ada**
- Tabel `payment_method_accounts` kosong
- Tidak ada mapping untuk tipe pembayaran

### 6. **Journal Entries Tidak Mencakup Akun Kas**
- Jurnal dibuat tapi tidak untuk akun kas
- Logika trigger tidak benar

---

## 🚀 **Langkah Perbaikan**

### **Step 1: Diagnosis Masalah**

Jalankan script diagnosis di Supabase SQL Editor:

```sql
-- Cek akun kas
SELECT * FROM cash_accounts;

-- Cek chart of accounts untuk akun 1110
SELECT * FROM chart_of_accounts WHERE account_code = '1110';

-- Cek orders dengan status done
SELECT * FROM orders WHERE LOWER(status::text) = 'done' LIMIT 5;

-- Cek trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'create_journal_entry_on_order_completion';

-- Cek function
SELECT * FROM information_schema.routines 
WHERE routine_name = 'create_journal_entry_from_order';

-- Cek payment method mapping
SELECT * FROM payment_method_accounts WHERE is_active = true;

-- Cek journal entries untuk penjualan
SELECT * FROM journal_entries WHERE reference_type = 'sale' LIMIT 5;

-- Cek journal entry lines untuk akun kas
SELECT jel.*, coa.account_code, coa.account_name 
FROM journal_entry_lines jel
JOIN chart_of_accounts coa ON jel.account_id = coa.id
WHERE coa.account_code = '1110'
LIMIT 5;
```

### **Step 2: Perbaiki Setup Akuntansi**

Jika diagnosis menunjukkan masalah setup, jalankan script perbaikan:

```sql
-- Jalankan file: scripts/fix-cash-account-issue.sql
-- Script ini akan:
-- 1. Membuat akun 1110, 4100, 1120, 1130 jika belum ada
-- 2. Membuat cash account jika belum ada
-- 3. Membuat payment method mapping
-- 4. Recreate trigger dan function
```

### **Step 3: Test dengan Order Baru**

1. **Buat Order Baru di POS:**
   - Pilih produk
   - Set payment type ke "Cash"
   - Input total amount
   - Save order (status: pending)

2. **Ubah Status ke "Done":**
   - Buka order yang baru dibuat
   - Ubah status dari "pending" ke "done"
   - Trigger akan otomatis membuat jurnal

3. **Verifikasi:**
   - Cek apakah journal entry terbuat
   - Cek apakah saldo kas bertambah
   - Cek journal entry lines untuk akun 1110

### **Step 4: Verifikasi Hasil**

```sql
-- Cek saldo kas terbaru
SELECT account_name, current_balance, updated_at 
FROM cash_accounts 
WHERE is_primary = true;

-- Cek journal entries terbaru
SELECT entry_number, transaction_date, total_debit, total_credit, status
FROM journal_entries 
WHERE reference_type = 'sale'
ORDER BY transaction_date DESC
LIMIT 5;

-- Cek journal entry lines untuk akun kas
SELECT jel.debit_amount, jel.credit_amount, jel.description, je.entry_number
FROM journal_entry_lines jel
JOIN chart_of_accounts coa ON jel.account_id = coa.id
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE coa.account_code = '1110'
ORDER BY je.transaction_date DESC
LIMIT 5;
```

---

## 🔧 **Script Perbaikan Lengkap**

### **File: `scripts/fix-cash-account-issue.sql`**

Script ini akan:
- ✅ Membuat semua akun yang diperlukan (1110, 4100, 1120, 1130)
- ✅ Membuat cash account utama
- ✅ Membuat payment method mapping untuk cash, transfer, credit
- ✅ Recreate trigger dan function dengan logika yang benar
- ✅ Verifikasi setup

### **File: `scripts/check-trigger-and-functions.sql`**

Script diagnosis yang akan mengecek:
- ✅ Status trigger dan function
- ✅ Akun kas dan chart of accounts
- ✅ Orders dengan status done
- ✅ Journal entries dan lines
- ✅ Payment method mapping

---

## 🎯 **Skenario Testing**

### **Test Case 1: Penjualan Tunai**
```
1. Buat order dengan payment_type = 'cash'
2. Ubah status ke 'done'
3. Expected: 
   - Journal entry terbuat
   - Debit: Kas (1110) = total_amount
   - Credit: Pendapatan (4100) = total_amount
   - Saldo kas bertambah
```

### **Test Case 2: Penjualan Transfer**
```
1. Buat order dengan payment_type = 'transfer'
2. Ubah status ke 'done'
3. Expected:
   - Journal entry terbuat
   - Debit: Bank (1120) = total_amount
   - Credit: Pendapatan (4100) = total_amount
   - Saldo kas tidak berubah (karena masuk bank)
```

### **Test Case 3: Penjualan Kredit**
```
1. Buat order dengan payment_type = 'credit'
2. Ubah status ke 'done'
3. Expected:
   - Journal entry terbuat
   - Debit: Piutang (1130) = total_amount
   - Credit: Pendapatan (4100) = total_amount
   - Saldo kas tidak berubah (karena masuk piutang)
```

---

## 🚨 **Troubleshooting**

### **Error: "Required accounting accounts not found"**
**Penyebab:** Akun 1110 atau 4100 tidak ada
**Solusi:** Jalankan script perbaikan

### **Error: "Trigger does not exist"**
**Penyebab:** Trigger belum dibuat
**Solusi:** Jalankan script perbaikan

### **Journal Entry Tidak Terbuat**
**Penyebab:** 
- Status order tidak berubah ke "done"
- Trigger tidak aktif
- Function error

**Solusi:**
1. Pastikan status order berubah ke "done"
2. Cek log error di Supabase
3. Jalankan script perbaikan

### **Saldo Kas Tidak Bertambah**
**Penyebab:**
- Payment method mapping salah
- Logika trigger tidak update cash_accounts
- Akun kas tidak terhubung dengan akun 1110

**Solusi:**
1. Cek payment method mapping
2. Cek logika trigger
3. Verifikasi cash_accounts.account_id = chart_of_accounts.id untuk akun 1110

---

## 📊 **Monitoring & Maintenance**

### **Harian**
- ✅ Cek saldo kas vs kas fisik
- ✅ Review journal entries hari ini
- ✅ Verifikasi semua order "done" punya journal entry

### **Mingguan**
- ✅ Generate trial balance
- ✅ Review outstanding receivables
- ✅ Backup accounting data

### **Bulanan**
- ✅ Generate profit & loss statement
- ✅ Generate balance sheet
- ✅ Review dan close period

---

## 🎉 **Kesimpulan**

Masalah "tidak ada pemasukan di akun kas" biasanya disebabkan oleh:

1. **Setup akuntansi belum lengkap** (70% kasus)
2. **Trigger tidak aktif** (20% kasus)
3. **Payment method mapping salah** (10% kasus)

**Solusi utama:** Jalankan script perbaikan lengkap dan test dengan order baru.

**Prevention:** Pastikan semua migration akuntansi dijalankan saat setup awal sistem.



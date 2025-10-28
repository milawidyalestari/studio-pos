# Integrasi POS dengan Sistem Akuntansi

## Overview

Dokumen ini menjelaskan bagaimana sistem POS Studio terintegrasi dengan sistem akuntansi double-entry. Setiap transaksi penjualan akan secara otomatis dicatat dalam jurnal akuntansi sesuai dengan prinsip akuntansi yang berlaku.

## Arsitektur Integrasi

### 1. Alur Otomatis
```
Order (Status: Done) 
    ↓
Trigger: create_journal_entry_on_order_completion
    ↓
Function: create_journal_entry_from_order()
    ↓
Journal Entry (Posted) + Cash Account Update
```

### 2. Komponen Utama

#### Database Tables
- `orders` - Tabel order POS
- `journal_entries` - Tabel jurnal akuntansi
- `journal_entry_lines` - Detail baris jurnal
- `chart_of_accounts` - Daftar akun
- `cash_accounts` - Akun kas

#### Database Functions
- `create_journal_entry_from_order()` - Auto-create jurnal dari order
- `record_payment_receipt()` - Catat penerimaan pembayaran piutang
- `record_expense()` - Catat pengeluaran

#### Service Layer
- `POSAccountingService` - Service untuk integrasi POS-Accounting
- `AccountingService` - Service untuk manajemen akuntansi

## Cara Kerja

### 1. Penjualan Tunai (Cash Sale)

**Skenario:** Customer membayar penuh secara tunai

**Transaksi POS:**
```
Order:
- Total: Rp 150,000
- Payment Type: Cash
- Status: Done
```

**Jurnal Akuntansi:**
```
Debit: Kas (1110)                 Rp 150,000
Credit: Pendapatan Penjualan (4100)  Rp 150,000
```

### 2. Penjualan Kredit (Credit Sale)

**Skenario:** Customer membayar nanti (tempo)

**Transaksi POS:**
```
Order:
- Total: Rp 200,000
- Payment Type: Credit
- Status: Done
```

**Jurnal Akuntansi:**
```
Debit: Piutang Usaha (1130)          Rp 200,000
Credit: Pendapatan Penjualan (4100)  Rp 200,000
```

### 3. Penjualan dengan Uang Muka (Partial Payment)

**Skenario:** Customer bayar DP, sisanya nanti

**Transaksi POS:**
```
Order:
- Total: Rp 300,000
- Down Payment: Rp 100,000
- Remaining: Rp 200,000
- Status: Done
```

**Jurnal Akuntansi:**
```
Debit: Kas (1110)                    Rp 100,000
Debit: Piutang Usaha (1130)          Rp 200,000
Credit: Pendapatan Penjualan (4100)  Rp 300,000
```

### 4. Pelunasan Piutang

**Skenario:** Customer melunasi piutang

**Cara Pencatatan:**
```typescript
import { posAccountingService } from '@/services/posAccountingService';

await posAccountingService.recordPaymentReceipt({
  order_id: 'uuid-order',
  amount: 200000,
  payment_method: 'cash',
  notes: 'Pelunasan order #123'
});
```

**Jurnal Akuntansi:**
```
Debit: Kas (1110)                Rp 200,000
Credit: Piutang Usaha (1130)     Rp 200,000
```

### 5. Pengeluaran Biaya

**Skenario:** Pembayaran biaya operasional

**Cara Pencatatan:**
```typescript
await posAccountingService.recordExpense({
  expense_account_code: '5210', // Biaya Gaji
  amount: 500000,
  description: 'Gaji karyawan bulan Januari',
  payment_method: 'cash'
});
```

**Jurnal Akuntansi:**
```
Debit: Biaya Gaji (5210)     Rp 500,000
Credit: Kas (1110)           Rp 500,000
```

## Setup & Instalasi

### Step 1: Jalankan Migration

Jalankan migration di Supabase SQL Editor:

```sql
-- 1. Setup sistem akuntansi dasar
-- File: supabase/migrations/20250118000000_create_accounting_system.sql

-- 2. Setup fungsi akuntansi
-- File: supabase/migrations/20250118000001_create_accounting_functions.sql

-- 3. Setup integrasi POS-Accounting
-- File: supabase/migrations/20250118000002_integrate_pos_accounting.sql
```

### Step 2: Verifikasi Setup

Cek apakah semua akun sudah ada:

```sql
SELECT account_code, account_name, account_type 
FROM chart_of_accounts 
WHERE account_code IN ('1110', '1130', '4100')
ORDER BY account_code;
```

Hasil yang diharapkan:
```
1110 | Kas                    | asset
1130 | Piutang Usaha          | asset
4100 | Pendapatan Penjualan   | income
```

### Step 3: Test Integrasi

1. Buat order baru di POS
2. Ubah status order ke "Done"
3. Cek apakah journal entry otomatis terbuat:

```sql
SELECT * FROM v_order_journal_entries 
WHERE order_number = 'ORD-XXX';
```

## Penggunaan Service

### Import Service

```typescript
import { posAccountingService } from '@/services/posAccountingService';
```

### Get Order Journal Entries

```typescript
const { data, error } = await posAccountingService.getOrderJournalEntries(orderId);
```

### Get Outstanding Receivables

```typescript
const { data, error } = await posAccountingService.getOutstandingReceivables();
```

### Get Sales Summary

```typescript
const { data, error } = await posAccountingService.getSalesSummary(
  '2025-01-01', 
  '2025-01-31'
);
```

### Get Cash Flow

```typescript
const { data, error } = await posAccountingService.getCashFlow(
  '2025-01-01',
  '2025-01-31'
);

console.log(data.cash_in);      // Total uang masuk
console.log(data.cash_out);     // Total uang keluar
console.log(data.net_cash_flow); // Arus kas bersih
```

### Get Account Balance

```typescript
const { data, error } = await posAccountingService.getAccountBalance('1110');
console.log('Saldo Kas:', data);
```

## Database Views

### v_order_journal_entries

Menampilkan relasi antara order dan journal entries:

```sql
SELECT * FROM v_order_journal_entries
WHERE order_date >= '2025-01-01'
ORDER BY order_date DESC;
```

### v_sales_summary

Ringkasan penjualan per hari:

```sql
SELECT * FROM v_sales_summary
WHERE date >= '2025-01-01'
ORDER BY date DESC;
```

### v_outstanding_receivables

Daftar piutang yang belum dilunasi:

```sql
SELECT * FROM v_outstanding_receivables
ORDER BY days_outstanding DESC;
```

## Chart of Accounts (Kode Akun)

### Assets (1xxx)
- `1110` - Kas
- `1120` - Bank
- `1130` - Piutang Usaha
- `1140` - Persediaan
- `1210` - Peralatan
- `1220` - Kendaraan

### Liabilities (2xxx)
- `2110` - Hutang Usaha
- `2120` - Hutang Pajak

### Equity (3xxx)
- `3100` - Modal Pemilik
- `3200` - Laba Ditahan

### Income (4xxx)
- `4100` - Pendapatan Penjualan
- `4200` - Pendapatan Lain-lain

### Expenses (5xxx)
- `5100` - Harga Pokok Penjualan
- `5210` - Biaya Gaji
- `5220` - Biaya Sewa
- `5230` - Biaya Listrik
- `5240` - Biaya Internet
- `5300` - Biaya Administrasi

## Best Practices

### 1. Selalu Gunakan Trigger Otomatis

Jangan manual buat journal entry untuk transaksi penjualan. Biarkan trigger otomatis yang menangani.

### 2. Verifikasi Keseimbangan

Semua journal entry harus seimbang (debit = credit):

```typescript
const { data: isValid } = await posAccountingService.verifyJournalBalance(journalId);
```

### 3. Monitoring Piutang

Rutin cek piutang yang outstanding:

```typescript
const { data: receivables } = await posAccountingService.getOutstandingReceivables();

// Alert untuk piutang > 30 hari
const overdue = receivables?.filter(r => r.days_outstanding > 30);
```

### 4. Rekonsiliasi Harian

Setiap hari, cek saldo kas di sistem dengan kas fisik:

```typescript
const { data: kasBalance } = await posAccountingService.getAccountBalance('1110');
console.log('Saldo Kas di Sistem:', kasBalance);
// Bandingkan dengan kas fisik
```

### 5. Backup Regular

Selalu backup data akuntansi secara berkala.

## Troubleshooting

### Error: "Required accounting accounts not found"

**Penyebab:** Akun 1110 (Kas), 1130 (Piutang), atau 4100 (Pendapatan) belum dibuat.

**Solusi:**
```sql
-- Jalankan kembali migration:
-- supabase/migrations/20250118000000_create_accounting_system.sql
```

### Journal Entry Tidak Terbuat Otomatis

**Penyebab:** Trigger belum aktif atau status order tidak berubah ke "Done"

**Solusi:**
```sql
-- Cek trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'create_journal_entry_on_order_completion';

-- Jika tidak ada, jalankan ulang:
-- supabase/migrations/20250118000002_integrate_pos_accounting.sql
```

### Saldo Tidak Balance

**Penyebab:** Ada journal entry yang tidak seimbang

**Solusi:**
```sql
-- Cek journal entries yang tidak balance
SELECT je.*, 
       je.total_debit - je.total_credit as difference
FROM journal_entries je
WHERE ABS(je.total_debit - je.total_credit) > 0.01
AND je.status = 'posted';
```

## Monitoring & Reporting

### Dashboard Metrics

```typescript
// Total Penjualan Hari Ini
const today = new Date().toISOString().split('T')[0];
const { data: todaySales } = await posAccountingService.getSalesSummary(today, today);

// Piutang Outstanding
const { data: receivables } = await posAccountingService.getOutstandingReceivables();
const totalReceivables = receivables?.reduce((sum, r) => sum + r.remaining_payment, 0);

// Saldo Kas
const { data: cashBalance } = await posAccountingService.getAccountBalance('1110');
```

### Export Reports

```typescript
// Export data untuk Excel/PDF
const { data: salesData } = await posAccountingService.getSalesSummary(
  startDate, 
  endDate
);

// Convert to CSV or send to reporting service
```

## Support & Maintenance

### Regular Maintenance Tasks

1. **Daily:**
   - Cek saldo kas
   - Review outstanding receivables
   - Verify posted journal entries

2. **Weekly:**
   - Generate trial balance
   - Review expense accounts
   - Backup accounting data

3. **Monthly:**
   - Generate profit & loss statement
   - Generate balance sheet
   - Review and close period

### Contact

Untuk pertanyaan atau masalah terkait integrasi POS-Accounting, silakan hubungi tim development.

---

## Changelog

### Version 1.0.0 (2025-01-18)
- Initial release
- Auto-create journal entries from orders
- Support cash, credit, and partial payment
- Payment receipt recording
- Expense recording
- Real-time cash account updates
- Reporting views (sales summary, outstanding receivables)


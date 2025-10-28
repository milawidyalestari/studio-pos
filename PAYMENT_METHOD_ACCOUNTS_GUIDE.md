# 💳 Panduan Master Data - Mapping Pembayaran ke Akun

## 📋 Overview

Sistem ini memungkinkan Anda mengatur setiap tipe pembayaran masuk ke akun akuntansi yang berbeda. Misalnya:
- **Cash** → Akun Kas (1110)
- **Transfer** → Akun Bank (1120)  
- **Credit** → Akun Piutang (1130)
- **E-wallet** → Akun Kas (1110)
- **QRIS** → Akun Bank (1120)

---

## 🚀 Setup Awal

### Step 1: Jalankan Migration
```sql
-- Buka Supabase Dashboard → SQL Editor
-- Copy & paste: scripts/setup-payment-method-accounts.sql
-- Klik Run
```

### Step 2: Verifikasi Setup
```sql
-- Cek mapping yang sudah dibuat
SELECT * FROM v_payment_method_accounts;
```

---

## 🎯 Cara Menggunakan

### 1. Akses Master Data
```
Menu → Settings → Payment Method Settings
atau
/accounting/payment-methods
```

### 2. Kelola Mapping
- **Tambah Mapping Baru**: Klik "Tambah Mapping"
- **Edit Mapping**: Klik tombol edit (pensil)
- **Aktif/Nonaktif**: Klik tombol toggle
- **Hapus Mapping**: Klik tombol hapus (trash)

### 3. Mapping Otomatis
Setelah mapping dibuat, setiap transaksi POS akan otomatis:
- ✅ Menggunakan akun yang sudah dipetakan
- ✅ Mencatat jurnal sesuai mapping
- ✅ Update saldo akun yang tepat

---

## 📊 Tipe Pembayaran yang Didukung

### Standard Payment Methods
| Tipe | Label | Akun Default | Keterangan |
|------|-------|--------------|------------|
| `cash` | Tunai | 1110 - Kas | Pembayaran uang tunai |
| `transfer` | Transfer | 1120 - Bank | Transfer bank |
| `credit` | Kredit | 1130 - Piutang | Pembayaran tempo |
| `ewallet` | E-Wallet | 1110 - Kas | GoPay, OVO, DANA, dll |
| `qris` | QRIS | 1120 - Bank | QRIS Indonesia |

### Custom Payment Methods
Anda bisa menambahkan tipe pembayaran custom:
- `debit_card` - Kartu Debit
- `credit_card` - Kartu Kredit  
- `paypal` - PayPal
- `gopay` - GoPay
- `ovo` - OVO
- `dana` - DANA
- `shopeepay` - ShopeePay
- `linkaja` - LinkAja

---

## 🏦 Akun yang Bisa Dipetakan

### Asset Accounts (1xxx)
- **1110 - Kas** - Uang tunai
- **1120 - Bank** - Rekening bank
- **1130 - Piutang Usaha** - Piutang pelanggan
- **1140 - Persediaan** - Barang dagang
- **1210 - Peralatan** - Aset tetap

### Liability Accounts (2xxx)
- **2110 - Hutang Usaha** - Hutang supplier
- **2120 - Hutang Pajak** - Hutang pajak

### Income Accounts (4xxx)
- **4100 - Pendapatan Penjualan** - Pendapatan utama
- **4200 - Pendapatan Lain-lain** - Pendapatan tambahan

### Expense Accounts (5xxx)
- **5100 - Harga Pokok Penjualan** - HPP
- **5210 - Biaya Gaji** - Gaji karyawan
- **5220 - Biaya Sewa** - Sewa tempat
- **5230 - Biaya Listrik** - Tagihan listrik
- **5240 - Biaya Internet** - Tagihan internet

---

## 🔧 Contoh Konfigurasi

### Skenario 1: Toko Konvensional
```sql
-- Cash → Kas
UPDATE payment_method_accounts 
SET account_code = '1110', account_name = 'Kas'
WHERE payment_method = 'cash';

-- Transfer → Bank
UPDATE payment_method_accounts 
SET account_code = '1120', account_name = 'Bank'
WHERE payment_method = 'transfer';

-- Credit → Piutang
UPDATE payment_method_accounts 
SET account_code = '1130', account_name = 'Piutang Usaha'
WHERE payment_method = 'credit';
```

### Skenario 2: Toko Digital (E-commerce)
```sql
-- E-wallet → Kas Digital
UPDATE payment_method_accounts 
SET account_code = '1110', account_name = 'Kas Digital'
WHERE payment_method = 'ewallet';

-- QRIS → Bank
UPDATE payment_method_accounts 
SET account_code = '1120', account_name = 'Bank'
WHERE payment_method = 'qris';

-- Credit Card → Piutang
UPDATE payment_method_accounts 
SET account_code = '1130', account_name = 'Piutang Usaha'
WHERE payment_method = 'credit_card';
```

### Skenario 3: Multi-Channel
```sql
-- GoPay → Kas Digital
INSERT INTO payment_method_accounts (payment_method, account_code, account_name, description)
VALUES ('gopay', '1110', 'Kas Digital', 'Pembayaran GoPay');

-- OVO → Kas Digital  
INSERT INTO payment_method_accounts (payment_method, account_code, account_name, description)
VALUES ('ovo', '1110', 'Kas Digital', 'Pembayaran OVO');

-- DANA → Bank
INSERT INTO payment_method_accounts (payment_method, account_code, account_name, description)
VALUES ('dana', '1120', 'Bank', 'Pembayaran DANA');
```

---

## 📈 Alur Kerja Otomatis

### 1. Order dengan Cash
```
Order: payment_type = 'cash'
  ↓
Sistem cek mapping: cash → 1110 (Kas)
  ↓
Jurnal:
  Debit: Kas (1110) = Rp 100,000
  Credit: Pendapatan (4100) = Rp 100,000
  ↓
Update saldo Kas +Rp 100,000
```

### 2. Order dengan Transfer
```
Order: payment_type = 'transfer'
  ↓
Sistem cek mapping: transfer → 1120 (Bank)
  ↓
Jurnal:
  Debit: Bank (1120) = Rp 200,000
  Credit: Pendapatan (4100) = Rp 200,000
  ↓
Update saldo Bank +Rp 200,000
```

### 3. Order dengan E-wallet
```
Order: payment_type = 'ewallet'
  ↓
Sistem cek mapping: ewallet → 1110 (Kas)
  ↓
Jurnal:
  Debit: Kas (1110) = Rp 150,000
  Credit: Pendapatan (4100) = Rp 150,000
  ↓
Update saldo Kas +Rp 150,000
```

---

## 🎛️ UI Components

### 1. PaymentMethodAccountManager
- Tabel lengkap semua mapping
- CRUD operations (Create, Read, Update, Delete)
- Toggle status aktif/nonaktif
- Form untuk tambah/edit mapping

### 2. PaymentMethodAccountCard
- Card preview mapping
- Status indicator
- Account type badge
- Quick overview

### 3. PaymentMethodAccountOverview
- Grid layout semua mapping
- Visual status
- Easy monitoring

---

## 🔍 Monitoring & Reporting

### Cek Mapping Aktif
```sql
SELECT 
    payment_method,
    account_code,
    account_name,
    is_active
FROM v_payment_method_accounts
WHERE is_active = true
ORDER BY payment_method;
```

### Cek Transaksi per Payment Method
```sql
SELECT 
    je.reference_type,
    o.payment_type,
    COUNT(*) as transaction_count,
    SUM(je.total_debit) as total_amount
FROM journal_entries je
JOIN orders o ON je.reference_id = o.id
WHERE je.reference_type = 'sale'
GROUP BY je.reference_type, o.payment_type
ORDER BY total_amount DESC;
```

### Cek Saldo per Akun
```sql
SELECT 
    coa.account_code,
    coa.account_name,
    ca.current_balance
FROM chart_of_accounts coa
LEFT JOIN cash_accounts ca ON coa.id = ca.account_id
WHERE coa.account_code IN ('1110', '1120', '1130')
ORDER BY coa.account_code;
```

---

## ⚠️ Best Practices

### 1. Konsistensi Naming
- Gunakan huruf kecil untuk payment_method
- Gunakan underscore untuk multi-word (e.g., `credit_card`)
- Hindari spasi dan karakter khusus

### 2. Mapping yang Logis
- Cash → Kas (1110)
- Transfer/QRIS → Bank (1120)
- Credit → Piutang (1130)
- E-wallet → Kas atau Bank (tergantung preferensi)

### 3. Testing
- Test mapping dengan order dummy
- Verifikasi jurnal entry terbuat dengan benar
- Cek saldo akun update sesuai mapping

### 4. Backup
- Export mapping sebelum perubahan besar
- Dokumentasikan perubahan mapping
- Monitor transaksi setelah perubahan

---

## 🆘 Troubleshooting

### ❌ Error: "Account not found"
**Penyebab:** Akun tujuan belum ada di Chart of Accounts
**Solusi:**
```sql
-- Cek akun yang ada
SELECT account_code, account_name FROM chart_of_accounts WHERE is_active = true;

-- Buat akun yang diperlukan
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES ('1110', 'Kas', 'asset');
```

### ❌ Mapping tidak digunakan
**Penyebab:** Mapping tidak aktif atau tidak ada
**Solusi:**
```sql
-- Cek status mapping
SELECT * FROM v_payment_method_accounts WHERE payment_method = 'cash';

-- Aktifkan mapping
UPDATE payment_method_accounts 
SET is_active = true 
WHERE payment_method = 'cash';
```

### ❌ Jurnal salah akun
**Penyebab:** Mapping salah atau tidak ada
**Solusi:**
```sql
-- Update mapping
UPDATE payment_method_accounts 
SET account_code = '1110', account_name = 'Kas'
WHERE payment_method = 'cash';
```

---

## 📚 API Reference

### Service Methods
```typescript
// Get all mappings
const { data } = await paymentMethodAccountService.getPaymentMethodAccounts();

// Get specific mapping
const { data } = await paymentMethodAccountService.getPaymentMethodAccount('cash');

// Create mapping
await paymentMethodAccountService.createPaymentMethodAccount({
  payment_method: 'gopay',
  account_code: '1110',
  description: 'Pembayaran GoPay'
});

// Update mapping
await paymentMethodAccountService.updatePaymentMethodAccount('gopay', {
  account_code: '1120',
  description: 'Pembayaran GoPay ke Bank'
});
```

### React Hooks
```typescript
// Use in components
const { usePaymentMethodAccounts } = usePaymentMethodAccounts();
const { data: mappings } = usePaymentMethodAccounts();

// Get account for payment method
const { data: account } = useAccountForPaymentMethod('cash');
```

---

## ✨ Keunggulan Sistem

1. **Fleksibel** - Bisa map ke akun manapun
2. **Otomatis** - Tidak perlu input manual
3. **Konsisten** - Setiap tipe pembayaran selalu ke akun yang sama
4. **Traceable** - Mudah tracking transaksi per payment method
5. **Scalable** - Mudah tambah payment method baru
6. **User-friendly** - UI yang mudah digunakan

---

**🎉 Sistem Master Data Pembayaran siap digunakan!**

Sekarang setiap tipe pembayaran bisa dipetakan ke akun akuntansi yang sesuai dengan kebutuhan bisnis Anda.

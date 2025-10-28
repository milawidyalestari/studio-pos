# 💳 Panduan Master Data - Debit/Credit Accounts untuk Tipe Pembayaran

## 📋 Overview

Sistem ini memungkinkan Anda mengatur **akun debit dan credit yang berbeda** untuk setiap tipe pembayaran. Ini memberikan fleksibilitas penuh dalam mengatur alur uang masuk dan keluar berdasarkan metode pembayaran.

---

## 🎯 Konsep Debit/Credit dalam Pembayaran

### **Akun Debit (Uang Masuk)**
- Akun yang akan **didebit** saat menerima pembayaran
- Biasanya akun aset (Kas, Bank, Piutang)
- Contoh: 1110 (Kas), 1120 (Bank), 1130 (Piutang)

### **Akun Credit (Pendapatan)**
- Akun yang akan **dikredit** untuk mencatat pendapatan
- Biasanya akun pendapatan
- Contoh: 4100 (Pendapatan Penjualan)

---

## 🔄 Contoh Mapping Debit/Credit

### **Skenario 1: Toko Konvensional**

| Tipe Pembayaran | Debit Account | Credit Account | Keterangan |
|-----------------|---------------|----------------|------------|
| **Cash** | 1110 - Kas | 4100 - Pendapatan | Uang tunai masuk ke kas |
| **Transfer** | 1120 - Bank | 4100 - Pendapatan | Transfer masuk ke bank |
| **Credit** | 1130 - Piutang | 4100 - Pendapatan | Kredit masuk ke piutang |

### **Skenario 2: E-commerce Modern**

| Tipe Pembayaran | Debit Account | Credit Account | Keterangan |
|-----------------|---------------|----------------|------------|
| **Cash** | 1110 - Kas | 4100 - Pendapatan | Uang tunai |
| **Transfer** | 1120 - Bank | 4100 - Pendapatan | Transfer bank |
| **QRIS** | 1120 - Bank | 4100 - Pendapatan | QRIS masuk ke bank |
| **E-wallet** | 1110 - Kas Digital | 4100 - Pendapatan | E-wallet masuk ke kas digital |
| **Credit Card** | 1130 - Piutang | 4100 - Pendapatan | Kartu kredit masuk ke piutang |

### **Skenario 3: Multi-Channel Complex**

| Tipe Pembayaran | Debit Account | Credit Account | Keterangan |
|-----------------|---------------|----------------|------------|
| **Cash** | 1110 - Kas Utama | 4100 - Pendapatan | Kas fisik |
| **Transfer** | 1120 - Bank BCA | 4100 - Pendapatan | Transfer ke BCA |
| **QRIS** | 1120 - Bank Mandiri | 4100 - Pendapatan | QRIS ke Mandiri |
| **GoPay** | 1110 - Kas Digital | 4100 - Pendapatan | GoPay masuk kas digital |
| **OVO** | 1110 - Kas Digital | 4100 - Pendapatan | OVO masuk kas digital |
| **DANA** | 1120 - Bank DANA | 4100 - Pendapatan | DANA ke bank khusus |
| **Credit** | 1130 - Piutang | 4100 - Pendapatan | Kredit/tempo |

---

## 🚀 Setup Awal

### Step 1: Jalankan Migration
```sql
-- Buka Supabase Dashboard → SQL Editor
-- Copy & paste: scripts/setup-payment-method-debit-credit.sql
-- Klik Run
```

### Step 2: Verifikasi Setup
```sql
-- Cek mapping debit/credit yang sudah dibuat
SELECT 
    payment_method,
    debit_account_code,
    debit_account_name,
    credit_account_code,
    credit_account_name
FROM v_payment_method_accounts
ORDER BY payment_method;
```

---

## 🎛️ Cara Menggunakan UI

### 1. Akses Master Data
```
Menu → Settings → Payment Method Settings
atau
/accounting/payment-methods
```

### 2. Tambah/Edit Mapping
1. Klik **"Tambah Mapping"** atau **Edit** mapping existing
2. Isi form:
   - **Tipe Pembayaran**: `cash`, `transfer`, `credit`, dll
   - **Akun Debit**: Pilih akun untuk uang masuk (1110, 1120, 1130)
   - **Akun Credit**: Pilih akun untuk pendapatan (4100)
   - **Deskripsi**: Keterangan opsional

### 3. Preview Mapping
- Lihat semua mapping dalam grid
- Setiap card menampilkan debit dan credit account
- Status aktif/nonaktif

---

## 📊 Alur Kerja Otomatis

### **Order dengan Cash**
```
Order: payment_type = 'cash', total = Rp 100,000
  ↓
Sistem cek mapping: cash → Debit: 1110 (Kas), Credit: 4100 (Pendapatan)
  ↓
Jurnal:
  Debit: Kas (1110) = Rp 100,000
  Credit: Pendapatan (4100) = Rp 100,000
  ↓
Saldo Kas +Rp 100,000
```

### **Order dengan Transfer**
```
Order: payment_type = 'transfer', total = Rp 200,000
  ↓
Sistem cek mapping: transfer → Debit: 1120 (Bank), Credit: 4100 (Pendapatan)
  ↓
Jurnal:
  Debit: Bank (1120) = Rp 200,000
  Credit: Pendapatan (4100) = Rp 200,000
  ↓
Saldo Bank +Rp 200,000
```

### **Order dengan E-wallet**
```
Order: payment_type = 'ewallet', total = Rp 150,000
  ↓
Sistem cek mapping: ewallet → Debit: 1110 (Kas), Credit: 4100 (Pendapatan)
  ↓
Jurnal:
  Debit: Kas (1110) = Rp 150,000
  Credit: Pendapatan (4100) = Rp 150,000
  ↓
Saldo Kas +Rp 150,000
```

---

## 🔧 Konfigurasi Advanced

### **Custom Debit Accounts**

#### Skenario: Pisahkan Kas Fisik dan Digital
```sql
-- Buat akun kas digital
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES ('1111', 'Kas Digital', 'asset');

-- Update mapping e-wallet
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1111'),
    debit_account_code = '1111',
    debit_account_name = 'Kas Digital'
WHERE payment_method = 'ewallet';
```

#### Skenario: Pisahkan Bank per Provider
```sql
-- Buat akun bank khusus
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES ('1121', 'Bank BCA', 'asset'),
       ('1122', 'Bank Mandiri', 'asset'),
       ('1123', 'Bank DANA', 'asset');

-- Update mapping per provider
UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1121'),
    debit_account_code = '1121',
    debit_account_name = 'Bank BCA'
WHERE payment_method = 'transfer';

UPDATE payment_method_accounts SET
    debit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1122'),
    debit_account_code = '1122',
    debit_account_name = 'Bank Mandiri'
WHERE payment_method = 'qris';
```

### **Custom Credit Accounts**

#### Skenario: Pisahkan Pendapatan per Channel
```sql
-- Buat akun pendapatan per channel
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES ('4101', 'Pendapatan Offline', 'income'),
       ('4102', 'Pendapatan Online', 'income'),
       ('4103', 'Pendapatan E-commerce', 'income');

-- Update mapping per channel
UPDATE payment_method_accounts SET
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4101'),
    credit_account_code = '4101',
    credit_account_name = 'Pendapatan Offline'
WHERE payment_method IN ('cash', 'transfer');

UPDATE payment_method_accounts SET
    credit_account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4102'),
    credit_account_code = '4102',
    credit_account_name = 'Pendapatan Online'
WHERE payment_method IN ('ewallet', 'qris');
```

---

## 📈 Monitoring & Reporting

### **Cek Mapping Aktif**
```sql
SELECT 
    payment_method,
    debit_account_code,
    debit_account_name,
    credit_account_code,
    credit_account_name,
    is_active
FROM v_payment_method_accounts
WHERE is_active = true
ORDER BY payment_method;
```

### **Cek Transaksi per Payment Method**
```sql
SELECT 
    o.payment_type,
    COUNT(*) as transaction_count,
    SUM(je.total_debit) as total_amount,
    pma.debit_account_code,
    pma.credit_account_code
FROM journal_entries je
JOIN orders o ON je.reference_id = o.id
LEFT JOIN payment_method_accounts pma ON o.payment_type = pma.payment_method
WHERE je.reference_type = 'sale'
GROUP BY o.payment_type, pma.debit_account_code, pma.credit_account_code
ORDER BY total_amount DESC;
```

### **Cek Saldo per Akun Debit**
```sql
SELECT 
    coa.account_code,
    coa.account_name,
    COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) as balance
FROM chart_of_accounts coa
LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.status = 'posted'
    AND coa.account_code IN ('1110', '1120', '1130')
GROUP BY coa.account_code, coa.account_name
ORDER BY coa.account_code;
```

---

## 🎯 Best Practices

### 1. **Konsistensi Naming**
- Gunakan prefix untuk akun serupa (1110, 1111, 1112 untuk kas)
- Gunakan suffix untuk channel (1120-BCA, 1120-Mandiri)
- Dokumentasikan mapping di deskripsi

### 2. **Mapping yang Logis**
- **Cash** → Kas (1110)
- **Transfer/QRIS** → Bank (1120)
- **E-wallet** → Kas Digital (1111)
- **Credit** → Piutang (1130)
- **Semua** → Pendapatan (4100)

### 3. **Testing & Validation**
- Test mapping dengan order dummy
- Verifikasi jurnal entry terbuat dengan benar
- Cek saldo akun update sesuai mapping

### 4. **Documentation**
- Dokumentasikan semua mapping
- Update mapping saat ada perubahan bisnis
- Monitor transaksi setelah perubahan

---

## 🆘 Troubleshooting

### ❌ Error: "Debit account not found"
**Penyebab:** Akun debit belum ada di Chart of Accounts
**Solusi:**
```sql
-- Cek akun yang ada
SELECT account_code, account_name FROM chart_of_accounts WHERE is_active = true;

-- Buat akun yang diperlukan
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES ('1111', 'Kas Digital', 'asset');
```

### ❌ Error: "Credit account not found"
**Penyebab:** Akun credit belum ada di Chart of Accounts
**Solusi:**
```sql
-- Buat akun pendapatan
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES ('4100', 'Pendapatan Penjualan', 'income');
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
SET debit_account_code = '1110', debit_account_name = 'Kas'
WHERE payment_method = 'cash';
```

---

## 📚 API Reference

### Service Methods
```typescript
// Get debit/credit accounts for payment method
const { data } = await paymentMethodAccountService.getDebitCreditAccountsForPaymentMethod('cash');

// Create mapping with debit/credit
await paymentMethodAccountService.createPaymentMethodAccount({
  payment_method: 'gopay',
  debit_account_code: '1111',
  credit_account_code: '4100',
  description: 'GoPay masuk ke kas digital'
});

// Update mapping
await paymentMethodAccountService.updatePaymentMethodAccount('gopay', {
  debit_account_code: '1110',
  credit_account_code: '4100',
  description: 'GoPay masuk ke kas utama'
});
```

### React Hooks
```typescript
// Use in components
const { usePaymentMethodAccounts } = usePaymentMethodAccounts();
const { data: mappings } = usePaymentMethodAccounts();

// Get debit/credit accounts
const { data: accounts } = useDebitCreditAccountsForPaymentMethod('cash');
```

---

## ✨ Keunggulan Sistem

1. **Fleksibel** - Bisa map debit dan credit ke akun manapun
2. **Otomatis** - Tidak perlu input manual mapping
3. **Konsisten** - Setiap tipe pembayaran selalu ke akun yang sama
4. **Scalable** - Mudah tambah payment method dan akun baru
5. **Traceable** - Mudah tracking transaksi per payment method
6. **User-friendly** - UI yang mudah digunakan
7. **Compliant** - Double-entry accounting yang proper

---

## 🎉 Kesimpulan

Sistem **Debit/Credit Accounts untuk Tipe Pembayaran** memberikan:

- ✅ **Fleksibilitas Penuh** - Debit dan credit bisa berbeda
- ✅ **Mapping Otomatis** - Tidak perlu input manual
- ✅ **UI yang Mudah** - Master data management yang intuitif
- ✅ **Monitoring Lengkap** - Tracking dan reporting detail
- ✅ **Scalable** - Mudah dikembangkan sesuai kebutuhan

**Sekarang Anda bisa mengatur alur uang masuk dan keluar dengan sangat detail berdasarkan tipe pembayaran!** 🚀

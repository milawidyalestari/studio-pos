# 📊 Sistem Akuntansi POS Studio - Overview Lengkap

## 🎯 **Konsep Dasar Sistem**

Sistem akuntansi POS Anda menggunakan **prinsip double-entry accounting** yang terintegrasi penuh dengan transaksi penjualan. Setiap transaksi POS otomatis menghasilkan jurnal akuntansi yang seimbang (debit = credit).

---

## 🏗️ **Arsitektur Sistem**

### **1. Database Layer**
```
📁 Database Tables:
├── orders (Transaksi POS)
├── chart_of_accounts (Daftar Akun)
├── cash_accounts (Akun Kas)
├── journal_entries (Header Jurnal)
├── journal_entry_lines (Detail Jurnal)
└── payment_method_accounts (Mapping Pembayaran)
```

### **2. Business Logic Layer**
```
🔧 Functions & Triggers:
├── create_journal_entry_from_order() (Auto-create jurnal)
├── record_payment_receipt() (Catat pelunasan)
├── record_expense() (Catat pengeluaran)
└── create_journal_entry_on_order_completion (Trigger)
```

### **3. Service Layer**
```
⚙️ Services:
├── POSAccountingService (Integrasi POS-Accounting)
├── AccountingService (Manajemen akuntansi)
└── PaymentMethodAccountService (Mapping pembayaran)
```

### **4. UI Layer**
```
🎨 Components:
├── AccountingDashboard (Dashboard monitoring)
├── PaymentMethodAccountManager (Master data)
├── RecordPaymentDialog (Catat pelunasan)
├── RecordExpenseDialog (Catat pengeluaran)
└── OutstandingReceivablesTable (Piutang)
```

---

## 🔄 **Alur Kerja Sistem**

### **FASE 1: Setup Awal**

#### 1.1. Setup Database
```sql
-- Jalankan migration untuk membuat tabel akuntansi
scripts/setup-pos-accounting-integration.sql
scripts/setup-payment-method-debit-credit.sql
```

#### 1.2. Setup Chart of Accounts
```
Akun yang dibuat otomatis:
├── 1110 - Kas (Asset)
├── 1120 - Bank (Asset)  
├── 1130 - Piutang Usaha (Asset)
├── 1140 - Persediaan (Asset)
├── 4100 - Pendapatan Penjualan (Income)
├── 5100 - Harga Pokok Penjualan (Expense)
└── 5210-5240 - Biaya Operasional (Expense)
```

#### 1.3. Setup Payment Method Mapping
```
Mapping Tipe Pembayaran:
├── Cash → Debit: 1110 (Kas), Credit: 4100 (Pendapatan)
├── Transfer → Debit: 1120 (Bank), Credit: 4100 (Pendapatan)
├── Credit → Debit: 1130 (Piutang), Credit: 4100 (Pendapatan)
├── E-wallet → Debit: 1110 (Kas), Credit: 4100 (Pendapatan)
└── QRIS → Debit: 1120 (Bank), Credit: 4100 (Pendapatan)
```

### **FASE 2: Transaksi Penjualan**

#### 2.1. Order Creation
```
User membuat order di POS:
├── Input customer, produk, quantity
├── Set payment type (cash, transfer, credit, dll)
├── Hitung total amount
└── Save order (status: pending)
```

#### 2.2. Order Completion
```
User mengubah status order ke "Done":
├── Trigger: create_journal_entry_on_order_completion
├── Function: create_journal_entry_from_order()
├── Cek payment method mapping
├── Generate journal entry number
└── Create journal entry + lines
```

#### 2.3. Journal Entry Creation
```
Berdasarkan payment type:

CASH PAYMENT:
├── Debit: Kas (1110) = Rp 100,000
├── Credit: Pendapatan (4100) = Rp 100,000
└── Update saldo kas +Rp 100,000

TRANSFER PAYMENT:
├── Debit: Bank (1120) = Rp 200,000
├── Credit: Pendapatan (4100) = Rp 200,000
└── Update saldo bank +Rp 200,000

CREDIT PAYMENT:
├── Debit: Piutang (1130) = Rp 300,000
├── Credit: Pendapatan (4100) = Rp 300,000
└── Update piutang +Rp 300,000

PARTIAL PAYMENT (DP):
├── Debit: Kas (1110) = Rp 100,000 (DP)
├── Debit: Piutang (1130) = Rp 200,000 (Sisa)
├── Credit: Pendapatan (4100) = Rp 300,000
└── Update kas +Rp 100,000, piutang +Rp 200,000
```

### **FASE 3: Penerimaan Pembayaran**

#### 3.1. Pelunasan Piutang
```
User catat pelunasan:
├── Buka OutstandingReceivablesTable
├── Klik "Catat Bayar" untuk order
├── Input amount, payment method, notes
├── Function: record_payment_receipt()
└── Create journal entry
```

#### 3.2. Journal Entry Pelunasan
```
Pelunasan Rp 200,000:
├── Debit: Kas (1110) = Rp 200,000
├── Credit: Piutang (1130) = Rp 200,000
├── Update saldo kas +Rp 200,000
├── Update piutang -Rp 200,000
└── Update order remaining_payment
```

### **FASE 4: Pencatatan Pengeluaran**

#### 4.1. Input Pengeluaran
```
User catat pengeluaran:
├── Buka RecordExpenseDialog
├── Pilih kategori biaya (5210, 5220, dll)
├── Input amount, description
├── Function: record_expense()
└── Create journal entry
```

#### 4.2. Journal Entry Pengeluaran
```
Pengeluaran gaji Rp 5,000,000:
├── Debit: Biaya Gaji (5210) = Rp 5,000,000
├── Credit: Kas (1110) = Rp 5,000,000
├── Update saldo kas -Rp 5,000,000
└── Update biaya gaji +Rp 5,000,000
```

---

## 📊 **Monitoring & Reporting**

### **Dashboard Metrics**
```
Real-time monitoring:
├── Saldo Kas (dari cash_accounts)
├── Penjualan Hari Ini (dari journal_entries)
├── Total Piutang (dari chart_of_accounts)
└── Order Belum Lunas (dari orders)
```

### **Laporan Akuntansi**
```
Available reports:
├── Trial Balance (get_trial_balance())
├── Balance Sheet (get_balance_sheet())
├── Profit & Loss (get_profit_loss())
├── Cash Flow (get_cash_flow())
└── Outstanding Receivables (v_outstanding_receivables)
```

---

## 🔧 **Komponen Utama Sistem**

### **1. Database Functions**

#### `create_journal_entry_from_order()`
- **Trigger**: Otomatis saat order status = 'Done'
- **Input**: Order data (payment_type, total_amount, dll)
- **Process**: 
  - Cek payment method mapping
  - Generate journal entry number
  - Create journal entry + lines
  - Update account balances
- **Output**: Journal entry ID

#### `record_payment_receipt()`
- **Trigger**: Manual via UI
- **Input**: order_id, amount, payment_method, notes
- **Process**:
  - Validasi order exists
  - Create journal entry (debit kas, credit piutang)
  - Update cash account balance
  - Update order remaining_payment
- **Output**: Journal entry ID

#### `record_expense()`
- **Trigger**: Manual via UI
- **Input**: expense_account_code, amount, description
- **Process**:
  - Create journal entry (debit expense, credit kas)
  - Update cash account balance
- **Output**: Journal entry ID

### **2. Service Layer**

#### `POSAccountingService`
```typescript
Methods:
├── recordPaymentReceipt() - Catat pelunasan
├── recordExpense() - Catat pengeluaran
├── getOrderJournalEntries() - Get jurnal per order
├── getSalesSummary() - Ringkasan penjualan
├── getOutstandingReceivables() - Piutang outstanding
├── getCashFlow() - Arus kas
└── getAccountBalance() - Saldo akun
```

#### `PaymentMethodAccountService`
```typescript
Methods:
├── getPaymentMethodAccounts() - Get semua mapping
├── createPaymentMethodAccount() - Buat mapping baru
├── updatePaymentMethodAccount() - Update mapping
├── getDebitCreditAccountsForPaymentMethod() - Get debit/credit
└── togglePaymentMethodAccountStatus() - Aktif/nonaktif
```

### **3. UI Components**

#### `AccountingDashboard`
- Menampilkan metrics real-time
- Cards untuk saldo kas, penjualan, piutang
- Tabel outstanding receivables

#### `PaymentMethodAccountManager`
- Master data management
- CRUD operations untuk mapping pembayaran
- Form input debit/credit accounts

#### `RecordPaymentDialog`
- Dialog untuk catat pelunasan
- Validasi input amount
- Pilihan payment method

#### `RecordExpenseDialog`
- Dialog untuk catat pengeluaran
- Pilihan kategori biaya
- Input description

---

## 🎯 **Skenario Penggunaan Praktis**

### **Skenario 1: Toko Konvensional**

#### Pagi (Buka Toko)
1. Cek saldo kas: `SELECT current_balance FROM cash_accounts WHERE is_primary = true`
2. Review outstanding receivables: `SELECT * FROM v_outstanding_receivables`

#### Sepanjang Hari
3. Terima order dengan berbagai pembayaran:
   - **Cash** → Auto masuk ke Kas (1110)
   - **Transfer** → Auto masuk ke Bank (1120)
   - **Credit** → Auto masuk ke Piutang (1130)

#### Sore (Tutup Toko)
4. Catat pelunasan yang diterima:
   - Buka tabel piutang
   - Klik "Catat Bayar" untuk order yang dilunasi
   - Input jumlah dan metode pembayaran

5. Catat pengeluaran harian:
   - Buka dialog pengeluaran
   - Pilih kategori (gaji, listrik, dll)
   - Input jumlah dan deskripsi

6. Rekonsiliasi kas:
   - Bandingkan saldo sistem vs kas fisik
   - Pastikan semua transaksi tercatat

### **Skenario 2: E-commerce**

#### Order Online
1. Customer order dengan payment gateway
2. Sistem otomatis catat ke akun yang sesuai:
   - **QRIS** → Bank (1120)
   - **E-wallet** → Kas Digital (1110)
   - **Credit Card** → Piutang (1130)

#### Collection & Monitoring
3. Monitor outstanding receivables
4. Follow up customer yang belum bayar
5. Catat pembayaran yang diterima

---

## 📈 **Keunggulan Sistem**

### **1. Otomatis**
- ✅ Jurnal otomatis terbuat saat order selesai
- ✅ Tidak perlu input manual untuk transaksi penjualan
- ✅ Saldo akun update real-time

### **2. Akurat**
- ✅ Double-entry accounting compliant
- ✅ Debit = Credit selalu seimbang
- ✅ Audit trail lengkap

### **3. Fleksibel**
- ✅ Mapping pembayaran bisa disesuaikan
- ✅ Support berbagai tipe pembayaran
- ✅ Easy configuration via UI

### **4. Traceable**
- ✅ Setiap transaksi POS terlacak ke jurnal
- ✅ Order ID tercatat di reference_id
- ✅ History lengkap semua transaksi

### **5. User-friendly**
- ✅ UI yang mudah digunakan
- ✅ Dashboard monitoring real-time
- ✅ Dialog input yang intuitif

### **6. Scalable**
- ✅ Mudah tambah tipe pembayaran baru
- ✅ Mudah tambah akun baru
- ✅ Modular architecture

---

## 🔍 **Monitoring & Maintenance**

### **Harian**
- ✅ Cek saldo kas vs kas fisik
- ✅ Review outstanding receivables
- ✅ Verifikasi transaksi hari ini

### **Mingguan**
- ✅ Generate trial balance
- ✅ Review expense accounts
- ✅ Backup accounting data

### **Bulanan**
- ✅ Generate profit & loss statement
- ✅ Generate balance sheet
- ✅ Review dan close period

---

## 🎉 **Kesimpulan**

Sistem akuntansi POS Anda adalah **sistem double-entry accounting yang terintegrasi penuh** dengan transaksi penjualan. Setiap transaksi POS otomatis menghasilkan jurnal akuntansi yang seimbang, memberikan:

- ✅ **Akurasi** - Double-entry accounting compliant
- ✅ **Otomatis** - Tidak perlu input manual
- ✅ **Fleksibel** - Mapping pembayaran bisa disesuaikan
- ✅ **Traceable** - Audit trail lengkap
- ✅ **User-friendly** - UI yang mudah digunakan
- ✅ **Scalable** - Mudah dikembangkan

**Sistem ini memastikan setiap transaksi POS Anda tercatat dengan benar dalam sistem akuntansi yang proper!** 🚀

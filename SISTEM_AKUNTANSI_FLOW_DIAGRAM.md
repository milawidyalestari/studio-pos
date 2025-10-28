# 🔄 Diagram Alur Kerja Sistem Akuntansi POS

## 📊 **Overview Sistem**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEM AKUNTANSI POS                        │
│                     Double-Entry Accounting                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ **Arsitektur Sistem**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI LAYER      │    │  SERVICE LAYER  │    │ DATABASE LAYER  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Dashboard   │ │◄──►│ │POSAccounting│ │◄──►│ │   Tables    │ │
│ │ Master Data │ │    │ │   Service   │ │    │ │  Functions  │ │
│ │ Dialogs     │ │    │ │             │ │    │ │  Triggers   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Payment     │ │◄──►│ │PaymentMethod│ │◄──►│ │   Views     │ │
│ │ Manager     │ │    │ │   Service   │ │    │ │  Policies   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔄 **Alur Kerja Transaksi Penjualan**

### **1. Order Creation**
```
┌─────────────┐
│ User Input  │
│ - Customer  │
│ - Products  │
│ - Payment   │
│ - Amount    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Save Order  │
│ Status:     │
│ Pending     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Order Table │
│ - order_id  │
│ - customer  │
│ - total     │
│ - payment   │
└─────────────┘
```

### **2. Order Completion (Status: Done)**
```
┌─────────────┐
│ Change      │
│ Status to   │
│ "Done"      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ TRIGGER     │
│ create_journal_entry_on_order_completion
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FUNCTION    │
│ create_journal_entry_from_order()
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Check       │
│ Payment     │
│ Method      │
│ Mapping     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Generate    │
│ Journal     │
│ Entry       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Create      │
│ Journal     │
│ Lines       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Update      │
│ Account     │
│ Balances    │
└─────────────┘
```

---

## 💰 **Mapping Pembayaran ke Jurnal**

### **Cash Payment**
```
Order: payment_type = 'cash', total = Rp 100,000
  │
  ▼
┌─────────────────────────────────────────┐
│ Payment Method Mapping:                │
│ cash → Debit: 1110 (Kas)               │
│       Credit: 4100 (Pendapatan)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Journal Entry:                         │
│ ┌─────────────────┬─────────────────┐   │
│ │ Debit           │ Credit          │   │
│ │ Kas (1110)      │ Pendapatan      │   │
│ │ Rp 100,000      │ (4100)          │   │
│ │                 │ Rp 100,000      │   │
│ └─────────────────┴─────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Update Cash Account:                   │
│ current_balance = current_balance + 100,000
└─────────────────────────────────────────┘
```

### **Transfer Payment**
```
Order: payment_type = 'transfer', total = Rp 200,000
  │
  ▼
┌─────────────────────────────────────────┐
│ Payment Method Mapping:                │
│ transfer → Debit: 1120 (Bank)          │
│           Credit: 4100 (Pendapatan)    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Journal Entry:                         │
│ ┌─────────────────┬─────────────────┐   │
│ │ Debit           │ Credit          │   │
│ │ Bank (1120)     │ Pendapatan      │   │
│ │ Rp 200,000      │ (4100)          │   │
│ │                 │ Rp 200,000      │   │
│ └─────────────────┴─────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Update Bank Account:                   │
│ current_balance = current_balance + 200,000
└─────────────────────────────────────────┘
```

### **Credit Payment**
```
Order: payment_type = 'credit', total = Rp 300,000
  │
  ▼
┌─────────────────────────────────────────┐
│ Payment Method Mapping:                │
│ credit → Debit: 1130 (Piutang)         │
│         Credit: 4100 (Pendapatan)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Journal Entry:                         │
│ ┌─────────────────┬─────────────────┐   │
│ │ Debit           │ Credit          │   │
│ │ Piutang (1130)  │ Pendapatan      │   │
│ │ Rp 300,000      │ (4100)          │   │
│ │                 │ Rp 300,000      │   │
│ └─────────────────┴─────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Update Receivables:                    │
│ Piutang +Rp 300,000                    │
└─────────────────────────────────────────┘
```

### **Partial Payment (DP)**
```
Order: total = Rp 500,000, DP = Rp 200,000, Sisa = Rp 300,000
  │
  ▼
┌─────────────────────────────────────────┐
│ Journal Entry:                         │
│ ┌─────────────────┬─────────────────┐   │
│ │ Debit           │ Credit          │   │
│ │ Kas (1110)      │ Pendapatan      │   │
│ │ Rp 200,000      │ (4100)          │   │
│ │ Piutang (1130)  │ Rp 500,000      │   │
│ │ Rp 300,000      │                 │   │
│ └─────────────────┴─────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Update Accounts:                       │
│ Kas +Rp 200,000                        │
│ Piutang +Rp 300,000                    │
└─────────────────────────────────────────┘
```

---

## 💳 **Penerimaan Pembayaran (Collection)**

### **Pelunasan Piutang**
```
┌─────────────┐
│ User Action │
│ "Catat      │
│ Bayar"      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Input       │
│ - Amount    │
│ - Method    │
│ - Notes     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FUNCTION    │
│ record_payment_receipt()
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Journal Entry:                         │
│ ┌─────────────────┬─────────────────┐   │
│ │ Debit           │ Credit          │   │
│ │ Kas (1110)      │ Piutang (1130)  │   │
│ │ Rp 200,000      │ Rp 200,000      │   │
│ └─────────────────┴─────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Update Accounts:                       │
│ Kas +Rp 200,000                        │
│ Piutang -Rp 200,000                    │
│ Order remaining_payment -Rp 200,000    │
└─────────────────────────────────────────┘
```

---

## 💸 **Pencatatan Pengeluaran**

### **Input Pengeluaran**
```
┌─────────────┐
│ User Action │
│ "Catat      │
│ Pengeluaran"│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Input       │
│ - Category  │
│ - Amount    │
│ - Desc      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FUNCTION    │
│ record_expense()
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Journal Entry:                         │
│ ┌─────────────────┬─────────────────┐   │
│ │ Debit           │ Credit          │   │
│ │ Biaya Gaji      │ Kas (1110)      │   │
│ │ (5210)          │ Rp 5,000,000    │   │
│ │ Rp 5,000,000    │                 │   │
│ └─────────────────┴─────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Update Accounts:                       │
│ Biaya Gaji +Rp 5,000,000               │
│ Kas -Rp 5,000,000                      │
└─────────────────────────────────────────┘
```

---

## 📊 **Monitoring & Dashboard**

### **Real-time Metrics**
```
┌─────────────────────────────────────────────────────────┐
│                 ACCOUNTING DASHBOARD                    │
├─────────────────┬─────────────────┬─────────────────────┤
│ Saldo Kas       │ Penjualan       │ Total Piutang       │
│ Rp 2,500,000    │ Hari Ini        │ Rp 1,200,000        │
│                 │ Rp 1,800,000    │                     │
├─────────────────┼─────────────────┼─────────────────────┤
│ Order Belum     │ Cash Flow       │ Outstanding         │
│ Lunas: 15       │ Net: +Rp 500,000│ Receivables         │
│                 │                 │ Table               │
└─────────────────┴─────────────────┴─────────────────────┘
```

### **Outstanding Receivables Table**
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Order       │ Customer    │ Total       │ DP          │ Sisa        │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ ORD-001     │ John Doe    │ Rp 500,000  │ Rp 200,000  │ Rp 300,000  │
│ ORD-002     │ Jane Smith  │ Rp 300,000  │ Rp 0        │ Rp 300,000  │
│ ORD-003     │ Bob Wilson  │ Rp 400,000  │ Rp 100,000  │ Rp 300,000  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🔧 **Database Schema**

### **Core Tables**
```
┌─────────────────────────────────────────────────────────┐
│                    ORDERS TABLE                        │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ order_id    │ customer    │ total_amount│ payment_type│
│ (UUID)      │ (VARCHAR)   │ (DECIMAL)   │ (VARCHAR)   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ status      │ down_payment│ remaining   │ created_at  │
│ (ENUM)      │ (DECIMAL)   │ (DECIMAL)   │ (TIMESTAMP) │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────────────────────┐
│                JOURNAL_ENTRIES TABLE                   │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ id          │ entry_number│ total_debit │ total_credit│
│ (UUID)      │ (VARCHAR)   │ (DECIMAL)   │ (DECIMAL)   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ reference_id│ reference_type│ status    │ created_at  │
│ (UUID)      │ (VARCHAR)     │ (VARCHAR) │ (TIMESTAMP) │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────────────────────┐
│              JOURNAL_ENTRY_LINES TABLE                 │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ id          │ journal_id  │ account_id  │ debit_amount│
│ (UUID)      │ (UUID)      │ (UUID)      │ (DECIMAL)   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ credit_amount│ description│ created_at  │             │
│ (DECIMAL)   │ (TEXT)      │ (TIMESTAMP) │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **Account Tables**
```
┌─────────────────────────────────────────────────────────┐
│              CHART_OF_ACCOUNTS TABLE                   │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ id          │ account_code│ account_name│ account_type│
│ (UUID)      │ (VARCHAR)   │ (VARCHAR)   │ (VARCHAR)   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ parent_id   │ is_active   │ description │ created_at  │
│ (UUID)      │ (BOOLEAN)   │ (TEXT)      │ (TIMESTAMP) │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────────────────────┐
│                CASH_ACCOUNTS TABLE                     │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ id          │ account_id  │ current_bal │ is_primary  │
│ (UUID)      │ (UUID)      │ (DECIMAL)   │ (BOOLEAN)   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ currency    │ description │ created_at  │ updated_at  │
│ (VARCHAR)   │ (TEXT)      │ (TIMESTAMP) │ (TIMESTAMP) │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **Payment Method Mapping**
```
┌─────────────────────────────────────────────────────────┐
│           PAYMENT_METHOD_ACCOUNTS TABLE                │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ id          │ payment_meth│ debit_acct  │ credit_acct │
│ (UUID)      │ (VARCHAR)   │ (VARCHAR)   │ (VARCHAR)   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ is_active   │ description │ created_at  │ updated_at  │
│ (BOOLEAN)   │ (TEXT)      │ (TIMESTAMP) │ (TIMESTAMP) │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🎯 **Skenario Penggunaan Harian**

### **Pagi (Buka Toko)**
```
1. Cek Saldo Kas
   ┌─────────────────┐
   │ SELECT current_balance FROM cash_accounts WHERE is_primary = true
   │ Result: Rp 2,500,000
   └─────────────────┘

2. Review Piutang Outstanding
   ┌─────────────────┐
   │ SELECT * FROM v_outstanding_receivables
   │ Result: 15 orders, Total: Rp 1,200,000
   └─────────────────┘
```

### **Sepanjang Hari**
```
3. Terima Order (Otomatis)
   Order #001: Cash Rp 100,000
   ┌─────────────────┐
   │ Auto Journal:   │
   │ Debit: Kas (1110) = Rp 100,000
   │ Credit: Pendapatan (4100) = Rp 100,000
   │ Kas Balance: +Rp 100,000
   └─────────────────┘

4. Terima Pelunasan (Manual)
   Order #002: Pelunasan Rp 200,000
   ┌─────────────────┐
   │ Manual Journal: │
   │ Debit: Kas (1110) = Rp 200,000
   │ Credit: Piutang (1130) = Rp 200,000
   │ Kas Balance: +Rp 200,000
   │ Piutang Balance: -Rp 200,000
   └─────────────────┘
```

### **Sore (Tutup Toko)**
```
5. Catat Pengeluaran
   Gaji Karyawan: Rp 5,000,000
   ┌─────────────────┐
   │ Manual Journal: │
   │ Debit: Biaya Gaji (5210) = Rp 5,000,000
   │ Credit: Kas (1110) = Rp 5,000,000
   │ Kas Balance: -Rp 5,000,000
   └─────────────────┘

6. Rekonsiliasi
   ┌─────────────────┐
   │ Kas Sistem: Rp 2,800,000
   │ Kas Fisik: Rp 2,800,000
   │ Status: Balance ✓
   └─────────────────┘
```

---

## ✨ **Keunggulan Sistem**

### **1. Otomatis & Akurat**
```
✅ Jurnal otomatis terbuat saat order selesai
✅ Double-entry accounting compliant
✅ Debit = Credit selalu seimbang
✅ Tidak ada human error
```

### **2. Fleksibel & Scalable**
```
✅ Mapping pembayaran bisa disesuaikan
✅ Support berbagai tipe pembayaran
✅ Mudah tambah akun baru
✅ Modular architecture
```

### **3. User-friendly & Traceable**
```
✅ UI yang mudah digunakan
✅ Dashboard monitoring real-time
✅ Audit trail lengkap
✅ Setiap transaksi terlacak
```

---

## 🎉 **Kesimpulan**

Sistem akuntansi POS Anda adalah **sistem double-entry accounting yang terintegrasi penuh** dengan transaksi penjualan. Setiap transaksi POS otomatis menghasilkan jurnal akuntansi yang seimbang, memberikan akurasi, fleksibilitas, dan kemudahan penggunaan yang optimal.

**Sistem ini memastikan setiap transaksi POS Anda tercatat dengan benar dalam sistem akuntansi yang proper!** 🚀

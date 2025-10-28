# 📊 Studio POS - Sistem Point of Sale untuk Digital Printing
## Dokumentasi Lengkap Program

---

## 📋 Daftar Isi

1. [Overview Program](#overview-program)
2. [Fitur Utama](#fitur-utama)
3. [Arsitektur Sistem](#arsitektur-sistem)
4. [Setup & Instalasi](#setup--instalasi)
5. [Integrasi Akuntansi](#integrasi-akuntansi)
6. [Panduan Penggunaan](#panduan-penggunaan)
7. [API & Services](#api--services)
8. [Database Schema](#database-schema)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 🎯 Overview Program

### Deskripsi
Studio POS adalah sistem Point of Sale (POS) yang dirancang khusus untuk bisnis digital printing. Sistem ini terintegrasi penuh dengan sistem akuntansi double-entry dan mendukung berbagai mode operasi (web, desktop, native).

### Informasi Program
- **Nama**: Studio POS
- **Versi**: 1.0.0
- **Platform**: Web, Desktop (Electron), Native
- **Database**: PostgreSQL, SQLite, Local Storage
- **Framework**: React + TypeScript + Vite
- **Author**: Studio POS Team

### Teknologi yang Digunakan
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase, PostgreSQL
- **Desktop**: Electron
- **Database**: PostgreSQL, SQLite
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Query, Context API

---

## 🚀 Fitur Utama

### 1. Manajemen Order
- ✅ Pembuatan order dengan berbagai tipe pembayaran
- ✅ Kanban board untuk tracking status order
- ✅ Drag & drop interface untuk mengubah status
- ✅ Detail order dengan customer dan produk
- ✅ Support untuk partial payment (DP)

### 2. Manajemen Produk & Inventory
- ✅ Master data produk
- ✅ Kategori produk
- ✅ Stok management
- ✅ Harga dan margin tracking

### 3. Manajemen Customer
- ✅ Database customer
- ✅ History transaksi per customer
- ✅ Piutang tracking

### 4. Sistem Akuntansi Terintegrasi
- ✅ Double-entry accounting
- ✅ Auto-create journal entries
- ✅ Real-time cash balance update
- ✅ Outstanding receivables tracking
- ✅ Expense recording

### 5. Reporting & Analytics
- ✅ Dashboard dengan metrics real-time
- ✅ Sales summary
- ✅ Cash flow analysis
- ✅ Outstanding receivables report

### 6. Multi-Platform Support
- ✅ Web application
- ✅ Desktop application (Electron)
- ✅ Native mode dengan auto-detection

---

## 🏗️ Arsitektur Sistem

### 1. Frontend Layer
```
src/
├── components/          # UI Components
│   ├── kanban/         # Kanban board components
│   ├── accounting/     # Accounting components
│   └── common/         # Shared components
├── pages/              # Page components
├── services/           # API services
├── hooks/              # Custom React hooks
├── context/            # React context
├── types/              # TypeScript types
└── utils/              # Utility functions
```

### 2. Backend Layer
```
supabase/
├── migrations/         # Database migrations
├── functions/          # Edge functions
└── config.toml         # Supabase config

database/
├── sqlite-schema.sql   # SQLite schema
└── supabase-setup.sql  # Supabase setup
```

### 3. Desktop Layer
```
electron/
├── main.js            # Main process
├── preload.js         # Preload script
└── assets/            # Electron assets
```

### 4. Service Layer
- **POSAccountingService**: Integrasi POS-Accounting
- **AccountingService**: Manajemen akuntansi
- **PaymentMethodAccountService**: Mapping pembayaran
- **NativeDatabaseService**: Database detection & setup

---

## ⚙️ Setup & Instalasi

### Prerequisites
- Node.js 18+
- npm atau yarn
- PostgreSQL (opsional)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd studio-pos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan konfigurasi yang sesuai
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

#### Option A: Supabase (Recommended)
1. Buka Supabase Dashboard
2. Buat project baru
3. Jalankan migration:
```sql
-- Copy & paste: scripts/setup-pos-accounting-integration.sql
-- Klik Run
```

#### Option B: Local PostgreSQL
```bash
# Setup local database
npm run setup:db
```

#### Option C: SQLite (Native Mode)
```bash
# Aplikasi akan auto-detect dan setup SQLite
npm run electron:dev
```

### 5. Run Application

#### Development Mode
```bash
# Web mode
npm run dev

# Desktop mode
npm run electron:dev

# Native mode
npm run native:dev
```

#### Production Build
```bash
# Web build
npm run build

# Desktop build
npm run electron:build

# Native build
npm run native:build
```

---

## 💰 Integrasi Akuntansi

### Konsep Dasar
Sistem menggunakan **prinsip double-entry accounting** yang terintegrasi penuh dengan transaksi penjualan. Setiap transaksi POS otomatis menghasilkan jurnal akuntansi yang seimbang (debit = credit).

### Alur Kerja Akuntansi

#### 1. Penjualan Tunai
```
Order (Status: Done) 
    ↓
Trigger: create_journal_entry_on_order_completion
    ↓
Jurnal: Debit Kas (1110), Credit Pendapatan (4100)
    ↓
Update Saldo Kas Real-time
```

#### 2. Penjualan Kredit
```
Order (Status: Done) 
    ↓
Jurnal: Debit Piutang (1130), Credit Pendapatan (4100)
    ↓
Update Piutang Outstanding
```

#### 3. Partial Payment
```
Order (Status: Done) 
    ↓
Jurnal: Debit Kas (1110) + Debit Piutang (1130), Credit Pendapatan (4100)
    ↓
Update Kas + Piutang
```

### Chart of Accounts
```
Assets (1xxx):
├── 1110 - Kas
├── 1120 - Bank
├── 1130 - Piutang Usaha
└── 1140 - Persediaan

Income (4xxx):
└── 4100 - Pendapatan Penjualan

Expenses (5xxx):
├── 5100 - Harga Pokok Penjualan
├── 5210 - Biaya Gaji
├── 5220 - Biaya Sewa
└── 5230 - Biaya Listrik
```

### Database Functions
- `create_journal_entry_from_order()` - Auto-create jurnal dari order
- `record_payment_receipt()` - Catat pelunasan piutang
- `record_expense()` - Catat pengeluaran
- `validate_journal_entry()` - Validasi keseimbangan

---

## 📖 Panduan Penggunaan

### 1. Login & Setup Awal

#### Default Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: admin

#### First Run Setup
1. Aplikasi akan auto-detect database
2. Setup otomatis jika first run
3. Login dengan credentials default

### 2. Manajemen Order

#### Membuat Order Baru
1. Buka halaman "Orderan"
2. Klik "Tambah Order"
3. Isi detail customer dan produk
4. Pilih tipe pembayaran
5. Simpan order

#### Mengubah Status Order
1. Drag & drop order di kanban board
2. Atau klik tombol status di detail order
3. Status "Done" akan trigger jurnal akuntansi

### 3. Manajemen Akuntansi

#### Dashboard Akuntansi
- Saldo kas real-time
- Total penjualan hari ini
- Piutang outstanding
- Cash flow summary

#### Catat Pelunasan Piutang
1. Buka tabel "Outstanding Receivables"
2. Klik "Catat Bayar" untuk order yang dilunasi
3. Input jumlah dan metode pembayaran
4. Simpan

#### Catat Pengeluaran
1. Buka dialog "Record Expense"
2. Pilih kategori biaya
3. Input jumlah dan deskripsi
4. Simpan

### 4. Monitoring & Reporting

#### Dashboard Metrics
- Real-time monitoring saldo kas
- Penjualan harian
- Piutang yang perlu ditagih
- Order status tracking

#### Laporan Akuntansi
- Trial Balance
- Balance Sheet
- Profit & Loss
- Cash Flow Statement

---

## 🔧 API & Services

### POSAccountingService
```typescript
class POSAccountingService {
  // Catat pelunasan piutang
  async recordPaymentReceipt(data: PaymentReceiptData): Promise<ApiResponse>
  
  // Catat pengeluaran
  async recordExpense(data: ExpenseData): Promise<ApiResponse>
  
  // Get journal entries per order
  async getOrderJournalEntries(orderId: string): Promise<ApiResponse>
  
  // Get sales summary
  async getSalesSummary(startDate: string, endDate: string): Promise<ApiResponse>
  
  // Get outstanding receivables
  async getOutstandingReceivables(): Promise<ApiResponse>
  
  // Get cash flow
  async getCashFlow(startDate: string, endDate: string): Promise<ApiResponse>
  
  // Get account balance
  async getAccountBalance(accountCode: string): Promise<ApiResponse>
}
```

### React Hooks
```typescript
// Main accounting hook
const { data, loading, error } = usePOSAccounting();

// Cash balance hook
const { balance, loading } = useCashBalance();

// Total receivables hook
const { total, loading } = useTotalReceivables();

// Accounting metrics hook
const { metrics, loading } = useAccountingMetrics();
```

---

## 🗄️ Database Schema

### Core Tables
```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  total_amount DECIMAL(15,2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chart of accounts
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(10) UNIQUE NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  total_debit DECIMAL(15,2) NOT NULL,
  total_credit DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Journal entry lines
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id),
  account_id UUID REFERENCES chart_of_accounts(id),
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  description TEXT
);
```

### Views
```sql
-- Order journal entries view
CREATE VIEW v_order_journal_entries AS
SELECT o.*, je.*, je.entry_number
FROM orders o
LEFT JOIN journal_entries je ON je.reference_id = o.id;

-- Outstanding receivables view
CREATE VIEW v_outstanding_receivables AS
SELECT o.*, 
       o.total_amount - COALESCE(SUM(p.amount), 0) as remaining_payment,
       CURRENT_DATE - o.created_at::date as days_outstanding
FROM orders o
LEFT JOIN payment_receipts p ON p.order_id = o.id
WHERE o.payment_type = 'credit' 
  AND o.status = 'done'
  AND o.total_amount > COALESCE(SUM(p.amount), 0)
GROUP BY o.id;
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Problem**: Aplikasi tidak bisa connect ke database
**Solution**:
```bash
# Cek koneksi database
npm run setup:db

# Reset database
npm run migrate:full
```

#### 2. Journal Entry Tidak Terbuat Otomatis
**Problem**: Order status "Done" tapi jurnal tidak terbuat
**Solution**:
```sql
-- Cek trigger aktif
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'create_journal_entry_on_order_completion';

-- Jika tidak ada, jalankan setup ulang
-- scripts/setup-pos-accounting-integration.sql
```

#### 3. Saldo Kas Tidak Update
**Problem**: Transaksi tercatat tapi saldo kas tidak berubah
**Solution**:
```sql
-- Update manual saldo kas
UPDATE cash_accounts 
SET current_balance = (
  SELECT SUM(debit_amount - credit_amount) 
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  WHERE jel.account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1110')
  AND je.status = 'posted'
)
WHERE is_primary = true;
```

#### 4. Login Issues
**Problem**: Tidak bisa login dengan credentials default
**Solution**:
```bash
# Clear localStorage
localStorage.clear()

# Restart aplikasi
npm run electron:dev
```

### Error Codes
- **E001**: Database connection failed
- **E002**: Required accounting accounts not found
- **E003**: Journal entry validation failed
- **E004**: Insufficient permissions
- **E005**: Invalid payment method

---

## 🔄 Maintenance

### Daily Tasks
- [ ] Cek saldo kas vs kas fisik
- [ ] Review outstanding receivables
- [ ] Verifikasi transaksi hari ini
- [ ] Backup data harian

### Weekly Tasks
- [ ] Generate trial balance
- [ ] Review expense accounts
- [ ] Backup accounting data
- [ ] Update product prices

### Monthly Tasks
- [ ] Generate profit & loss statement
- [ ] Generate balance sheet
- [ ] Review dan close period
- [ ] Archive old data

### Backup Strategy
```bash
# Database backup
pg_dump studio_pos > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf studio_pos_backup_$(date +%Y%m%d).tar.gz studio-pos/
```

---

## 📞 Support & Contact

### Documentation
- **Main Docs**: `POS_ACCOUNTING_INTEGRATION.md`
- **Quick Start**: `QUICK_START_ACCOUNTING.md`
- **Setup Guide**: `NATIVE_SETUP_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_CHECKLIST.md`

### File Structure
```
studio-pos/
├── src/                    # Source code
├── electron/               # Desktop app
├── database/               # Database schemas
├── scripts/                # Setup scripts
├── supabase/               # Supabase config
├── docs/                   # Documentation
└── build-output/           # Build artifacts
```

### Version History
- **v1.0.0** (2025-01-18): Initial release
  - Auto-create journal entries from orders
  - Support cash, credit, and partial payment
  - Payment receipt recording
  - Expense recording
  - Real-time cash account updates
  - Reporting views

---

## 🎉 Kesimpulan

Studio POS adalah sistem Point of Sale yang lengkap dan terintegrasi dengan sistem akuntansi double-entry. Sistem ini dirancang khusus untuk bisnis digital printing dengan fitur-fitur:

### Keunggulan
- ✅ **Otomatis** - Jurnal otomatis terbuat saat order selesai
- ✅ **Akurat** - Double-entry accounting compliant
- ✅ **Fleksibel** - Support berbagai tipe pembayaran
- ✅ **Traceable** - Audit trail lengkap
- ✅ **User-friendly** - Interface yang mudah digunakan
- ✅ **Scalable** - Mudah dikembangkan

### Target Pengguna
- Bisnis digital printing
- Toko retail dengan sistem akuntansi
- E-commerce dengan integrasi POS
- Usaha yang membutuhkan tracking piutang

### Next Steps
1. Setup database sesuai panduan
2. Test integrasi dengan data sample
3. Training staff untuk penggunaan
4. Deploy ke production environment
5. Monitoring dan maintenance regular

---

**Studio POS - Solusi POS Terintegrasi untuk Bisnis Digital Printing** 🚀

---

*Dokumentasi ini dibuat pada: 18 Januari 2025*  
*Versi: 1.0.0*  
*Author: Studio POS Team*




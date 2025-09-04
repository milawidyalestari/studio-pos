# Migration dari Hardcoded Data ke Transaction Master Table

## Overview
Halaman keuangan telah diupdate untuk menggunakan tabel `transaction_master` yang sudah ada, menggantikan hardcoded data yang sebelumnya ada dalam kode.

## Perubahan yang Dibuat

### 1. Update Interface Transaction
File: `src/lib/database.ts`

**Sebelum:**
```typescript
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
```

**Sesudah:**
```typescript
export interface Transaction {
  id: string;
  transaction_code: string;
  transaction_type: 'income' | 'expense' | 'transfer' | 'adjustment';
  category_id?: string;
  description: string;
  amount: number;
  currency: string;
  payment_method?: string;
  bank_reference?: string;
  transaction_date: string;
  due_date?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recurring: boolean;
  recurring_pattern?: string;
  recurring_end_date?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  created_by?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
```

### 2. Update Database Service
- **SupabaseDatabaseService**: Menggunakan tabel `transaction_master` dengan join ke `categories`
- **LocalDatabaseService**: Menyediakan backward compatibility untuk data lama
- **Soft Delete**: Implementasi soft delete dengan field `deleted_at`

### 3. Update AddTransactionModal
File: `src/components/AddTransactionModal.tsx`

**Field yang Ditambahkan:**
- `transaction_type` (menggantikan `type`)
- `category_id` (menggantikan `category`)
- `transaction_date` (menggantikan `date`)
- `priority` (baru)
- `currency` (baru)
- `recurring` (baru)

### 4. Update Finance Page
File: `src/pages/Finance.tsx`

**Perubahan:**
- Menggunakan `transaction_type` alih-alih `type`
- Menggunakan `transaction_date` alih-alih `date`
- Menggunakan `category_id` alih-alih `category`
- Menambahkan support untuk status `rejected`
- Update chart data generation

### 5. Database Schema
File: `database/transaction_master_setup.sql`

**Tabel yang Dibuat:**
- `transaction_master` dengan semua field yang diperlukan
- Indexes untuk performance
- Triggers untuk `updated_at`
- Sample data untuk testing

## Cara Menggunakan

### 1. Setup Database
Jalankan SQL script untuk membuat tabel:
```bash
psql -d your_database -f database/transaction_master_setup.sql
```

### 2. Restart Aplikasi
Aplikasi akan otomatis mendeteksi tabel baru dan menggunakan struktur data yang baru.

### 3. Data Migration
Data lama akan otomatis di-transform ke format baru dengan backward compatibility.

## Backward Compatibility

Aplikasi masih mendukung data lama dengan:
- Mapping `type` → `transaction_type`
- Mapping `date` → `transaction_date`
- Mapping `category` → `category_id`
- Auto-generation `transaction_code`

## Field Baru yang Tersedia

### Priority Levels
- `low` - Rendah
- `normal` - Normal (default)
- `high` - Tinggi
- `urgent` - Urgent

### Status Baru
- `rejected` - Ditolak

### Currency Support
- `IDR` - Rupiah (default)
- `USD` - Dollar
- `EUR` - Euro

### Recurring Transactions
- Support untuk transaksi berulang
- Pattern dan end date

## Testing

1. **Buat Transaksi Baru**: Test semua field baru
2. **Edit Transaksi**: Pastikan data tersimpan dengan benar
3. **Delete Transaksi**: Test soft delete
4. **Charts**: Pastikan data chart ter-update
5. **Export/Import**: Test dengan data baru

## Troubleshooting

### Error "Missing required fields"
Pastikan field wajib terisi:
- `transaction_type`
- `amount`
- `transaction_date`

### Error "Category not found"
Pastikan `category_id` valid dan ada di tabel `categories`

### Data tidak muncul di chart
Check apakah `transaction_date` format benar dan `status` sesuai

## Next Steps

1. **Audit Trail**: Implementasi logging untuk semua perubahan
2. **Approval Workflow**: Implementasi approval system
3. **Recurring Transactions**: UI untuk mengelola transaksi berulang
4. **Advanced Reporting**: Report berdasarkan priority, currency, dll
5. **Bulk Operations**: Import/export dalam jumlah besar









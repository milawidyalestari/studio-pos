# Database Setup Guide - Studio POS

## Overview

Studio POS mendukung dua tipe database:
- **Local Storage**: Untuk development dan testing
- **Supabase**: Untuk production dan cloud storage

## Quick Start

### 1. Local Development (Default)

Aplikasi akan menggunakan local storage secara default jika tidak ada konfigurasi Supabase.

```bash
# Clone dan install dependencies
git clone <repo-url>
cd studio-pos
npm install

# Run aplikasi
npm run dev
```

### 2. Supabase Setup (Recommended untuk Development)

#### Step 1: Buat Supabase Project

1. Kunjungi [supabase.com](https://supabase.com)
2. Buat akun dan project baru
3. Catat **Project URL** dan **Anon Key**

#### Step 2: Setup Database Schema

1. Buka Supabase Dashboard → SQL Editor
2. Copy dan jalankan script dari `database/supabase-setup.sql`
3. Verifikasi tables berhasil dibuat

#### Step 3: Konfigurasi Environment

Buat file `.env.local` di root project:

```bash
# Supabase Configuration
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Alternative naming (if using Create React App)
REACT_APP_USE_SUPABASE=true
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 4: Restart Development Server

```bash
npm run dev
```

Aplikasi akan secara otomatis menggunakan Supabase dan menampilkan status koneksi.

## Database Architecture

### Tables

#### `transactions`
```sql
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `categories`
```sql
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    color TEXT NOT NULL DEFAULT '#6b7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_transactions_date`: Untuk query berdasarkan tanggal
- `idx_transactions_type`: Untuk filter income/expense
- `idx_transactions_category`: Untuk filter kategori
- `idx_transactions_status`: Untuk filter status
- `idx_categories_type`: Untuk filter kategori berdasarkan tipe

### Row Level Security (RLS)

Database menggunakan RLS dengan policies yang memungkinkan:
- **Public Read**: Semua user dapat membaca data
- **Public Write**: Semua user dapat menambah/edit/hapus data

**Note**: Untuk production, implementasikan authentication dan authorization yang proper.

## Environment Variables

### Vite (Default)
```bash
VITE_USE_SUPABASE=true|false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Create React App (Alternative)
```bash
REACT_APP_USE_SUPABASE=true|false
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Database Service

### Automatic Selection
```typescript
// Database Factory secara otomatis memilih:
// 1. Supabase jika credentials tersedia dan USE_SUPABASE=true
// 2. Local Storage sebagai fallback
export const database = DatabaseFactory.createDatabase();
```

### Usage
```typescript
import { database } from '@/lib/database';

// CRUD Operations
const transactions = await database.getTransactions();
const newTransaction = await database.addTransaction(transactionData);
await database.updateTransaction(id, updates);
await database.deleteTransaction(id);

// Categories
const categories = await database.getCategories();
const newCategory = await database.addCategory(categoryData);

// Summary
const summary = await database.getFinancialSummary();
```

## Sample Data

Database akan secara otomatis diinisialisasi dengan sample data:

### Default Categories
- **Income**: Penjualan, Jasa
- **Expense**: Bahan Baku, Operasional

### Sample Transactions
- 10 sample transactions dengan berbagai tanggal
- Mix income dan expense
- Berbagai status (completed, pending)

## Database Status Monitoring

Aplikasi menyediakan komponen `DatabaseStatus` untuk monitoring:

### Features
- **Connection Status**: Real-time status koneksi
- **Database Type**: Local vs Supabase
- **Data Statistics**: Jumlah transactions dan categories
- **Refresh Button**: Manual refresh status
- **Development Warnings**: Info untuk setup

### Location
DatabaseStatus tersedia di:
- Dashboard tab di halaman Finance
- Settings tab untuk configuration

## Troubleshooting

### Error: "process is not defined"

**Penyebab**: Environment variables tidak terbaca di browser

**Solusi**:
1. Pastikan menggunakan prefix `VITE_` untuk Vite
2. Restart development server setelah mengubah .env
3. Check browser console untuk error details

### Connection Failed

**Penyebab**: 
- Invalid Supabase credentials
- Network connectivity issues
- RLS policies blocking access

**Solusi**:
1. Verifikasi SUPABASE_URL dan SUPABASE_ANON_KEY
2. Check Supabase dashboard untuk project status
3. Verifikasi RLS policies di Supabase
4. Check browser network tab untuk HTTP errors

### Empty Database

**Penyebab**: 
- Database schema belum di-setup
- Sample data initialization failed

**Solusi**:
1. Jalankan SQL setup script di Supabase
2. Check browser console untuk initialization errors
3. Manual refresh DatabaseStatus
4. Clear browser storage dan restart

### Local Storage vs Supabase Switching

**Untuk switch dari Local ke Supabase**:
1. Export data dari Finance page
2. Setup Supabase credentials
3. Restart app
4. Import data if needed

**Untuk switch dari Supabase ke Local**:
1. Set `VITE_USE_SUPABASE=false`
2. Restart app
3. App akan fallback ke local storage

## Production Deployment

### Environment Setup
```bash
# Production .env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Security Considerations
1. **RLS Policies**: Implement proper user-based policies
2. **Authentication**: Add user authentication
3. **API Keys**: Use service role keys untuk admin operations
4. **Data Validation**: Server-side validation
5. **Rate Limiting**: Implement rate limiting
6. **Backup**: Regular database backups

### Performance Optimization
1. **Indexes**: Ensure proper indexes for queries
2. **Connection Pooling**: Configure connection pooling
3. **Caching**: Implement client-side caching
4. **Pagination**: For large datasets
5. **Real-time**: Optimize real-time subscriptions

## Migration Guide

### From Local to Supabase
1. Export all data using Finance export feature
2. Setup Supabase project dan credentials
3. Update environment variables
4. Restart application
5. Import data using Finance import feature
6. Verify data integrity

### Schema Updates
1. Create migration SQL files
2. Test migrations in development
3. Backup production data
4. Apply migrations to production
5. Verify schema updates

## API Reference

### Database Service Interface
```typescript
interface DatabaseService {
  getTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  getCategories(): Promise<Category[]>;
  addCategory(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  getFinancialSummary(): Promise<FinancialSummary>;
  clearAllData(): Promise<void>;
  exportData(): Promise<any>;
  importData(data: any): Promise<void>;
}
```

### Data Types
```typescript
interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at?: string;
}
```

Database setup ini memberikan foundation yang solid untuk development dan production dengan fallback yang aman dan monitoring yang comprehensive.
# Database Integration - Dokumentasi

## Overview

Database integration telah berhasil diimplementasikan dengan dukungan untuk **local storage** dan **Supabase**. Sistem ini memberikan fleksibilitas untuk development dan production dengan fallback otomatis.

## Architecture

### **Database Service Pattern**
```typescript
interface DatabaseService {
  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  addCategory(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Summary methods
  getFinancialSummary(): Promise<FinancialSummary>;
  
  // Utility methods
  clearAllData(): Promise<void>;
  exportData(): Promise<any>;
  importData(data: any): Promise<void>;
}
```

## Database Implementations

### **1. Local Storage Database Service**

#### **Features**
- **Persistent Storage**: Data disimpan di browser localStorage
- **Offline Support**: Bekerja tanpa internet
- **Fast Access**: Akses data instan
- **No Setup**: Tidak memerlukan konfigurasi server

#### **Data Structure**
```typescript
// Local Storage Keys
private readonly TRANSACTIONS_KEY = 'finance_transactions';
private readonly CATEGORIES_KEY = 'finance_categories';

// Default Categories
private getDefaultCategories(): Category[] {
  return [
    { id: '1', name: 'Penjualan', type: 'income', color: '#10b981' },
    { id: '2', name: 'Jasa', type: 'income', color: '#10b981' },
    { id: '3', name: 'Bahan Baku', type: 'expense', color: '#ef4444' },
    { id: '4', name: 'Operasional', type: 'expense', color: '#ef4444' }
  ];
}
```

#### **Methods**
```typescript
// CRUD Operations
async getTransactions(): Promise<Transaction[]>
async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>
async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>
async deleteTransaction(id: string): Promise<void>

// Category Management
async getCategories(): Promise<Category[]>
async addCategory(category: Omit<Category, 'id'>): Promise<Category>
async updateCategory(id: string, category: Partial<Category>): Promise<Category>
async deleteCategory(id: string): Promise<void>

// Data Management
async clearAllData(): Promise<void>
async exportData(): Promise<any>
async importData(data: any): Promise<void>
```

### **2. Supabase Database Service**

#### **Features**
- **Cloud Database**: Data tersimpan di cloud Supabase
- **Real-time Sync**: Sinkronisasi real-time antar device
- **Scalable**: Mendukung data dalam jumlah besar
- **Backup & Recovery**: Data aman dengan backup otomatis

#### **Setup Requirements**
```typescript
// Environment Variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Supabase Client
this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

#### **Database Schema**
```sql
-- Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Methods**
```typescript
// CRUD Operations with Supabase
async getTransactions(): Promise<Transaction[]> {
  const { data, error } = await this.supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const { data, error } = await this.supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

## Database Factory

### **Automatic Selection**
```typescript
export class DatabaseFactory {
  static createDatabase(): DatabaseService {
    const useSupabase = process.env.REACT_APP_USE_SUPABASE === 'true';
    
    if (useSupabase) {
      try {
        return new SupabaseDatabaseService();
      } catch (error) {
        console.warn('Failed to initialize Supabase, falling back to local storage:', error);
        return new LocalDatabaseService();
      }
    }
    
    return new LocalDatabaseService();
  }
}
```

### **Fallback Strategy**
- **Primary**: Supabase (if configured)
- **Fallback**: Local Storage (if Supabase fails)
- **Default**: Local Storage (if not configured)

## Custom Hook: useDatabase

### **State Management**
```typescript
export const useDatabase = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({...});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ... implementation
};
```

### **Methods Provided**
```typescript
return {
  // Data
  transactions,
  categories,
  summary,
  loading,
  error,
  
  // Transaction methods
  addTransaction,
  updateTransaction,
  deleteTransaction,
  
  // Category methods
  addCategory,
  updateCategory,
  deleteCategory,
  
  // Utility methods
  clearAllData,
  exportData,
  importData,
  refreshData
};
```

### **Error Handling**
```typescript
const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
  try {
    setError(null);
    const newTransaction = await database.addTransaction(transaction);
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update summary
    const newSummary = await database.getFinancialSummary();
    setSummary(newSummary);
    
    return newTransaction;
  } catch (err) {
    console.error('Error adding transaction:', err);
    setError(err instanceof Error ? err.message : 'Failed to add transaction');
    throw err;
  }
}, []);
```

## Environment Configuration

### **Local Development (.env.local)**
```bash
# Use local storage for development
REACT_APP_USE_SUPABASE=false
```

### **Production with Supabase (.env.production)**
```bash
# Use Supabase for production
REACT_APP_USE_SUPABASE=true
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### **Environment Variables**
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_USE_SUPABASE` | Enable/disable Supabase | No (default: false) |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | Yes (if Supabase enabled) |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (if Supabase enabled) |

## Data Types

### **Transaction Interface**
```typescript
export interface Transaction {
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
```

### **Category Interface**
```typescript
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at?: string;
}
```

### **Financial Summary Interface**
```typescript
export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingAmount: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
}
```

## UI Integration

### **Loading State**
```typescript
if (loading) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data keuangan...</p>
        </div>
      </div>
    </div>
  );
}
```

### **Error State**
```typescript
if (error) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### **Export Functionality**
```typescript
<Button 
  variant="outline" 
  className="gap-2"
  onClick={async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }}
>
  <Download className="h-4 w-4" />
  Export
</Button>
```

## Data Management Features

### **Export Data**
- **Format**: JSON
- **Content**: Transactions, Categories, Metadata
- **Filename**: `finance-data-YYYY-MM-DD.json`

### **Import Data**
- **File Input**: Hidden file input with JSON filter
- **Validation**: JSON parsing and structure validation
- **Merge Strategy**: Replace existing data with imported data

### **Clear All Data**
- **Confirmation**: User confirmation required
- **Scope**: All transactions and categories
- **Recovery**: No automatic recovery (use import)

## Performance Optimizations

### **Local Storage**
- **Efficient Reads**: Direct localStorage access
- **Batch Writes**: Single localStorage write per operation
- **Error Recovery**: Graceful fallback on storage errors

### **Supabase**
- **Connection Pooling**: Reuse connections
- **Query Optimization**: Indexed queries for performance
- **Caching**: Client-side caching for frequently accessed data

### **State Management**
- **Optimistic Updates**: UI updates immediately, sync later
- **Debounced Saves**: Batch multiple changes
- **Error Recovery**: Retry failed operations

## Security Considerations

### **Local Storage**
- **Data Privacy**: Data stored locally only
- **No Network**: No data transmission
- **Browser Security**: Subject to browser security policies

### **Supabase**
- **Row Level Security**: RLS policies for data access
- **API Keys**: Secure API key management
- **HTTPS**: All communications encrypted
- **Authentication**: User authentication and authorization

## Testing Scenarios

### **Local Storage Testing**
1. **Data Persistence**: Test data survives page refresh
2. **Storage Limits**: Test with large datasets
3. **Error Handling**: Test with corrupted localStorage
4. **Cross-tab Sync**: Test data consistency across tabs

### **Supabase Testing**
1. **Connection**: Test database connectivity
2. **CRUD Operations**: Test all database operations
3. **Error Handling**: Test network failures
4. **Concurrency**: Test simultaneous operations

### **Integration Testing**
1. **Fallback**: Test Supabase → Local Storage fallback
2. **Data Migration**: Test data transfer between storage types
3. **Performance**: Test with large datasets
4. **Error Recovery**: Test error scenarios and recovery

## Migration Strategy

### **Local to Supabase**
1. **Export Data**: Export from local storage
2. **Setup Supabase**: Configure environment variables
3. **Import Data**: Import to Supabase
4. **Verify**: Confirm data integrity

### **Supabase to Local**
1. **Export Data**: Export from Supabase
2. **Disable Supabase**: Set `REACT_APP_USE_SUPABASE=false`
3. **Import Data**: Import to local storage
4. **Verify**: Confirm data integrity

## Future Enhancements

### **Advanced Features**
- **Data Sync**: Real-time sync between devices
- **Offline Mode**: Work offline, sync when online
- **Data Compression**: Compress large datasets
- **Incremental Sync**: Sync only changed data

### **Additional Storage Options**
- **IndexedDB**: For larger datasets
- **SQLite**: Local SQL database
- **Firebase**: Alternative cloud database
- **Custom API**: Custom backend integration

### **Data Analytics**
- **Usage Analytics**: Track database usage
- **Performance Metrics**: Monitor query performance
- **Error Tracking**: Track and analyze errors
- **Data Insights**: Generate insights from data patterns

Database integration ini memberikan solusi yang fleksibel dan robust untuk manajemen data keuangan dengan dukungan untuk berbagai skenario penggunaan. 
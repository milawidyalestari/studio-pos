# Halaman Keuangan - Dokumentasi

## Overview

Halaman Keuangan adalah fitur baru yang memungkinkan pengguna untuk mengelola dan memantau keuangan bisnis secara komprehensif. Halaman ini menyediakan dashboard keuangan, manajemen transaksi, laporan keuangan, dan pengaturan kategori.

## Fitur Utama

### 🏠 **Dashboard**
- **Summary Cards**: Menampilkan ringkasan keuangan utama
- **Recent Transactions**: Daftar transaksi terbaru
- **Monthly Chart**: Grafik bulanan (placeholder untuk integrasi chart library)

### 📊 **Transaksi**
- **Filter & Search**: Pencarian dan filter berdasarkan bulan/tahun
- **Transaction List**: Daftar lengkap semua transaksi
- **Action Buttons**: View, Edit, Delete untuk setiap transaksi

### 📈 **Laporan**
- **Income vs Expense Chart**: Grafik perbandingan pendapatan vs pengeluaran
- **Category Breakdown**: Breakdown berdasarkan kategori

### ⚙️ **Pengaturan**
- **Income Categories**: Manajemen kategori pendapatan
- **Expense Categories**: Manajemen kategori pengeluaran

## Struktur Komponen

### **Interface Definitions**

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
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingAmount: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
}
```

### **State Management**

```typescript
const [activeTab, setActiveTab] = useState('dashboard');
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [summary, setSummary] = useState<FinancialSummary>({...});
const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
const [filterYear, setFilterYear] = useState(new Date().getFullYear());
const [searchTerm, setSearchTerm] = useState('');
```

## Layout & UI Components

### **1. Header Section**
```typescript
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Keuangan</h1>
    <p className="text-gray-600">Kelola keuangan dan laporan keuangan Anda</p>
  </div>
  <div className="flex gap-3">
    <Button variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Export
    </Button>
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Tambah Transaksi
    </Button>
  </div>
</div>
```

### **2. Summary Cards**
- **Total Pendapatan**: Menampilkan total pendapatan dengan icon TrendingUp
- **Total Pengeluaran**: Menampilkan total pengeluaran dengan icon TrendingDown
- **Laba Bersih**: Menampilkan profit/loss dengan warna dinamis
- **Pending**: Menampilkan jumlah transaksi pending

### **3. Tab Navigation**
```typescript
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
  <TabsTrigger value="transactions">Transaksi</TabsTrigger>
  <TabsTrigger value="reports">Laporan</TabsTrigger>
  <TabsTrigger value="settings">Pengaturan</TabsTrigger>
</TabsList>
```

## Tab Contents

### **Dashboard Tab**
- **Recent Transactions**: Scrollable list dengan 5 transaksi terbaru
- **Monthly Chart**: Placeholder untuk grafik bulanan

### **Transactions Tab**
- **Search & Filter**: 
  - Search input dengan icon
  - Month/Year dropdown filters
- **Transaction List**: 
  - Icon berdasarkan tipe (income/expense)
  - Status badges (Selesai, Pending, Dibatalkan)
  - Action buttons (View, Edit, Delete)

### **Reports Tab**
- **Income vs Expense Chart**: Placeholder untuk grafik
- **Category Breakdown**: 
  - Penjualan (green)
  - Bahan Baku (red)
  - Operasional (red)
  - Total dengan separator

### **Settings Tab**
- **Income Categories**: 
  - Penjualan
  - Jasa
  - Add button
- **Expense Categories**:
  - Bahan Baku
  - Operasional
  - Add button

## Sample Data

### **Sample Transactions**
```typescript
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-12-19',
    type: 'income',
    category: 'Penjualan',
    description: 'Spanduk Florist 2 Pass',
    amount: 150000,
    paymentMethod: 'Cash',
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-12-19',
    type: 'income',
    category: 'Penjualan',
    description: 'Spanduk Glossy 280 Gsm',
    amount: 400000,
    paymentMethod: 'Transfer',
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-12-18',
    type: 'expense',
    category: 'Bahan Baku',
    description: 'Kertas A3 80gsm',
    amount: 250000,
    paymentMethod: 'Cash',
    status: 'completed'
  },
  {
    id: '4',
    date: '2024-12-18',
    type: 'expense',
    category: 'Operasional',
    description: 'Biaya Listrik',
    amount: 150000,
    paymentMethod: 'Transfer',
    status: 'completed'
  },
  {
    id: '5',
    date: '2024-12-17',
    type: 'income',
    category: 'Penjualan',
    description: 'Cincin / Mata Ayam',
    amount: 250000,
    paymentMethod: 'Cash',
    status: 'pending'
  }
];
```

### **Calculated Summary**
```typescript
{
  totalIncome: 800000,      // Rp 800.000
  totalExpense: 400000,     // Rp 400.000
  netProfit: 400000,        // Rp 400.000
  pendingAmount: 250000,    // Rp 250.000
  thisMonthIncome: 800000,  // Rp 800.000
  thisMonthExpense: 400000  // Rp 400.000
}
```

## Utility Functions

### **Currency Formatting**
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};
```

### **Date Formatting**
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

### **Status Badge**
```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};
```

### **Type Icon**
```typescript
const getTypeIcon = (type: string) => {
  return type === 'income' ? (
    <TrendingUp className="h-4 w-4 text-green-600" />
  ) : (
    <TrendingDown className="h-4 w-4 text-red-600" />
  );
};
```

## Filtering & Search

### **Transaction Filtering**
```typescript
const filteredTransactions = transactions.filter(transaction => {
  const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
  
  const transactionDate = new Date(transaction.date);
  const matchesMonth = transactionDate.getMonth() === filterMonth;
  const matchesYear = transactionDate.getFullYear() === filterYear;
  
  return matchesSearch && matchesMonth && matchesYear;
});
```

### **Summary Calculation**
```typescript
const calculateSummary = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // ... calculate monthly totals
  
  setSummary({
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    pendingAmount,
    thisMonthIncome,
    thisMonthExpense
  });
};
```

## Responsive Design

### **Grid Layouts**
- **Summary Cards**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Dashboard Content**: `grid-cols-1 lg:grid-cols-2`
- **Reports Content**: `grid-cols-1 lg:grid-cols-2`
- **Settings Content**: `grid-cols-1 md:grid-cols-2`

### **Mobile Responsiveness**
- **Header**: Flex layout dengan responsive buttons
- **Filters**: Stacked layout pada mobile
- **Transaction List**: Scrollable dengan proper spacing
- **Cards**: Responsive grid dengan proper gaps

## Color Scheme

### **Status Colors**
- **Completed**: Green (`text-green-600`, `bg-green-100`)
- **Pending**: Yellow (`text-yellow-600`, `bg-yellow-100`)
- **Cancelled**: Red (`text-red-600`, `bg-red-100`)

### **Type Colors**
- **Income**: Green (`text-green-600`)
- **Expense**: Red (`text-red-600`)

### **UI Colors**
- **Primary**: Blue (`text-blue-700`, `bg-blue-700`)
- **Background**: White (`bg-white`)
- **Borders**: Gray (`border-gray-200`)
- **Text**: Gray scale (`text-gray-900`, `text-gray-600`, `text-gray-500`)

## Icons Used

### **Lucide React Icons**
- `TrendingUp`: Income transactions
- `TrendingDown`: Expense transactions
- `DollarSign`: Finance page icon
- `CreditCard`: Pending amount
- `BarChart3`: Charts and reports
- `Calendar`: Monthly charts
- `Search`: Search functionality
- `Plus`: Add new items
- `Download`: Export functionality
- `Eye`: View transaction
- `Edit`: Edit transaction
- `Trash2`: Delete transaction

## Future Enhancements

### **Chart Integration**
- Integrate with Recharts or Chart.js
- Add monthly trend charts
- Add category pie charts
- Add year-over-year comparisons

### **Export Functionality**
- PDF export for reports
- Excel export for transactions
- Custom date range exports

### **Advanced Features**
- Budget planning
- Cash flow forecasting
- Tax calculations
- Multi-currency support
- Bank reconciliation

### **Data Persistence**
- Database integration
- Real-time updates
- Backup and restore
- Data import/export

## Testing Scenarios

### **UI Testing**
1. **Tab Navigation**: Test switching between tabs
2. **Responsive Design**: Test on different screen sizes
3. **Filter Functionality**: Test search and date filters
4. **Action Buttons**: Test view, edit, delete buttons

### **Data Testing**
1. **Summary Calculations**: Verify correct calculations
2. **Filter Logic**: Test filtering by month/year
3. **Search Logic**: Test search functionality
4. **Status Updates**: Test status badge display

### **Integration Testing**
1. **Route Integration**: Test navigation to finance page
2. **Sidebar Integration**: Test menu item display
3. **Permission Testing**: Test role-based access

## Performance Considerations

### **Optimizations**
- **Memoization**: Use React.memo for components
- **Virtual Scrolling**: For large transaction lists
- **Lazy Loading**: For chart components
- **Debounced Search**: For search input

### **Memory Management**
- **State Cleanup**: Proper cleanup on unmount
- **Event Listeners**: Remove listeners properly
- **Large Lists**: Implement pagination if needed

## Accessibility Features

### **ARIA Labels**
- Proper labels for all interactive elements
- Screen reader friendly navigation
- Keyboard navigation support

### **Color Contrast**
- WCAG compliant color combinations
- High contrast mode support
- Color-blind friendly design

## Security Considerations

### **Data Protection**
- Input validation for all forms
- XSS prevention
- CSRF protection
- Secure data transmission

### **Access Control**
- Role-based access control
- Permission checking
- Audit logging

Halaman Keuangan ini memberikan solusi komprehensif untuk manajemen keuangan bisnis dengan interface yang user-friendly dan fitur yang lengkap. 
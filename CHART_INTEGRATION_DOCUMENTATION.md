# Chart Integration - Dokumentasi

## Overview

Chart integration telah berhasil ditambahkan ke halaman keuangan menggunakan library **Recharts**. Implementasi ini menyediakan visualisasi data keuangan yang interaktif dan informatif.

## Library yang Digunakan

### **Recharts**
- **Version**: Latest
- **Installation**: `npm install recharts`
- **Features**: Responsive, customizable, interactive charts
- **Components**: BarChart, LineChart, PieChart, AreaChart

## Chart Components yang Diimplementasikan

### **1. Line Chart - Grafik Bulanan (Dashboard)**
```typescript
<LineChart data={monthlyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis tickFormatter={(value) => formatCurrency(value)} />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="income" 
    stroke="#10b981" 
    strokeWidth={2}
    name="Pendapatan"
  />
  <Line 
    type="monotone" 
    dataKey="expense" 
    stroke="#ef4444" 
    strokeWidth={2}
    name="Pengeluaran"
  />
  <Line 
    type="monotone" 
    dataKey="profit" 
    stroke="#3b82f6" 
    strokeWidth={2}
    name="Laba Bersih"
  />
</LineChart>
```

**Fitur:**
- **3 Lines**: Pendapatan (hijau), Pengeluaran (merah), Laba Bersih (biru)
- **Responsive**: Menggunakan ResponsiveContainer
- **Custom Tooltip**: Menampilkan nilai dalam format currency
- **Legend**: Menampilkan label untuk setiap line

### **2. Bar Chart - Pendapatan vs Pengeluaran (Reports)**
```typescript
<BarChart data={incomeExpenseData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis tickFormatter={(value) => formatCurrency(value)} />
  <Tooltip content={<CustomTooltip />} />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

**Fitur:**
- **2 Bars**: Pendapatan dan Pengeluaran
- **Color Coding**: Hijau untuk pendapatan, merah untuk pengeluaran
- **Currency Format**: Y-axis menampilkan nilai dalam format IDR

### **3. Pie Chart - Breakdown Kategori (Reports)**
```typescript
<PieChart>
  <Pie
    data={categoryData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    outerRadius={80}
    fill="#8884d8"
    dataKey="value"
  >
    {categoryData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.fill} />
    ))}
  </Pie>
  <Tooltip content={<CustomTooltip />} />
</PieChart>
```

**Fitur:**
- **Dynamic Colors**: Setiap kategori memiliki warna berbeda
- **Percentage Labels**: Menampilkan persentase di setiap slice
- **Interactive**: Hover untuk melihat detail

### **4. Area Chart - Trend Bulanan (Reports)**
```typescript
<AreaChart data={monthlyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis tickFormatter={(value) => formatCurrency(value)} />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  <Area 
    type="monotone" 
    dataKey="income" 
    stackId="1" 
    stroke="#10b981" 
    fill="#10b981" 
    fillOpacity={0.6}
    name="Pendapatan"
  />
  <Area 
    type="monotone" 
    dataKey="expense" 
    stackId="1" 
    stroke="#ef4444" 
    fill="#ef4444" 
    fillOpacity={0.6}
    name="Pengeluaran"
  />
</AreaChart>
```

**Fitur:**
- **Stacked Areas**: Pendapatan dan pengeluaran ditampilkan sebagai area yang tumpang tindih
- **Transparency**: Menggunakan fillOpacity untuk efek visual yang lebih baik
- **Trend Visualization**: Menunjukkan trend bulanan dengan jelas

## Data Generation Functions

### **generateChartData Function**
```typescript
const generateChartData = (transactions: Transaction[]) => {
  // Monthly data for line chart
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  const monthlyChartData = months.map((month, index) => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === index && 
             transactionDate.getFullYear() === new Date().getFullYear();
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      month,
      income,
      expense,
      profit: income - expense
    };
  });
  
  setMonthlyData(monthlyChartData);

  // Category data for pie chart
  const categoryMap = new Map<string, number>();
  transactions
    .filter(t => t.status === 'completed')
    .forEach(t => {
      const key = t.type === 'income' ? `Income-${t.category}` : `Expense-${t.category}`;
      categoryMap.set(key, (categoryMap.get(key) || 0) + t.amount);
    });
  
  const pieChartData = Array.from(categoryMap.entries()).map(([key, value]) => {
    const [type, category] = key.split('-');
    return {
      name: category,
      value,
      type,
      fill: type === 'Income' ? '#10b981' : '#ef4444'
    };
  });
  
  setCategoryData(pieChartData);

  // Income vs Expense data for bar chart
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  setIncomeExpenseData([
    { name: 'Pendapatan', value: totalIncome, fill: '#10b981' },
    { name: 'Pengeluaran', value: totalExpense, fill: '#ef4444' }
  ]);
};
```

## Custom Tooltip Component

### **CustomTooltip Function**
```typescript
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
```

**Fitur:**
- **Custom Styling**: Background putih dengan border dan shadow
- **Currency Format**: Menampilkan nilai dalam format IDR
- **Color Coding**: Menggunakan warna yang sesuai dengan data
- **Responsive**: Menampilkan semua data yang relevan

## Color Scheme

### **Chart Colors**
- **Income/Positive**: `#10b981` (Green)
- **Expense/Negative**: `#ef4444` (Red)
- **Profit/Neutral**: `#3b82f6` (Blue)
- **Default**: `#8884d8` (Purple)

### **Category Colors**
- **Penjualan**: Green
- **Jasa**: Green
- **Bahan Baku**: Red
- **Operasional**: Red

## Sample Data Structure

### **Monthly Data**
```typescript
[
  { month: 'Jan', income: 800000, expense: 400000, profit: 400000 },
  { month: 'Feb', income: 650000, expense: 350000, profit: 300000 },
  // ... 12 months
]
```

### **Category Data**
```typescript
[
  { name: 'Penjualan', value: 1350000, type: 'Income', fill: '#10b981' },
  { name: 'Jasa', value: 850000, type: 'Income', fill: '#10b981' },
  { name: 'Bahan Baku', value: 550000, type: 'Expense', fill: '#ef4444' },
  { name: 'Operasional', value: 350000, type: 'Expense', fill: '#ef4444' }
]
```

### **Income vs Expense Data**
```typescript
[
  { name: 'Pendapatan', value: 2200000, fill: '#10b981' },
  { name: 'Pengeluaran', value: 900000, fill: '#ef4444' }
]
```

## Responsive Design

### **ResponsiveContainer**
```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={monthlyData}>
    // ... chart components
  </LineChart>
</ResponsiveContainer>
```

**Fitur:**
- **Auto-resize**: Chart menyesuaikan dengan container
- **Mobile-friendly**: Responsive pada semua ukuran layar
- **Consistent height**: Menggunakan h-80 (320px) untuk semua chart

## Performance Optimizations

### **Data Processing**
- **Efficient Filtering**: Menggunakan filter dan reduce untuk data processing
- **Memoization**: Data chart di-cache dalam state
- **Lazy Loading**: Chart hanya di-render saat tab aktif

### **Rendering**
- **ResponsiveContainer**: Mengoptimalkan re-render
- **Custom Tooltip**: Hanya di-render saat hover
- **Efficient Updates**: Data chart di-update hanya saat transaksi berubah

## Interactive Features

### **Hover Effects**
- **Custom Tooltip**: Menampilkan detail data saat hover
- **Color Highlighting**: Warna berubah saat hover
- **Smooth Transitions**: Animasi smooth untuk interaksi

### **Legend Interaction**
- **Click to Toggle**: Klik legend untuk show/hide data series
- **Visual Feedback**: Legend menunjukkan status aktif/non-aktif

## Accessibility Features

### **ARIA Support**
- **Screen Reader**: Chart data dapat diakses oleh screen reader
- **Keyboard Navigation**: Navigasi dengan keyboard
- **High Contrast**: Warna yang kontras untuk accessibility

### **Tooltip Accessibility**
- **Descriptive Text**: Tooltip menampilkan informasi yang jelas
- **Color Independent**: Informasi tidak bergantung pada warna saja

## Future Enhancements

### **Advanced Chart Features**
- **Zoom & Pan**: Kemampuan zoom dan pan pada chart
- **Data Export**: Export chart sebagai gambar
- **Real-time Updates**: Live updates untuk data real-time
- **Animation**: Smooth animations untuk data changes

### **Additional Chart Types**
- **Candlestick Chart**: Untuk analisis trend yang lebih detail
- **Scatter Plot**: Untuk korelasi antara variabel
- **Heatmap**: Untuk visualisasi data yang kompleks
- **Gauge Chart**: Untuk target vs actual

### **Interactive Features**
- **Drill-down**: Klik chart untuk melihat detail lebih lanjut
- **Date Range Picker**: Filter chart berdasarkan rentang tanggal
- **Comparison Mode**: Bandingkan data antar periode
- **Custom Filters**: Filter berdasarkan kategori atau status

## Testing Scenarios

### **Chart Rendering**
1. **Data Loading**: Test chart rendering dengan data kosong
2. **Large Datasets**: Test performance dengan data besar
3. **Responsive Behavior**: Test pada berbagai ukuran layar
4. **Color Accuracy**: Test warna chart sesuai dengan data

### **Interactivity**
1. **Tooltip Display**: Test tooltip saat hover
2. **Legend Interaction**: Test klik legend untuk toggle data
3. **Data Updates**: Test chart update saat data berubah
4. **Animation Smoothness**: Test animasi chart

### **Accessibility**
1. **Screen Reader**: Test dengan screen reader
2. **Keyboard Navigation**: Test navigasi dengan keyboard
3. **Color Blindness**: Test dengan color blind simulator
4. **High Contrast**: Test pada mode high contrast

## Integration Points

### **Data Flow**
- **Transaction Data**: Data transaksi → Chart data generation
- **State Management**: Chart data disimpan dalam React state
- **Real-time Updates**: Chart update otomatis saat data berubah

### **Component Integration**
- **Dashboard Tab**: Line chart untuk trend bulanan
- **Reports Tab**: Multiple charts untuk analisis mendalam
- **Responsive Layout**: Chart menyesuaikan dengan layout

Chart integration ini memberikan visualisasi data keuangan yang powerful dan interaktif, membantu pengguna memahami tren dan pola keuangan dengan lebih baik. 
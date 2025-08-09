import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  BarChart3,
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useDatabase } from '@/hooks/useDatabase';
import { Transaction, Category, FinancialSummary } from '@/lib/database';
import ExportDialog from '@/components/ExportDialog';
import QuickExport from '@/components/QuickExport';
import { useHasAccess } from '@/context/RoleAccessContext';
import ExportAnalytics from '@/components/ExportAnalytics';


const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const hasAccess = useHasAccess();
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  // Database hook
  const {
    transactions,
    categories,
    summary,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    clearAllData,
    exportData,
    importData,
    refreshData
  } = useDatabase();

  // Chart data
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Update chart data when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      generateChartData(transactions);
    }
  }, [transactions]);



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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const getTypeIcon = (type: string) => {
    return type === 'income' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const transactionDate = new Date(transaction.date);
    const matchesMonth = transactionDate.getMonth() === filterMonth;
    const matchesYear = transactionDate.getFullYear() === filterYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Custom tooltip for charts
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

  // Check access first
  if (!hasAccess('Finance', 'view_finance')) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman keuangan.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
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

  // Error state
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keuangan</h1>
          <p className="text-gray-600">Kelola keuangan dan laporan keuangan Anda</p>
        </div>
        <div className="flex gap-3">
          {hasAccess('Finance', 'financial_reports') && (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {hasAccess('Finance', 'manage_expenses') && (
            <Button className="gap-2 bg-blue-700">
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-gray-600">
              +{formatCurrency(summary.thisMonthIncome)} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpense)}
            </div>
            <p className="text-xs text-gray-600">
              +{formatCurrency(summary.thisMonthExpense)} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netProfit)}
            </div>
            <p className="text-xs text-gray-600">
              {summary.netProfit >= 0 ? 'Profit' : 'Rugi'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingAmount)}
            </div>
            <p className="text-xs text-gray-600">
              Menunggu pembayaran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transaksi Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-600">{transaction.category}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

                         {/* Monthly Chart */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Calendar className="h-5 w-5" />
                   Grafik Bulanan
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-80" data-chart-export>
                   <ResponsiveContainer width="100%" height="100%">
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
                   </ResponsiveContainer>
                 </div>
               </CardContent>
                          </Card>
           </div>

           {/* Export Analytics */}
           <ExportAnalytics className="mt-6" />
         </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Cari Transaksi</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Cari berdasarkan deskripsi atau kategori..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="month">Bulan</Label>
                    <Select value={filterMonth.toString()} onValueChange={(value) => setFilterMonth(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Tahun</Label>
                    <Select value={filterYear.toString()} onValueChange={(value) => setFilterYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Transaksi</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada transaksi ditemukan</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.category}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.paymentMethod}</p>
                        </div>
                        {getStatusBadge(transaction.status)}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

                 {/* Reports Tab */}
         <TabsContent value="reports" className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Income vs Expense Chart */}
             <Card>
               <CardHeader>
                 <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={incomeExpenseData}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" />
                       <YAxis tickFormatter={(value) => formatCurrency(value)} />
                       <Tooltip content={<CustomTooltip />} />
                       <Bar dataKey="value" fill="#8884d8" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>

             {/* Category Breakdown */}
             <Card>
               <CardHeader>
                 <CardTitle>Breakdown Kategori</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
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
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
           </div>

           {/* Additional Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Monthly Trend */}
             <Card>
               <CardHeader>
                 <CardTitle>Trend Bulanan</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
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
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>

             {/* Category List */}
             <Card>
               <CardHeader>
                 <CardTitle>Detail Kategori</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {categoryData.map((item, index) => (
                     <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                       <div className="flex items-center gap-3">
                         <div 
                           className="w-4 h-4 rounded-full" 
                           style={{ backgroundColor: item.fill }}
                         />
                         <span className="font-medium">{item.name}</span>
                       </div>
                       <span className="font-semibold">{formatCurrency(item.value)}</span>
                     </div>
                   ))}
                   <Separator />
                   <div className="flex justify-between items-center font-bold">
                     <span>Total</span>
                     <span className={summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                       {formatCurrency(summary.netProfit)}
                     </span>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Quick Export */}
             <QuickExport
               data={{
                 transactions,
                 categories,
                 summary,
                 metadata: {
                   exportedAt: new Date().toISOString(),
                   exportedBy: 'System User',
                   totalTransactions: transactions.length
                 }
               }}
             />


           </div>
         </TabsContent>

                 {/* Settings Tab */}
         <TabsContent value="settings" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Pengaturan Keuangan</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <h3 className="font-semibold">Kategori Pendapatan</h3>
                   <div className="space-y-2">
                     {categories
                       .filter(cat => cat.type === 'income')
                       .map((category) => (
                         <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                           <div className="flex items-center gap-2">
                             <div 
                               className="w-4 h-4 rounded-full" 
                               style={{ backgroundColor: category.color }}
                             />
                             <span>{category.name}</span>
                           </div>
                           <div className="flex gap-2">
                             <Button variant="ghost" size="sm">Edit</Button>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="text-red-600"
                               onClick={() => deleteCategory(category.id)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       ))}
                     <Button variant="outline" size="sm" className="w-full">
                       <Plus className="h-4 w-4 mr-2" />
                       Tambah Kategori
                     </Button>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h3 className="font-semibold">Kategori Pengeluaran</h3>
                   <div className="space-y-2">
                     {categories
                       .filter(cat => cat.type === 'expense')
                       .map((category) => (
                         <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                           <div className="flex items-center gap-2">
                             <div 
                               className="w-4 h-4 rounded-full" 
                               style={{ backgroundColor: category.color }}
                             />
                             <span>{category.name}</span>
                           </div>
                           <div className="flex gap-2">
                             <Button variant="ghost" size="sm">Edit</Button>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="text-red-600"
                               onClick={() => deleteCategory(category.id)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       ))}
                     <Button variant="outline" size="sm" className="w-full">
                       <Plus className="h-4 w-4 mr-2" />
                       Tambah Kategori
                     </Button>
                   </div>
                 </div>
               </div>


             </CardContent>
           </Card>
         </TabsContent>
              </Tabs>

        {/* Export Dialog */}
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          data={{
            transactions,
            categories,
            summary,
            metadata: {
              exportedAt: new Date().toISOString(),
              exportedBy: 'System User',
              totalTransactions: transactions.length
            }
          }}
          categories={categories}
        />
      </div>
    );
  };

export default Finance; 
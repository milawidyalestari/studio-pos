import React, { useState, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  FileText,
  Calendar,
  Eye,
  Download,
  Filter,
  Plus,
  Minus,
  XCircle,
  CheckCircle,
  LoaderCircle,
  Clock,
  Check,
  Printer,
  CreditCard,
  Users,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHasAccess } from '@/context/RoleAccessContext';
import { useTransactionMaster } from '@/hooks/useTransactionMaster';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency } from '@/utils/formatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Finance = () => {
  const hasAccess = useHasAccess();
  const { transactions = [], isLoading, error, refetch, createTransaction } = useTransactionMaster({ 
    enableAutoRefresh: false, // Disable auto refresh to prevent excessive fetching
    refreshInterval: 60000 // Set to 1 minute if needed
  });
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('today');
  
  // State untuk modal input catatan kas
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashTransactionType, setCashTransactionType] = useState<'income' | 'expense'>('income');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashFormData, setCashFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Debug categories
  console.log('Categories from database:', categories);
  console.log('Categories loading:', categoriesLoading);
  console.log('Categories error:', categoriesError);

  // Data untuk dashboard dari database - menggunakan useMemo untuk optimasi
  const salesData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Group transactions by date for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(date => {
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transaction_date || '').toISOString().split('T')[0];
        return transactionDate === date;
      });
      
      const revenue = dayTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      const expenses = dayTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      const profit = revenue - expenses;
      
      return {
        date,
        revenue,
        expenses,
        profit,
        transactions: dayTransactions.length
      };
    });
  }, [transactions]);

  const categorySales = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Group transactions by category
    const categoryMap = new Map();
    
    transactions.forEach(transaction => {
      if (transaction.transaction_type === 'income') {
        const categoryName = transaction.categories?.category_name || 'Lainnya';
        const existing = categoryMap.get(categoryName) || { sales: 0, transactions: 0 };
        
        existing.sales += transaction.amount || 0;
        existing.transactions += 1;
        categoryMap.set(categoryName, existing);
      }
    });
    
    // Convert to array and calculate percentages
    const totalSales = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.sales, 0);
    
    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        sales: data.sales,
        percentage: totalSales > 0 ? Math.round((data.sales / totalSales) * 100) : 0,
        transactions: data.transactions
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6); // Top 6 categories
  }, [transactions]);

  // Transaksi terbaru dari database
  const recentTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Get latest transactions
    const latestTransactions = transactions
      .sort((a, b) => {
        const dateA = new Date(a.transaction_date || '');
        const dateB = new Date(b.transaction_date || '');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10) // Get latest 10 transactions
      .map(transaction => {
        return {
          id: transaction.transaction_code,
          date: transaction.transaction_date,
          customer: transaction.description,
          item: transaction.categories?.category_name || 'Lainnya',
          amount: transaction.amount,
          type: transaction.transaction_type,
          status: transaction.status,
          transactionId: transaction.id
        };
      });
    
    return latestTransactions;
  }, [transactions]);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  }, []);

  // Fungsi untuk handle input form
  const handleCashFormChange = useCallback((field: string, value: string) => {
    setCashFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Fungsi untuk tutup modal dengan animasi
  const closeCashModal = useCallback(() => {
    setIsModalVisible(false);
    // Tunggu animasi fade out selesai sebelum hide modal
    setTimeout(() => {
      setShowCashModal(false);
      resetCashForm();
    }, 300); // Increased duration for smoother animation
  }, []);

  // Fungsi untuk reset form
  const resetCashForm = useCallback(() => {
    setCashFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }, []);

  // Fungsi untuk handle submit form
  const handleCashFormSubmit = useCallback(async () => {
    // Validasi form
    if (!cashFormData.amount || !cashFormData.description) {
      alert('Mohon lengkapi jumlah dan deskripsi');
      return;
    }

    // Validasi kategori jika tersedia
    if (categories.length > 0 && !cashFormData.category) {
      alert('Mohon pilih kategori transaksi');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    try {
      setIsSubmitting(true);
      
      // Proses data transaksi kas
      const transactionData = {
        transaction_type: cashTransactionType,
        description: cashFormData.description,
        amount: parseFloat(cashFormData.amount),
        transaction_date: cashFormData.date,
        notes: cashFormData.notes || '',
        status: 'completed' as const,
        priority: 'normal' as const,
        currency: 'IDR',
        payment_method: 'cash',
        category_id: cashFormData.category || null // Use selected category or null
      };

      console.log('Data transaksi kas:', transactionData);
      
      // Save to database using the hook
      const result = await createTransaction(transactionData);
      
      if (result) {
        console.log('Transaction saved successfully:', result);
        // Tutup modal dengan animasi
        closeCashModal();
        // No need to refetch since we're using optimistic updates
      } else {
        alert('Gagal menyimpan transaksi. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [cashFormData, cashTransactionType, createTransaction, closeCashModal, isSubmitting]);

  // Fungsi untuk buka modal
  const openCashModal = useCallback((type: 'income' | 'expense') => {
    setCashTransactionType(type);
    setShowCashModal(true);
    // Trigger animasi fade in
    setTimeout(() => setIsModalVisible(true), 10);
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Loading state dengan skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="animate-pulse">
              <div className="flex space-x-4 mb-6">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state dengan retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-semibold">Error memuat data keuangan</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="mt-3 flex gap-2">
                <Button 
                  onClick={() => refetch()} 
                  variant="outline"
                  size="sm"
                >
                  <LoaderCircle className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  size="sm"
                >
                  Refresh Halaman
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const DashboardTab = () => {
    const todayRevenue = salesData[salesData.length - 1]?.revenue || 0;
    const todayTransactions = salesData[salesData.length - 1]?.transactions || 0;
    const todayProfit = salesData[salesData.length - 1]?.profit || 0;
    const totalRevenue = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendapatan Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    +12% dari kemarin
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pesanan Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(todayTransactions)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    +8% dari kemarin
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profit Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayProfit)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    +15% dari kemarin
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    Semua waktu
                  </p>
                </div>
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Pendapatan 7 Hari</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                      })
                    }
                  />
                  <YAxis tickFormatter={(value) => `${value / 1000000}Jt`} />
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      formatCurrency(value), 
                      props.dataKey === 'revenue' ? 'Pendapatan' : 'Profit'
                    ]} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Pendapatan"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Product Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Penjualan per Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    outerRadius={125}
                    fill="#8884d8"
                    dataKey="sales"
                    label={({ percentage, index }) => {
                      // Hanya tampilkan label untuk 3 kategori terbesar (index 0, 1, 2)
                      return index < 3 ? `${percentage}%` : '';
                    }}
                    labelLine={false}
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{data.category}</p>
                            <p className="text-sm text-gray-600">Penjualan: {formatCurrency(data.sales)}</p>
                            <p className="text-sm text-gray-600">Persentase: {data.percentage}%</p>
                            <p className="text-sm text-gray-600">Jumlah Transaksi: {data.transactions}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    formatter={(value, entry, index) => {
                      const data = categorySales[index];
                      return data ? `${data.category} (${data.percentage}%)` : value;
                    }}
                    wrapperStyle={{ fontSize: '11px' }}
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 text-gray-600">Tanggal</th>
                    <th className="text-left py-3 px-4 text-gray-600">Customer/Vendor</th>
                    <th className="text-left py-3 px-4 text-gray-600">Item</th>
                    <th className="text-right py-3 px-4 text-gray-600">Jumlah</th>
                    <th className="text-center py-3 px-4 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{tx.id}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(tx.date).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">{tx.customer}</td>
                      <td className="py-3 px-4 text-gray-600">{tx.item}</td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(Math.abs(tx.amount))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : tx.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tx.status === 'completed' ? 'Selesai' : 
                           tx.status === 'pending' ? 'Pending' :
                           tx.status === 'cancelled' ? 'Dibatalkan' : 'Ditolak'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const CashFlowTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Arus Kas</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => openCashModal('income')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Pemasukan
          </Button>
          <Button 
            variant="destructive"
            onClick={() => openCashModal('expense')}
          >
            <Minus className="w-4 h-4 mr-2" />
            Pengeluaran
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catatan Kas Hari Ini</CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600">Saldo Saat Ini</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(5000000)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></span>
                    <p className="font-medium text-gray-800">{tx.item}</p>
                  </div>
                  <p className="text-sm text-gray-600">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income'
                      ? `+${formatCurrency(tx.amount)}`
                      : formatCurrency(tx.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{tx.customer}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Laporan Keuangan</h2>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(24700000)}
                </div>
                <div className="text-xs text-gray-600">Total Penjualan</div>
                <div className="text-xs text-gray-500">127 Transaksi</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(7400000)}
                </div>
                <div className="text-xs text-gray-600">Total Pengeluaran</div>
                <div className="text-xs text-gray-500">45 Transaksi</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(17300000)}
                </div>
                <div className="text-xs text-gray-600">Laba Bersih</div>
                <div className="text-xs text-gray-500">Margin 70%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Product */}
        <Card>
          <CardHeader>
            <CardTitle>Analisis Penjualan per Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySales.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-800">{category.category}</p>
                      <p className="text-sm text-gray-600">{category.transactions} transaksi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {formatCurrency(category.sales)}
                    </p>
                    <p className="text-sm text-gray-600">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  }
                />
                <YAxis tickFormatter={(value) => `${value / 1000000}Jt`} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Pendapatan" />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Modal Input Catatan Kas */}
      {showCashModal && (
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-50 p-4 flex items-center justify-center ${
            isModalVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCashModal();
            }
          }}
        >
          <div 
            className={`bg-white rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out transform ${
              isModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {cashTransactionType === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                </h3>
                <button
                  onClick={closeCashModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Modal */}
            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* Jumlah */}
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Jumlah (IDR) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={cashFormData.amount}
                    onChange={(e) => handleCashFormChange('amount', e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Deskripsi *
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Contoh: Penjualan spanduk, Pembelian bahan baku"
                    value={cashFormData.description}
                    onChange={(e) => handleCashFormChange('description', e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Kategori */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Kategori *
                  </Label>
                  <Select
                    value={cashFormData.category}
                    onValueChange={(value) => handleCashFormChange('category', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="" disabled>Loading categories...</SelectItem>
                      ) : categoriesError ? (
                        <SelectItem value="" disabled>Error loading categories</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="" disabled>No categories available</SelectItem>
                      ) : (
                        <>
                          {cashTransactionType === 'income' ? (
                            categories
                              .filter(cat => cat.group_name === 'income')
                              .map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.category_name}
                                </SelectItem>
                              ))
                          ) : (
                            categories
                              .filter(cat => cat.group_name === 'expense')
                              .map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.category_name}
                                </SelectItem>
                              ))
                          )}
                          {categories.filter(cat => 
                            cashTransactionType === 'income' ? cat.group_name === 'income' : cat.group_name === 'expense'
                          ).length === 0 && (
                            <SelectItem value="" disabled>
                              No {cashTransactionType} categories found
                            </SelectItem>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tanggal */}
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Tanggal
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={cashFormData.date}
                    onChange={(e) => handleCashFormChange('date', e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Catatan */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Catatan Tambahan
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan detail jika diperlukan..."
                    value={cashFormData.notes}
                    onChange={(e) => handleCashFormChange('notes', e.target.value)}
                    className="mt-1"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={closeCashModal}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                className={cashTransactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                onClick={handleCashFormSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Keuangan</h1>
              <p className="text-gray-600">POS Percetakan Spanduk & Digital</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
              { id: 'cashflow', label: 'Arus Kas', icon: TrendingUp },
              { id: 'reports', label: 'Laporan', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'cashflow' && <CashFlowTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
};

export default Finance;
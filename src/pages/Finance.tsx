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
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHasAccess } from '@/context/RoleAccessContext';
import { useTransactionMaster } from '@/hooks/useTransactionMaster';
import { useCategories } from '@/hooks/useCategories';
import { useOrderAnalytics } from '@/hooks/useOrderAnalytics';
import { formatCurrency } from '@/utils/formatters';
import { ProductRevenueChart } from '@/components/charts/ProductRevenueChart';
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
} from 'recharts';


const Finance = () => {
  const hasAccess = useHasAccess();
  const { transactions = [], isLoading, error, refetch, createTransaction } = useTransactionMaster({ 
    enableAutoRefresh: false, // Disable auto refresh to prevent excessive fetching
    refreshInterval: 60000 // Set to 1 minute if needed
  });
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { analytics: orderAnalytics, isLoading: orderAnalyticsLoading, error: orderAnalyticsError } = useOrderAnalytics();
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

  // Fungsi untuk mendapatkan data berdasarkan filter tanggal
  const getFilteredData = useCallback(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0,
        salesTransactions: 0,
        expenseTransactions: 0,
        filteredCategorySales: []
      };
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        startDate = new Date(0); // All time
        endDate = new Date();
    }

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date || '');
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const salesTransactions = filteredTransactions.filter(t => t.transaction_type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.transaction_type === 'expense');

    const totalSales = salesTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    const netProfit = totalSales - totalExpenses;

    return {
      totalSales,
      totalExpenses,
      netProfit,
      salesTransactions: salesTransactions.length,
      expenseTransactions: expenseTransactions.length
    };
  }, [transactions, dateRange]);

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

    // Format number helper
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('id-ID').format(num);
    };

    // Debug logging
    console.log('DashboardTab - Order Analytics:', orderAnalytics);
    console.log('DashboardTab - Order Analytics Loading:', orderAnalyticsLoading);
    console.log('DashboardTab - Order Analytics Error:', orderAnalyticsError);

    // Show loading state if order analytics is loading
    if (orderAnalyticsLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg text-gray-600">Memuat data orderan...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Omzet Harian</p>
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
                  <p className="text-sm text-gray-600 mb-1">Orderan Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(orderAnalytics.todayOrders)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    {formatCurrency(orderAnalytics.todayRevenue)} omzet
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
                  <p className="text-sm text-gray-600 mb-1">Total Orderan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(orderAnalytics.totalOrders)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    {formatCurrency(orderAnalytics.totalRevenue)} total
                  </p>
                </div>
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(orderAnalytics.completedOrders)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    {orderAnalytics.totalOrders > 0 ? Math.round((orderAnalytics.completedOrders / orderAnalytics.totalOrders) * 100) : 0}% dari total
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Revenue Trend */}
          <ProductRevenueChart data={orderAnalytics.dailyProductData} />
          
          {/* Revenue vs Expenses Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan vs Pengeluaran 7 Hari</CardTitle>
              {transactions.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Belum ada data transaksi untuk ditampilkan</p>
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={(() => {
                  // Generate last 7 days data
                  const last7Days = [];
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Calculate revenue and expenses for this date
                    const dayTransactions = transactions.filter(t => t.transaction_date === dateStr);
                    const revenue = dayTransactions
                      .filter(t => t.transaction_type === 'income' && t.status === 'completed')
                      .reduce((sum, t) => sum + Number(t.amount), 0);
                    const expenses = dayTransactions
                      .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
                      .reduce((sum, t) => sum + Number(t.amount), 0);
                    
                    last7Days.push({
                      date: dateStr,
                      revenue,
                      expenses
                    });
                  }
                  return last7Days;
                })()}>
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
                  <YAxis yAxisId="left" orientation="left" />
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => {
                      return [formatCurrency(value), name === 'revenue' ? 'Pendapatan' : 'Pengeluaran'];
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('id-ID')}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Pendapatan"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Pengeluaran"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>


        {/* Order Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Daily Order Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Orderan 7 Hari</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderAnalytics.dailyRevenueData}>
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
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => {
                      if (props.dataKey === 'revenue') {
                        return [formatCurrency(value), 'Omzet'];
                      }
                      return [value, 'Jumlah Order'];
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('id-ID')}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Omzet" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} name="Jumlah Order" />
                </BarChart>
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

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Orderan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600">No. Order</th>
                    <th className="text-left py-3 px-4 text-gray-600">Tanggal</th>
                    <th className="text-left py-3 px-4 text-gray-600">Customer</th>
                    <th className="text-right py-3 px-4 text-gray-600">Total</th>
                    <th className="text-center py-3 px-4 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderAnalytics.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{order.order_number}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">{order.customer_name}</td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status.toLowerCase().includes('selesai') || order.status.toLowerCase().includes('completed')
                              ? 'bg-green-100 text-green-800'
                              : order.status.toLowerCase().includes('pending') || order.status.toLowerCase().includes('proses')
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status.toLowerCase().includes('cancel')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
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

  const ReportsTab = () => {
    const filteredData = getFilteredData();
    const marginPercentage = filteredData.totalSales > 0 ? Math.round((filteredData.netProfit / filteredData.totalSales) * 100) : 0;

    const getDateRangeLabel = () => {
      switch (dateRange) {
        case 'today': return 'Hari Ini';
        case 'week': return 'Minggu Ini';
        case 'month': return 'Bulan Ini';
        case 'year': return 'Tahun Ini';
        default: return 'Semua Waktu';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Laporan Keuangan</h2>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between min-w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  {getDateRangeLabel()}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      dateRange === 'today' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={() => setDateRange('today')}
                  >
                    Hari Ini
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      dateRange === 'week' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={() => setDateRange('week')}
                  >
                    Minggu Ini
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      dateRange === 'month' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={() => setDateRange('month')}
                  >
                    Bulan Ini
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      dateRange === 'year' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={() => setDateRange('year')}
                  >
                    Tahun Ini
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
                    {formatCurrency(filteredData.totalSales)}
                  </div>
                  <div className="text-xs text-gray-600">Total Penjualan</div>
                  <div className="text-xs text-gray-500">{filteredData.salesTransactions} Transaksi</div>
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
                    {formatCurrency(filteredData.totalExpenses)}
                  </div>
                  <div className="text-xs text-gray-600">Total Pengeluaran</div>
                  <div className="text-xs text-gray-500">{filteredData.expenseTransactions} Transaksi</div>
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
                    {formatCurrency(filteredData.netProfit)}
                  </div>
                  <div className="text-xs text-gray-600">Laba Bersih</div>
                  <div className="text-xs text-gray-500">Margin {marginPercentage}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
  };

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
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : categoriesError ? (
                        <SelectItem value="error" disabled>Error loading categories</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>No categories available</SelectItem>
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
                            <SelectItem value="no-matching-categories" disabled>
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
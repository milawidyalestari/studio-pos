import React, { useState, useEffect, useMemo } from 'react';
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
  XCircle,
  RefreshCw,
  Printer
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
import { useOrders } from '@/hooks/useOrders';
import { AddTransactionModal } from '@/components/AddTransactionModal';


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
    orders,
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
    refreshData,
    refreshOrders
  } = useDatabase();

  // Remove the separate useOrders hook since we now have orders in useDatabase
  // const { orders } = useOrders({ enableAutoRefresh: false });

  // Enhanced refresh function
  const handleEnhancedRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshMessage('Refreshing financial data...');
      
      // Refresh all data
      await Promise.all([
        refreshData(),
        refreshOrders()
      ]);
      
      setLastUpdated(new Date());
      setRefreshMessage('Data refreshed successfully!');
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setRefreshMessage('');
      }, 2000);
      
    } catch (error) {
      setRefreshMessage('Failed to refresh data. Please try again.');
      console.error('Refresh error:', error);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setRefreshMessage('');
      }, 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Chart data
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Add transaction modal state
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Enhanced refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Validate orders data structure
  const validOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return orders.filter(orderData => {
      return orderData && 
             typeof orderData === 'object' && 
             orderData.order && 
             typeof orderData.order === 'object' && 
             orderData.order.id &&
             orderData.items &&
             Array.isArray(orderData.items);
    });
  }, [orders]);

  // Update chart data when transactions or orders change
  useEffect(() => {
    // Only generate chart data when we have both transactions and validated orders loaded
    // This prevents the function from running with incomplete data
    if (transactions && validOrders && (transactions.length > 0 || validOrders.length > 0)) {
      generateChartData(transactions);
    }
  }, [transactions, orders, validOrders]);

  // Auto-refresh financial data when transactions change
  useEffect(() => {
    // This will trigger a recalculation of financialAnalysisData
    // since it depends on the summary which is updated when transactions change
  }, [summary]);

  // Auto-refresh data when tab changes to ensure fresh data
  useEffect(() => {
    if (activeTab) {
      refreshData();
      setLastUpdated(new Date());
    }
  }, [activeTab, refreshData]);

  // Calculate financial analysis data from database transactions and orders
  const calculateFinancialData = () => {
    if (!summary) {
      return [
        { category: 'Pendapatan', amount: '0', percentage: '0%', type: 'income' },
        { category: 'Pengeluaran', amount: '0', percentage: '0%', type: 'expense' },
        { category: 'Laba Bersih', amount: '0', percentage: '0%', type: 'profit' },
        { category: 'Pending', amount: '0', percentage: '0%', type: 'pending' },
        { category: 'Total Penjualan', amount: '0', percentage: '0%', type: 'sales' },
        { category: 'Total Order', amount: '0', percentage: '0%', type: 'orders' },
      ];
    }

    // Helper function to safely format numbers
    const safeFormatNumber = (value: number | undefined | null, defaultValue: number = 0) => {
      const numValue = Number(value) || defaultValue;
      return isNaN(numValue) ? '0' : numValue.toLocaleString('id-ID');
    };

    // Helper function to safely get number value
    const safeGetNumber = (value: number | undefined | null, defaultValue: number = 0) => {
      const numValue = Number(value) || defaultValue;
      return isNaN(numValue) ? defaultValue : numValue;
    };

    return [
      { 
        category: 'Pendapatan', 
        amount: safeFormatNumber(summary.totalIncome), 
        percentage: '+0%', // You can calculate this vs previous period
        type: 'income' 
      },
      { 
        category: 'Pengeluaran', 
        amount: safeFormatNumber(summary.totalExpense), 
        percentage: '+0%', 
        type: 'expense' 
      },
      { 
        category: 'Laba Bersih', 
        amount: safeFormatNumber(summary.netProfit), 
        percentage: '+0%', 
        type: 'profit' 
      },
      { 
        category: 'Pending', 
        amount: safeFormatNumber(summary.pendingAmount), 
        percentage: '+0%', 
        type: 'pending' 
      },
      { 
        category: 'Total Penjualan', 
        amount: safeFormatNumber(summary.totalSales), 
        percentage: `${safeGetNumber(summary.thisMonthSales) > 0 ? '+' : ''}${safeFormatNumber(summary.thisMonthSales)} bulan ini`, 
        type: 'sales' 
      },
      { 
        category: 'Total Order', 
        amount: safeGetNumber(summary.totalOrders).toString(), 
        percentage: `${safeGetNumber(summary.thisMonthOrders)} bulan ini`, 
        type: 'orders' 
      },
    ];
  };

  const financialAnalysisData = calculateFinancialData();

  // Handler for add transaction
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowAddTransactionModal(true);
  };

  // Handler for edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddTransactionModal(true);
  };

  // Handler for save transaction
  const handleSaveTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      if (editingTransaction) {
        // Update existing transaction
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        // Add new transaction - ensure all required fields are present
        if (!transactionData.type || !transactionData.amount || !transactionData.date) {
          throw new Error('Missing required fields: type, amount, and date are required');
        }
        
        const newTransaction: Omit<Transaction, 'id'> = {
          type: transactionData.type,
          amount: transactionData.amount,
          date: transactionData.date,
          category: transactionData.category || '',
          description: transactionData.description || '',
          status: transactionData.status || 'pending',
          payment_method: transactionData.payment_method || '',
          notes: transactionData.notes || '',
          created_at: transactionData.created_at || new Date().toISOString()
        };
        
        await addTransaction(newTransaction);
      }
      setShowAddTransactionModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  // Handler for delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await deleteTransaction(transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Gagal menghapus transaksi');
      }
    }
  };



  const generateChartData = (transactions: Transaction[]) => {
    // Safety check: ensure validOrders is defined and available
    if (!validOrders || !Array.isArray(validOrders)) {
      console.warn('Valid orders data not available yet, skipping chart generation');
      return;
    }
    
    // Use validOrders for safer data processing
    const safeOrders = validOrders;
    
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
      
      // Add sales data from orders - with null safety
      const monthSales = safeOrders
        .filter(o => o && o.order && o.order.created_at) // Check if order exists and has required properties
        .filter(o => {
          try {
            const orderDate = new Date(o.order.created_at);
            return orderDate.getMonth() === index && 
                   orderDate.getFullYear() === new Date().getFullYear();
          } catch (error) {
            console.warn('Invalid order date:', o.order.created_at);
            return false;
          }
        })
        .reduce((sum, o) => sum + Number(o.order.total_amount || 0), 0);
      
      return {
        month,
        income,
        expense,
        sales: monthSales,
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
    
    // Add sales data to pie chart - with null safety
    const totalSales = safeOrders
      .filter(o => o && o.order) // Check if order exists
      .reduce((sum, o) => sum + Number(o.order.total_amount || 0), 0);
    categoryMap.set('Sales-Penjualan', totalSales);
    
    const pieChartData = Array.from(categoryMap.entries()).map(([key, value]) => {
      const [type, category] = key.split('-');
      return {
        name: category,
        value,
        type,
        fill: type === 'Income' ? '#10b981' : type === 'Sales' ? '#3b82f6' : '#ef4444'
      };
    });
    
    setCategoryData(pieChartData);

    // Income vs Expense vs Sales data for bar chart
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setIncomeExpenseData([
      { name: 'Pendapatan', value: totalIncome, fill: '#10b981' },
      { name: 'Pengeluaran', value: totalExpense, fill: '#ef4444' },
      { name: 'Penjualan', value: totalSales, fill: '#3b82f6' }
    ]);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'Rp 0';
    }
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Tanggal tidak valid';
    }
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
            <Button 
              className="gap-2 bg-blue-700"
              onClick={handleAddTransaction}
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Button>
          )}
        </div>
      </div>



      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {hasAccess('Finance', 'financial_analysis') && (
            <TabsTrigger value="financial-analysis">Analisis Keuangan</TabsTrigger>
          )}
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="piutang">Piutang</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={() => { refreshData(); setLastUpdated(new Date()); }} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
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
                         dataKey="sales" 
                         stroke="#3b82f6" 
                         strokeWidth={2}
                         name="Penjualan"
                       />
                       <Line 
                         type="monotone" 
                         dataKey="profit" 
                         stroke="#8b5cf6" 
                         strokeWidth={2}
                         name="Laba Bersih"
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
                          </Card>
           </div>

           {/* Recent Orders */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Wallet className="h-5 w-5" />
                 Order Terbaru
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-80">
                 <div className="space-y-4">
                   {validOrders.length > 0 ? (
                     validOrders
                       .slice(0, 5)
                       .map((orderData) => (
                         <div key={orderData.order.id} className="flex items-center justify-between p-3 border rounded-lg">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-100 rounded-full">
                               <Wallet className="h-4 w-4 text-blue-600" />
                             </div>
                             <div>
                               <p className="font-medium text-sm">Order #{orderData.order.id.slice(0, 8)}</p>
                               <p className="text-xs text-gray-600">{orderData.items?.length || 0} item</p>
                               <p className="text-xs text-gray-500">{formatDate(orderData.order.created_at)}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="font-semibold text-sm text-blue-600">
                               {formatCurrency(Number(orderData.order.total_amount || 0))}
                             </p>
                             <p className="text-xs text-gray-600">
                               {orderData.order.status_id ? `Status: ${orderData.order.status_id}` : 'Pending'}
                             </p>
                           </div>
                         </div>
                       ))
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                       <p>Tidak ada order tersedia</p>
                     </div>
                   )}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>

           {/* Export Analytics */}
           <ExportAnalytics className="mt-6" />
         </TabsContent>

        {/* Financial Analysis Tab */}
        <TabsContent value="financial-analysis" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={() => { refreshData(); setLastUpdated(new Date()); }} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Financial Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            summary.financialHealthScore >= 80 ? 'bg-green-500' : 
                            summary.financialHealthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${summary.financialHealthScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{summary.financialHealthScore}/100</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{summary.profitMargin.toFixed(1)}%</div>
                      <div className="text-gray-600">Profit Margin</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{summary.expenseRatio.toFixed(1)}%</div>
                      <div className="text-gray-600">Expense Ratio</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Cash Flow Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Net Cash Flow</span>
                    <span className={`font-bold ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.cashFlow)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Working Capital</span>
                    <span className={`font-bold ${summary.workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.workingCapital)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Outstanding Receivables</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(summary.outstandingReceivables)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Outstanding Payables</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(summary.outstandingPayables)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Growth Rate</span>
                    <span className={`font-bold ${summary.monthlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.monthlyGrowthRate >= 0 ? '+' : ''}{summary.monthlyGrowthRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Return on Investment</span>
                    <span className={`font-bold ${summary.returnOnInvestment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.returnOnInvestment.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Debt to Income Ratio</span>
                    <span className={`font-bold ${summary.debtToIncomeRatio <= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {(summary.debtToIncomeRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Order Value</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(summary.averageOrderValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {summary.profitMargin < 10 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">Low profit margin</span>
                    </div>
                  )}
                  {summary.expenseRatio > 80 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">High expense ratio</span>
                    </div>
                  )}
                  {summary.workingCapital < 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">Negative working capital</span>
                    </div>
                  )}
                  {summary.monthlyGrowthRate < 0 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">Declining revenue</span>
                    </div>
                  )}
                  {summary.outstandingReceivables > summary.totalIncome * 0.3 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">High receivables</span>
                    </div>
                  )}
                  {summary.financialHealthScore >= 80 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Excellent financial health</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Ratios Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Ratios Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {
                      metric: 'Profit Margin',
                      value: summary.profitMargin,
                      color: summary.profitMargin >= 20 ? '#10b981' : summary.profitMargin >= 10 ? '#f59e0b' : '#ef4444'
                    },
                    {
                      metric: 'Expense Ratio',
                      value: summary.expenseRatio,
                      color: summary.expenseRatio <= 60 ? '#10b981' : summary.expenseRatio <= 80 ? '#f59e0b' : '#ef4444'
                    },
                    {
                      metric: 'ROI',
                      value: summary.returnOnInvestment,
                      color: summary.returnOnInvestment >= 0 ? '#10b981' : '#ef4444'
                    },
                    {
                      metric: 'Growth Rate',
                      value: summary.monthlyGrowthRate,
                      color: summary.monthlyGrowthRate >= 0 ? '#10b981' : '#ef4444'
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Value']}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Bar dataKey="value" fill="#8884d8">
                      {[
                        {
                          metric: 'Profit Margin',
                          value: summary.profitMargin,
                          color: summary.profitMargin >= 20 ? '#10b981' : summary.profitMargin >= 10 ? '#f59e0b' : '#ef4444'
                        },
                        {
                          metric: 'Expense Ratio',
                          value: summary.expenseRatio,
                          color: summary.expenseRatio <= 60 ? '#10b981' : summary.expenseRatio <= 80 ? '#f59e0b' : '#ef4444'
                        },
                        {
                          metric: 'ROI',
                          value: summary.returnOnInvestment,
                          color: summary.returnOnInvestment >= 0 ? '#10b981' : '#ef4444'
                        },
                        {
                          metric: 'Growth Rate',
                          value: summary.monthlyGrowthRate,
                          color: summary.monthlyGrowthRate >= 0 ? '#10b981' : '#ef4444'
                        }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => { refreshData(); setLastUpdated(new Date()); }} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
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
                          <p className="text-sm text-gray-600">{transaction.payment_method}</p>
                        </div>
                        {getStatusBadge(transaction.status)}
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasAccess('Finance', 'manage_expenses') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              title="Edit Transaksi"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasAccess('Finance', 'manage_expenses') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => { refreshData(); setLastUpdated(new Date()); }} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
          {/* Orders Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Order</CardTitle>
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
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada order tersedia</p>
                  </div>
                ) : (
                  orders.map((orderData) => (
                    <div key={orderData.order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Order #{orderData.order.order_number || orderData.order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">{orderData.order.customer_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(orderData.order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(Number(orderData.order.total_amount || 0))}
                          </p>
                          <p className="text-xs text-gray-600">
                            {orderData.items?.length || 0} item
                          </p>
                        </div>
                        <Badge variant={orderData.order.status_id === 5 ? 'default' : 'secondary'}>
                          {orderData.order.status_id === 5 ? 'Selesai' : 'Proses'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Piutang Tab */}
        <TabsContent value="piutang" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => { refreshData(); setLastUpdated(new Date()); }} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Piutang Summary Cards - Only for Paid Orders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                <CreditCard className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(orders.reduce((total, orderData) => {
                    const order = orderData.order;
                    const totalAmount = Number(order.total_amount || 0);
                    const downPayment = Number(order.down_payment || 0);
                    const pelunasan = Number(order.pelunasan || 0);
                    const remaining = totalAmount - downPayment - pelunasan;
                    // Only count orders that have made payments
                    if (downPayment > 0 || pelunasan > 0) {
                      return total + (remaining > 0 ? remaining : 0);
                    }
                    return total;
                  }, 0))}
                </div>
                <p className="text-xs text-gray-600">
                  Belum lunas (hanya order dengan pembayaran)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(orders.reduce((total, orderData) => {
                    const order = orderData.order;
                    const downPayment = Number(order.down_payment || 0);
                    const pelunasan = Number(order.pelunasan || 0);
                    // Only count orders that have made payments
                    if (downPayment > 0 || pelunasan > 0) {
                      return total + downPayment + pelunasan;
                    }
                    return total;
                  }, 0))}
                </div>
                <p className="text-xs text-gray-600">
                  Total DP + Pelunasan diterima
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Order Lunas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(orderData => {
                    const order = orderData.order;
                    const totalAmount = Number(order.total_amount || 0);
                    const downPayment = Number(order.down_payment || 0);
                    const pelunasan = Number(order.pelunasan || 0);
                    // Only count orders that have made payments and are fully paid
                    return (downPayment > 0 || pelunasan > 0) && (downPayment + pelunasan) >= totalAmount;
                  }).length}
                </div>
                <p className="text-xs text-gray-600">
                  Jumlah order lunas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Piutang Details - Only Showing Paid Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders with Payments (DP or Pelunasan) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  Order dengan Pembayaran (DP/Pelunasan)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {orders
                      .filter(orderData => {
                        const order = orderData.order;
                        const downPayment = Number(order.down_payment || 0);
                        const pelunasan = Number(order.pelunasan || 0);
                        // Only show orders that have made payments (DP or Pelunasan)
                        return (downPayment > 0 || pelunasan > 0);
                      })
                      .map((orderData) => {
                        const order = orderData.order;
                        const totalAmount = Number(order.total_amount || 0);
                        const downPayment = Number(order.down_payment || 0);
                        const pelunasan = Number(order.pelunasan || 0);
                        const remaining = totalAmount - downPayment - pelunasan;
                        
                        return (
                          <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <Wallet className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Order #{order.order_number || order.id.slice(0, 8)}</p>
                                <p className="text-xs text-gray-600">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                <p className="text-xs text-gray-400">Status: {order.status_id === 5 ? 'Selesai' : 'Proses'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm text-blue-600">
                                Total: {formatCurrency(totalAmount)}
                              </p>
                              <p className="text-xs text-gray-600">
                                DP: {formatCurrency(downPayment)} | Pelunasan: {formatCurrency(pelunasan)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Sisa: {formatCurrency(remaining)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    {orders.filter(orderData => {
                      const order = orderData.order;
                      const downPayment = Number(order.down_payment || 0);
                      const pelunasan = Number(order.pelunasan || 0);
                      return (downPayment > 0 || pelunasan > 0);
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Tidak ada order dengan pembayaran</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Completed Orders (Done & Selesai-Diambil) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Order Selesai & Diambil (Status Done)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {orders
                      .filter(orderData => orderData.order.status_id === 5) // Status selesai/done
                      .map((orderData) => {
                        const order = orderData.order;
                        const totalAmount = Number(order.total_amount || 0);
                        const downPayment = Number(order.down_payment || 0);
                        const pelunasan = Number(order.pelunasan || 0);
                        const isFullyPaid = (downPayment + pelunasan) >= totalAmount;
                        
                        return (
                          <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${isFullyPaid ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <CheckCircle className={`h-4 w-4 ${isFullyPaid ? 'text-green-600' : 'text-yellow-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Order #{order.order_number || order.id.slice(0, 8)}</p>
                                <p className="text-xs text-gray-600">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                <p className="text-xs text-green-600">✓ Selesai & Diambil</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm text-green-600">
                                {formatCurrency(totalAmount)}
                              </p>
                              <p className="text-xs text-gray-600">
                                {isFullyPaid ? 'Lunas' : 'Belum Lunas'}
                              </p>
                              <p className="text-xs text-gray-500">
                                DP: {formatCurrency(downPayment)} | Pelunasan: {formatCurrency(pelunasan)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    {orders.filter(orderData => orderData.order.status_id === 5).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Tidak ada order selesai</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Orders with Printed Receipts */}
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-purple-600" />
                  Order dengan Pembayaran & Receipt Tercetak
                </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {orders
                    .filter(orderData => {
                      const order = orderData.order;
                      const downPayment = Number(order.down_payment || 0);
                      const pelunasan = Number(order.pelunasan || 0);
                      // Only show orders that have made payments AND have printed receipts
                      return (downPayment > 0 || pelunasan > 0) && order.receipt_printed === true;
                    })
                    .map((orderData) => {
                      const order = orderData.order;
                      const totalAmount = Number(order.total_amount || 0);
                      const downPayment = Number(order.down_payment || 0);
                      const pelunasan = Number(order.pelunasan || 0);
                      const remaining = totalAmount - downPayment - pelunasan;
                      
                      return (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <Printer className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Order #{order.order_number || order.id.slice(0, 8)}</p>
                              <p className="text-xs text-gray-600">{order.customer_name}</p>
                              <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                              <p className="text-xs text-purple-600">✓ Receipt Tercetak</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-purple-600">
                              {formatCurrency(totalAmount)}
                            </p>
                            <p className="text-xs text-gray-600">
                              DP: {formatCurrency(downPayment)} | Pelunasan: {formatCurrency(pelunasan)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Sisa: {formatCurrency(remaining)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  {orders.filter(orderData => {
                    const order = orderData.order;
                    const downPayment = Number(order.down_payment || 0);
                    const pelunasan = Number(order.pelunasan || 0);
                    return (downPayment > 0 || pelunasan > 0) && order.receipt_printed === true;
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Printer className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Tidak ada order dengan pembayaran dan receipt tercetak</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={() => { refreshData(); setLastUpdated(new Date()); }} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
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
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
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

        {/* Add Transaction Modal */}
        <AddTransactionModal
          open={showAddTransactionModal}
          onClose={() => setShowAddTransactionModal(false)}
          onSave={handleSaveTransaction}
          editingTransaction={editingTransaction}
          categories={categories}
        />
      </div>
    );
  };

export default Finance; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Calendar,
  RefreshCw,
  PieChart,
  LineChart,
  AreaChart,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancialSummary, Transaction } from '@/lib/database';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area
} from 'recharts';

interface FinanceChartsProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

const FinanceCharts: React.FC<FinanceChartsProps> = ({
  summary,
  transactions,
  loading = false,
  error = null,
  onRefresh,
  lastUpdated
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Generate chart data from transactions
  const generateChartData = () => {
    if (!transactions || transactions.length === 0) {
      return {
        monthlyData: [],
        categoryData: [],
        incomeExpenseData: [],
        weeklyData: [],
        paymentMethodData: []
      };
    }

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

    // Income vs Expense data for bar chart
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const incomeExpenseData = [
      { name: 'Pendapatan', value: totalIncome, fill: '#10b981' },
      { name: 'Pengeluaran', value: totalExpense, fill: '#ef4444' }
    ];

    // Weekly data
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (3 - i) * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= weekStart && transactionDate <= weekEnd;
      });
      
      const income = weekTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = weekTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        week: `Minggu ${i + 1}`,
        income,
        expense,
        profit: income - expense
      };
    });

    // Payment method data
    const paymentMethodMap = new Map<string, number>();
    transactions
      .filter(t => t.status === 'completed')
      .forEach(t => {
        const method = t.payment_method || 'Unknown';
        paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + t.amount);
      });
    
    const paymentMethodData = Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({
      method,
      amount,
      percentage: formatPercentage(amount, totalIncome + totalExpense)
    }));

    return {
      monthlyData: monthlyChartData,
      categoryData: pieChartData,
      incomeExpenseData,
      weeklyData,
      paymentMethodData
    };
  };

  const chartData = generateChartData();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600">
            <div>
              <p className="font-medium">Error loading financial charts</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          {onRefresh && (
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              className="mt-3 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Grafik Keuangan</h2>
          <p className="text-sm text-gray-600">
            Visualisasi data keuangan real-time
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-500">
                • Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            )}
          </p>
        </div>
        {onRefresh && (
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-600" />
              Trend Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData.monthlyData}>
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
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Distribusi Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-green-600" />
              Pendapatan vs Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData.incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Performa Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={chartData.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
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
                </RechartsAreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.paymentMethodData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">{item.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrency(item.amount)}</div>
                    <div className="text-xs text-gray-600">{item.percentage}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Ringkasan Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pendapatan</span>
                <span className="font-semibold text-green-600">{formatCurrency(summary.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pengeluaran</span>
                <span className="font-semibold text-red-600">{formatCurrency(summary.totalExpense)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Laba Bersih</span>
                <span className={`font-semibold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(summary.pendingAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Metrik Performa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {summary.totalIncome > 0 ? (summary.netProfit / summary.totalIncome * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Profit Margin</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {summary.totalExpense > 0 ? (summary.totalIncome / summary.totalExpense).toFixed(2) : 0}
                </div>
                <div className="text-sm text-gray-600">Cash Flow Ratio</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {summary.netProfit >= 0 ? 'Profit' : 'Rugi'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda Grafik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">Pendapatan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Pengeluaran</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">Laba Bersih</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceCharts;

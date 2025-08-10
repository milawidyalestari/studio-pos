import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  BarChart3,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancialSummary } from '@/lib/database';
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

interface FinanceSummaryProps {
  summary: FinancialSummary;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({
  summary,
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

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { icon: <BarChart3 className="h-4 w-4 text-gray-500" />, color: 'text-gray-500' };
    const change = current - previous;
    if (change > 0) return { icon: <ArrowUpRight className="h-4 w-4 text-green-600" />, color: 'text-green-600' };
    if (change < 0) return { icon: <ArrowDownRight className="h-4 w-4 text-red-600" />, color: 'text-red-600' };
    return { icon: <BarChart3 className="h-4 w-4 text-gray-500" />, color: 'text-gray-500' };
  };

  const getFinancialHealth = () => {
    const profitMargin = summary.totalIncome > 0 ? (summary.netProfit / summary.totalIncome) * 100 : 0;
    const cashFlowRatio = summary.totalExpense > 0 ? summary.totalIncome / summary.totalExpense : 0;
    
    if (profitMargin >= 20 && cashFlowRatio >= 1.5) return { status: 'Excellent', color: 'bg-green-100 text-green-800', bg: 'bg-green-50' };
    if (profitMargin >= 10 && cashFlowRatio >= 1.2) return { status: 'Good', color: 'bg-blue-100 text-blue-800', bg: 'bg-blue-50' };
    if (profitMargin >= 0 && cashFlowRatio >= 1.0) return { status: 'Fair', color: 'bg-yellow-100 text-yellow-800', bg: 'bg-yellow-50' };
    return { status: 'Needs Attention', color: 'bg-red-100 text-red-800', bg: 'bg-red-50' };
  };

  const financialHealth = getFinancialHealth();

  // Chart data
  const monthlyData = [
    { month: 'Jan', income: summary.thisMonthIncome * 0.8, expense: summary.thisMonthExpense * 0.9 },
    { month: 'Feb', income: summary.thisMonthIncome * 0.9, expense: summary.thisMonthExpense * 0.85 },
    { month: 'Mar', income: summary.thisMonthIncome * 0.95, expense: summary.thisMonthExpense * 0.9 },
    { month: 'Apr', income: summary.thisMonthIncome * 1.0, expense: summary.thisMonthExpense * 0.95 },
    { month: 'Mei', income: summary.thisMonthIncome * 1.1, expense: summary.thisMonthExpense * 1.0 },
    { month: 'Jun', income: summary.thisMonthIncome * 1.05, expense: summary.thisMonthExpense * 1.05 }
  ];

  const categoryData = [
    { name: 'Pendapatan', value: summary.totalIncome, color: '#10b981' },
    { name: 'Pengeluaran', value: summary.totalExpense, color: '#ef4444' },
    { name: 'Pending', value: summary.pendingAmount, color: '#f59e0b' }
  ];

  const cashFlowData = [
    { period: 'Q1', income: summary.totalIncome * 0.25, expense: summary.totalExpense * 0.25 },
    { period: 'Q2', income: summary.totalIncome * 0.25, expense: summary.totalExpense * 0.25 },
    { period: 'Q3', income: summary.totalIncome * 0.25, expense: summary.totalExpense * 0.25 },
    { period: 'Q4', income: summary.totalIncome * 0.25, expense: summary.totalExpense * 0.25 }
  ];

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
          {Array.from({ length: 2 }).map((_, index) => (
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
            <XCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error loading financial summary</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Ringkasan Keuangan</h2>
          <p className="text-sm text-gray-600">
            Analisis mendalam dan tren keuangan
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

      {/* Financial Health Overview */}
      <Card className={financialHealth.bg}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Kesehatan Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {summary.totalIncome > 0 ? (summary.netProfit / summary.totalIncome * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Profit Margin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {summary.totalExpense > 0 ? (summary.totalIncome / summary.totalExpense).toFixed(2) : 0}
              </div>
              <div className="text-sm text-gray-600">Cash Flow Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {summary.totalIncome > 0 ? (summary.totalIncome / (summary.totalIncome + summary.totalExpense) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Income Share</div>
            </div>
            <div className="text-center">
              <Badge className={financialHealth.color}>
                {financialHealth.status}
              </Badge>
              <div className="text-sm text-gray-600 mt-2">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Trend Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
                </LineChart>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Analisis Cash Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Growth Rate</p>
                <p className="text-lg font-bold text-green-700">
                  {summary.totalIncome > 0 ? 
                    ((summary.thisMonthIncome - summary.totalIncome / 12) / (summary.totalIncome / 12) * 100).toFixed(1) : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Efficiency</p>
                <p className="text-lg font-bold text-blue-700">
                  {summary.totalExpense > 0 ? 
                    ((summary.totalIncome - summary.totalExpense) / summary.totalExpense * 100).toFixed(1) : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Monthly Average</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatCurrency((summary.totalIncome - summary.totalExpense) / 12)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Indikator Performa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pendapatan</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Pendapatan</span>
                  <span className="font-medium">{formatCurrency(summary.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bulan Ini</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.thisMonthIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rata-rata Bulanan</span>
                  <span className="font-medium">{formatCurrency(summary.totalIncome / 12)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pengeluaran</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Pengeluaran</span>
                  <span className="font-medium">{formatCurrency(summary.totalExpense)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bulan Ini</span>
                  <span className="font-medium text-red-600">{formatCurrency(summary.thisMonthExpense)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rata-rata Bulanan</span>
                  <span className="font-medium">{formatCurrency(summary.totalExpense / 12)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSummary;

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
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancialSummary } from '@/lib/database';

interface FinanceStatsCardsProps {
  summary: FinancialSummary;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

const FinanceStatsCards: React.FC<FinanceStatsCardsProps> = ({
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

  const formatPercentage = (current: number, previous: number) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getGrowthIcon = (current: number, previous: number) => {
    if (previous === 0) return <BarChart3 className="h-4 w-4 text-gray-500" />;
    const change = current - previous;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (current: number, previous: number) => {
    if (previous === 0) return 'text-gray-600';
    const change = current - previous;
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
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
              <p className="font-medium">Error loading financial data</p>
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

  const stats = [
    {
      title: 'Total Pendapatan',
      value: summary.totalIncome,
      change: summary.thisMonthIncome,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Total pendapatan keseluruhan',
      trend: 'Bulan ini'
    },
    {
      title: 'Total Pengeluaran',
      value: summary.totalExpense,
      change: summary.thisMonthExpense,
      icon: <TrendingDown className="h-5 w-5 text-red-600" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Total pengeluaran keseluruhan',
      trend: 'Bulan ini'
    },
    {
      title: 'Laba Bersih',
      value: summary.netProfit,
      change: summary.netProfit - (summary.totalIncome - summary.totalExpense),
      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
      color: summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: summary.netProfit >= 0 ? 'border-green-200' : 'border-red-200',
      description: summary.netProfit >= 0 ? 'Profit yang diperoleh' : 'Rugi yang dialami',
      trend: 'Status keuangan'
    },
    {
      title: 'Pending',
      value: summary.pendingAmount,
      change: 0,
      icon: <CreditCard className="h-5 w-5 text-yellow-600" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Transaksi yang menunggu pembayaran',
      trend: 'Menunggu konfirmasi'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Statistik Keuangan</h2>
          <p className="text-sm text-gray-600">
            Data real-time dari database
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.bgColor} ${stat.borderColor} hover:shadow-md transition-shadow duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-2`}>
                {formatCurrency(stat.value)}
              </div>
              
              {/* Change indicator */}
              <div className="flex items-center gap-2 mb-2">
                {getGrowthIcon(stat.change, 0)}
                <span className={`text-xs font-medium ${getGrowthColor(stat.change, 0)}`}>
                  {stat.change > 0 ? '+' : ''}{formatCurrency(stat.change)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Cash Flow</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(summary.totalIncome - summary.totalExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Profit Margin</p>
                <p className="text-lg font-bold text-purple-700">
                  {summary.totalIncome > 0 
                    ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Bulan Ini</p>
                <p className="text-lg font-bold text-orange-700">
                  {formatCurrency(summary.thisMonthIncome - summary.thisMonthExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Status Keuangan</p>
                  <p className="text-sm text-gray-600">
                    {summary.netProfit >= 0 ? 'Sehat' : 'Perlu Perhatian'}
                  </p>
                </div>
              </div>
              <Badge 
                variant={summary.netProfit >= 0 ? "default" : "destructive"}
                className={summary.netProfit >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {summary.netProfit >= 0 ? 'Baik' : 'Kritis'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Pending Amount</p>
                  <p className="text-sm text-gray-600">
                    {summary.pendingAmount > 0 ? 'Ada transaksi pending' : 'Tidak ada pending'}
                  </p>
                </div>
              </div>
              <Badge 
                variant="secondary"
                className={summary.pendingAmount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}
              >
                {summary.pendingAmount > 0 ? 'Pending' : 'Clear'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceStatsCards;

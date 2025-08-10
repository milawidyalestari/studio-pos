import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { Transaction, Category, FinancialSummary } from '@/lib/database';
import { useHasAccess } from '@/context/RoleAccessContext';
import FinanceStatsCards from './FinanceStatsCards';
import FinanceSummary from './FinanceSummary';
import FinanceCharts from './FinanceCharts';
import { AddTransactionModal } from './AddTransactionModal';

interface FinanceDashboardProps {
  className?: string;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const hasAccess = useHasAccess();
  
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
    refreshData
  } = useDatabase();

  // Auto-refresh data when tab changes
  useEffect(() => {
    if (activeTab) {
      refreshData();
      setLastUpdated(new Date());
    }
  }, [activeTab, refreshData]);

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
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      setShowAddTransactionModal(false);
      setEditingTransaction(null);
      refreshData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  // Handler for delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await deleteTransaction(transactionId);
        refreshData();
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Gagal menghapus transaksi');
      }
    }
  };

  // Handler for refresh
  const handleRefresh = () => {
    refreshData();
    setLastUpdated(new Date());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  // Check access first
  if (!hasAccess('Finance', 'view_finance')) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses dashboard keuangan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Keuangan</h1>
          <p className="text-gray-600">Monitor dan kelola keuangan bisnis Anda secara real-time</p>
        </div>
        <div className="flex gap-3">
          {hasAccess('Finance', 'manage_expenses') && (
            <Button 
              className="gap-2 bg-blue-700"
              onClick={handleAddTransaction}
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Button>
          )}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <FinanceStatsCards
        summary={summary}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analisis</TabsTrigger>
          <TabsTrigger value="charts">Grafik</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <FinanceSummary
            summary={summary}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Kesehatan Keuangan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <span className="font-semibold text-green-600">
                      {summary.totalIncome > 0 ? (summary.netProfit / summary.totalIncome * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cash Flow Ratio</span>
                    <span className="font-semibold text-blue-600">
                      {summary.totalExpense > 0 ? (summary.totalIncome / summary.totalExpense).toFixed(2) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge 
                      variant={summary.netProfit >= 0 ? "default" : "destructive"}
                      className={summary.netProfit >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {summary.netProfit >= 0 ? 'Sehat' : 'Perlu Perhatian'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-600">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <FinanceCharts
            summary={summary}
            transactions={transactions}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Transaksi</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada transaksi ditemukan</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
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
      </Tabs>

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

export default FinanceDashboard;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Receipt,
  BarChart3,
  ChevronDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from '@/hooks/useOrders';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { useToast } from '@/hooks/use-toast';
import { addSampleOrders, clearSampleOrders } from '@/services/sampleDataService';
import { addTestOrders, clearTestOrders } from '@/services/testDataService';
import { addSampleOrdersToLocalStorage, clearSampleOrdersFromLocalStorage } from '@/services/localStorageService';
import { useQuery } from '@tanstack/react-query';
import { databaseManager } from '@/lib/database-manager';
import { useHasAccess } from '@/context/RoleAccessContext';

const Report = () => {
  const hasAccess = useHasAccess();
  const [activeTab, setActiveTab] = useState('daily-orders');
  const [dateFilter, setDateFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { toast } = useToast();
  const { orders, isLoading, refetch, isFetching } = useOrders({ enableAutoRefresh: false });
  const { data: orderStatuses, isLoading: statusesLoading } = useOrderStatus();
  const { data: dbInfo } = useQuery({
    queryKey: ['database-info'],
    queryFn: async () => {
      return await databaseManager.getInfo();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to check if date matches filter
  const matchesDateFilter = (orderDate: string) => {
    if (!orderDate) return false;
    
    const today = new Date();
    const orderDateObj = new Date(orderDate);
    
    // Normalize dates to start of day for accurate comparison
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };
    
    const normalizedToday = normalizeDate(today);
    const normalizedOrderDate = normalizeDate(orderDateObj);
    
    switch (dateFilter) {
      case 'today':
        return normalizedOrderDate.getTime() === normalizedToday.getTime();
      case 'yesterday':
        const yesterday = new Date(normalizedToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return normalizedOrderDate.getTime() === yesterday.getTime();
      case 'week':
        const weekStart = new Date(normalizedToday);
        weekStart.setDate(normalizedToday.getDate() - normalizedToday.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return normalizedOrderDate >= weekStart && normalizedOrderDate <= weekEnd;
      case 'month':
        return normalizedOrderDate.getMonth() === normalizedToday.getMonth() && 
               normalizedOrderDate.getFullYear() === normalizedToday.getFullYear();
      case 'quarter':
        const currentQuarter = Math.floor(normalizedToday.getMonth() / 3);
        const orderQuarter = Math.floor(normalizedOrderDate.getMonth() / 3);
        return orderQuarter === currentQuarter && 
               normalizedOrderDate.getFullYear() === normalizedToday.getFullYear();
      case 'year':
        return normalizedOrderDate.getFullYear() === normalizedToday.getFullYear();
      default:
        return true;
    }
  };

  // Filter orders based on search, status, and date
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use actual status from database
    const actualStatus = order.order_statuses?.name || 'Unknown';
    const matchesStatus = statusFilter === 'all' || 
      actualStatus.toLowerCase() === statusFilter.toLowerCase();
    
    // Use created_at as the primary date field
    const matchesDate = matchesDateFilter(order.created_at || '');
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  // Calculate real financial data from orders
  const calculateFinancialData = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return [
        { category: 'Pendapatan', amount: '0', percentage: '0%', type: 'income' },
        { category: 'Biaya Material', amount: '0', percentage: '0%', type: 'expense' },
        { category: 'Biaya Tenaga Kerja', amount: '0', percentage: '0%', type: 'expense' },
        { category: 'Laba Bersih', amount: '0', percentage: '0%', type: 'profit' },
      ];
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalDownPayments = filteredOrders.reduce((sum, order) => sum + (order.down_payment || 0), 0);
    const totalPelunasan = filteredOrders.reduce((sum, order) => sum + ((order as any).pelunasan || 0), 0);
    
    // Estimate costs (you can adjust these percentages)
    const materialCosts = Math.round(totalRevenue * 0.35); // 35% of revenue
    const laborCosts = Math.round(totalRevenue * 0.25); // 25% of revenue
    const netProfit = totalRevenue - materialCosts - laborCosts;

    return [
      { 
        category: 'Pendapatan', 
        amount: totalRevenue.toLocaleString('id-ID'), 
        percentage: '+0%', // You can calculate this vs previous period
        type: 'income' 
      },
      { 
        category: 'Biaya Material', 
        amount: materialCosts.toLocaleString('id-ID'), 
        percentage: '+0%', 
        type: 'expense' 
      },
      { 
        category: 'Biaya Tenaga Kerja', 
        amount: laborCosts.toLocaleString('id-ID'), 
        percentage: '+0%', 
        type: 'expense' 
      },
      { 
        category: 'Laba Bersih', 
        amount: netProfit.toLocaleString('id-ID'), 
        percentage: '+0%', 
        type: 'profit' 
      },
    ];
  };

  const financialData = calculateFinancialData();

  // Calculate real sales data from orders
  const calculateSalesData = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return [];
    }

    const productSales: { [key: string]: { quantity: number; revenue: number } } = {};

    filteredOrders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          // Debug: Log item structure to understand available data (development only)
          if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
            // Only log 10% of items to avoid console spam
            console.log('Sample order item data:', {
              item_name: item.item_name,
              bahan: item.bahan,
              description: item.description
            });
          }
          
          // Create a more descriptive product name
          let productName = item.item_name || 'Produk Tidak Diketahui';
          
          // If item_name looks like a code or is very short, enhance it with material info
          if (productName.length <= 10 && /^[A-Z0-9-_]+$/i.test(productName)) {
            // This looks like a code, create a better display name
            if (item.bahan) {
              productName = `${productName} (${item.bahan})`;
            } else if (item.description) {
              productName = `${productName} (${item.description})`;
            }
          } else if (item.bahan && !productName.includes(item.bahan)) {
            // Even if not a code, add material for clarity if not already included
            productName = `${productName} - ${item.bahan}`;
          }
          
          if (!productSales[productName]) {
            productSales[productName] = { quantity: 0, revenue: 0 };
          }
          productSales[productName].quantity += Number(item.quantity) || 0;
          productSales[productName].revenue += Number(item.sub_total) || 0;
        });
      }
    });

    return Object.entries(productSales)
      .map(([product, data]) => ({
        product,
        quantity: data.quantity,
        revenue: data.revenue.toLocaleString('id-ID'),
        growth: '+0%' // You can calculate this vs previous period
      }))
      .sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending
      .slice(0, 10); // Top 10 products
  };

  const salesData = calculateSalesData();

  // Use real transaction data from filteredOrders
  const transactionData = filteredOrders.map(order => ({
    id: order.order_number || 'N/A',
    customer: order.customer_name || 'N/A',
    date: order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A',
    estimatedDate: order.estimasi ? new Date(order.estimasi).toLocaleDateString('id-ID') : 'N/A',
    status: order.order_statuses?.name || 'Unknown',
    category: (() => {
      const firstItem = order.order_items?.[0];
      if (!firstItem) return 'N/A';
      
      // Same logic as sales data - create descriptive name
      let itemName = firstItem.item_name || 'N/A';
      
      // If item_name looks like a code, enhance it with material info
      if (itemName !== 'N/A' && itemName.length <= 10 && /^[A-Z0-9-_]+$/i.test(itemName)) {
        if (firstItem.bahan) {
          itemName = `${itemName} (${firstItem.bahan})`;
        } else if (firstItem.description) {
          itemName = `${itemName} (${firstItem.description})`;
        }
      } else if (firstItem.bahan && !itemName.includes(firstItem.bahan)) {
        itemName = `${itemName} - ${firstItem.bahan}`;
      }
      
      return itemName;
    })(),
    total: (order.total_amount || 0).toLocaleString('id-ID'),
  }));

  const handleExport = (format: string) => {
    console.log(`Exporting ${activeTab} report as ${format}`);
    toast({
      title: "Ekspor Dimulai",
      description: `Mengekspor laporan dalam format ${format.toUpperCase()}`,
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Diperbarui",
      description: "Data order telah diperbarui",
    });
  };

  const handleAddSampleData = async () => {
    try {
      const result = await addSampleOrders();
      if (result.success) {
        refetch();
        toast({
          title: "Data Contoh Ditambahkan",
          description: "Order contoh telah ditambahkan ke database",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal menambahkan data contoh",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan data contoh",
        variant: "destructive",
      });
    }
  };

  const handleClearSampleData = async () => {
    try {
      const result = await clearSampleOrders();
      if (result.success) {
        refetch();
        toast({
          title: "Data Contoh Dihapus",
          description: "Order contoh telah dihapus dari database",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus data contoh",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear sample data",
        variant: "destructive",
      });
    }
  };

  const handleAddTestData = async () => {
    try {
      const result = await addTestOrders();
      if (result.success) {
        refetch();
        toast({
          title: "Data Test Ditambahkan",
          description: "Order test telah ditambahkan ke database",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal menambahkan data test",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test data",
        variant: "destructive",
      });
    }
  };

  const handleClearTestData = async () => {
    try {
      const result = await clearTestOrders();
      if (result.success) {
        refetch();
        toast({
          title: "Data Test Dihapus",
          description: "Order test telah dihapus dari database",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus data test",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear test data",
        variant: "destructive",
      });
    }
  };

  const handleAddLocalStorageData = async () => {
    try {
      const result = addSampleOrdersToLocalStorage();
      if (result.success) {
        refetch();
        toast({
          title: "Local Storage Data Added",
          description: "Sample orders have been added to localStorage",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add localStorage data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add localStorage data",
        variant: "destructive",
      });
    }
  };

  const handleClearLocalStorageData = async () => {
    try {
      const result = clearSampleOrdersFromLocalStorage();
      if (result.success) {
        refetch();
        toast({
          title: "Local Storage Data Cleared",
          description: "Sample orders have been removed from localStorage",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to clear localStorage data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear localStorage data",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'cek file': return 'bg-orange-100 text-orange-800';
      case 'desain': return 'bg-purple-100 text-purple-800';
      case 'konfirmasi': return 'bg-cyan-100 text-cyan-800';
      case 'revisi': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Note: getStatusText function removed - now using actual status from database via order_statuses join

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600">Laporan bisnis dan analitik yang komprehensif</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Segarkan
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]">
                <Download className="h-4 w-4" />
                Ekspor
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                <FileText className="h-4 w-4" />
                Ekspor sebagai CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Ekspor sebagai Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                <FileDown className="h-4 w-4" />
                Ekspor sebagai PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Data Contoh
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddSampleData} className="gap-2">
                <FileText className="h-4 w-4" />
                Tambah Order Contoh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearSampleData} className="gap-2">
                <FileDown className="h-4 w-4" />
                Hapus Order Contoh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddTestData} className="gap-2">
                <FileText className="h-4 w-4" />
                Tambah Order Test
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearTestData} className="gap-2">
                <FileDown className="h-4 w-4" />
                Hapus Order Test
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddLocalStorageData} className="gap-2">
                <FileText className="h-4 w-4" />
                Tambah Order LocalStorage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearLocalStorageData} className="gap-2">
                <FileDown className="h-4 w-4" />
                Hapus Order LocalStorage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              console.log('Current orders:', orders);
              console.log('Filtered orders:', filteredOrders);
              console.log('Database info:', dbInfo);
            }}
          >
            Debug
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari order berdasarkan ID atau customer..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={statusesLoading}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={statusesLoading ? "Memuat..." : "Semua Status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {orderStatuses?.map((status) => (
                <SelectItem key={status.id} value={status.name.toLowerCase()}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="quarter">Kuartal Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily-orders" className="gap-2">
            <Calendar className="h-4 w-4" />
            Order Harian
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Keuangan
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Penjualan
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <Receipt className="h-4 w-4" />
            Transaksi
          </TabsTrigger>
        </TabsList>

        {/* Daily Orders Report */}
        <TabsContent value="daily-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0050C8]" />
                Laporan Order Harian
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Total Order: {filteredOrders.length}</span>
                {isFetching && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Memperbarui...</span>}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0050C8]" />
                  <span className="ml-2">Memuat order...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada order ditemukan</p>
                  <p className="text-sm">Coba sesuaikan pencarian atau filter Anda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getStatusColor(order.order_statuses?.name || 'Unknown')}`}>
                              {order.order_statuses?.name || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">
                            IDR {order.total_amount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.payment_type || 'Cash'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Report */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialData.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{item.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">IDR {item.amount}</div>
                  <p className={`text-xs font-medium ${
                    item.type === 'income' || item.type === 'profit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.percentage} dari periode sebelumnya
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#0050C8]" />
                Ringkasan Keuangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.category}</p>
                      <p className="text-sm text-gray-600">Pertumbuhan: {item.percentage}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        item.type === 'income' || item.type === 'profit' ? 'text-green-600' : 
                        item.type === 'expense' ? 'text-red-600' : 'text-[#0050C8]'
                      }`}>
                        IDR {item.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0050C8]" />
                Laporan Performa Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Terjual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertumbuhan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">IDR {item.revenue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{item.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction Report (Read-only) */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#0050C8]" />
                Laporan Transaksi (Hanya Baca)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimasi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionData.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.estimatedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">IDR {transaction.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Report;
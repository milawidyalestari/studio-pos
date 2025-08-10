import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/common/DataTable';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { supabase } from '@/integrations/supabase/client';
import { PrintOverlay } from '@/components/PrintOverlay';
import { 
  Download,
  FileDown,
  RefreshCw,
  Search,
  SlidersHorizontal,
  AlertCircle,
  Clock,
  Check,
  Printer,
  DollarSign,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { OrderWithItems } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHasAccess } from '@/context/RoleAccessContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface untuk data piutang
interface PiutangData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_whatsapp?: string;
  tanggal: string;
  down_payment: number;
  pelunasan: number;
  remaining_payment: number;
  total_amount: number;
  payment_type: string;
  status_pembayaran: string;
  order_status: string;
  estimasi: string;
  admin_name?: string;
  desainer_name?: string;
  days_overdue: number;
}

const PiutangPage = () => {
  const hasAccess = useHasAccess();
  const { orders = [], isLoading, refetch } = useOrders({ enableAutoRefresh: false });
  const { data: paymentTypes = [] } = usePaymentTypes();
  const [searchTerm, setSearchTerm] = useState('');
  const [localReceipt, setLocalReceipt] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState<Date | undefined>();
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [filterField, setFilterField] = useState('customer_name');
  const [filterValue, setFilterValue] = useState('');
  const [showPrintOverlay, setShowPrintOverlay] = useState(false);
  const [printOrderData, setPrintOrderData] = useState<OrderWithItems | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Buat mapping id -> payment_method
  const paymentTypeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    paymentTypes.forEach(pt => {
      map[pt.id] = pt.payment_method;
    });
    return map;
  }, [paymentTypes]);

  // Helper untuk akses pelunasan secara aman
  type OrderWithMaybePelunasan = OrderWithItems & { pelunasan?: number | null };

  // Filter untuk piutang (order yang belum lunas)
  const piutangData: PiutangData[] = (orders as OrderWithMaybePelunasan[])
    .map(order => {
      const uangMuka = order.down_payment || 0;
      const pelunasan = order.pelunasan || 0;
      const totalOrder = order.total_amount || 0;
      const sisaPembayaran = totalOrder - (uangMuka + pelunasan);
      
      // Hitung hari keterlambatan
      const orderDate = new Date(order.tanggal);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let statusPembayaran = 'Belum Dibayar';
      if (uangMuka === 0 && pelunasan === 0) statusPembayaran = 'Belum Dibayar';
      else if (uangMuka + pelunasan < totalOrder) statusPembayaran = 'Belum Lunas';
      else if (uangMuka + pelunasan >= totalOrder) statusPembayaran = 'Lunas';

      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name || '-',
        customer_whatsapp: order.customer_whatsapp,
        tanggal: order.tanggal,
        down_payment: uangMuka,
        pelunasan: pelunasan,
        remaining_payment: sisaPembayaran,
        total_amount: totalOrder,
        payment_type: paymentTypeMap[order.payment_type as string] || '-',
        status_pembayaran: statusPembayaran,
        order_status: order.order_statuses?.name || '',
        estimasi: order.estimasi || '-',
        admin_name: order.admin?.nama || '-',
        desainer_name: order.desainer?.nama || '-',
        days_overdue: daysDiff
      };
    })
    .filter(order => {
      const totalPaid = order.down_payment + order.pelunasan;
      return totalPaid < order.total_amount && totalPaid >= 0;
    });

  // Filter berdasarkan search term dan status
  const filteredPiutang = piutangData.filter(order => {
    // Filter berdasarkan status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'overdue' && order.days_overdue <= 7) return false;
      if (selectedStatus === 'recent' && order.days_overdue > 7) return false;
    }

    // Filter berdasarkan tanggal
    if (filterField === 'tanggal') {
      const tgl = new Date(order.tanggal);
      if (dateMode === 'single' && singleDate) {
        return tgl.toDateString() === singleDate.toDateString();
      } else if (dateMode === 'range' && range.from && range.to) {
        return tgl >= range.from && tgl <= range.to;
      }
      return true;
    } else {
      // Filter berdasarkan field lain
      const fieldValue = (order[filterField as keyof PiutangData] || '').toString().toLowerCase();
      return !filterValue || fieldValue.includes(filterValue.toLowerCase());
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Handler print nota
  const handlePrintNota = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found');
        return;
      }
      
      setPrintOrderData(order);
      setShowPrintOverlay(true);
    } catch (error) {
      console.error('Error in handlePrintNota:', error);
    }
  };

  const handlePrintOverlayClose = () => {
    setShowPrintOverlay(false);
    setPrintOrderData(null);
  };

  const handlePrintSuccess = async () => {
    if (printOrderData) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ receipt_printed: true } as any)
          .eq('id', printOrderData.id);
          
        if (error) {
          console.error('Error updating receipt_printed:', error);
          return;
        }
        
        setLocalReceipt(prev => ({ ...prev, [printOrderData.id]: true }));
        setShowPrintOverlay(false);
        setPrintOrderData(null);
      } catch (error) {
        console.error('Error in handlePrintSuccess:', error);
      }
    }
  };

  const columns: Column<PiutangData>[] = [
    {
      key: 'order_number',
      label: 'No. Order',
      render: value => <span className="font-semibold text-sm text-gray-900">{value}</span>
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.customer_whatsapp && (
            <div className="text-xs text-gray-500">{row.customer_whatsapp}</div>
          )}
        </div>
      )
    },
    {
      key: 'tanggal',
      label: 'Tanggal Order',
      render: value => <span className="text-gray-700">{formatDate(value)}</span>
    },
    {
      key: 'total_amount',
      label: 'Total Order',
      render: value => <span className="font-bold text-[#0050C8]">{formatCurrency(Number(value))}</span>
    },
    {
      key: 'down_payment',
      label: 'Uang Muka',
      render: value => <span className="font-semibold text-green-700">{formatCurrency(Number(value))}</span>
    },
    {
      key: 'remaining_payment',
      label: 'Sisa Piutang',
      render: (value, row) => {
        const isOverdue = row.days_overdue > 7;
        return (
          <div className="flex flex-col">
            <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
              {formatCurrency(Number(value))}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs mt-1">
                {row.days_overdue} hari
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'order_status',
      label: 'Status Order',
      render: value => {
        let color = 'bg-gray-100 text-gray-700';
        if (value === 'Done' || value === 'Selesai-Diambil') color = 'bg-green-100 text-green-700';
        else if (value === 'Proses Cetak') color = 'bg-blue-100 text-blue-700';
        else if (value === 'Export') color = 'bg-yellow-100 text-yellow-700';
        
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            {value || 'Pending'}
          </span>
        );
      }
    },
    {
      key: 'days_overdue',
      label: 'Umur Piutang',
      render: (value, row) => {
        const days = row.days_overdue;
        let color = 'text-gray-600';
        if (days > 30) color = 'text-red-600';
        else if (days > 14) color = 'text-orange-600';
        else if (days > 7) color = 'text-yellow-600';
        
        return (
          <span className={`text-sm font-medium ${color}`}>
            {days} hari
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePrintNota(row.id)}
            className="h-8 px-3"
          >
            <Printer className="w-3 h-3 mr-1" />
            Print
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
          >
            <Eye className="w-3 h-3 mr-1" />
            Detail
          </Button>
        </div>
      )
    }
  ];

  const handleRefresh = () => {
    console.log('Refreshing piutang data...');
    refetch();
  };

  // Hitung total statistik
  const totalPiutang = piutangData.reduce((sum, order) => sum + order.remaining_payment, 0);
  const totalOrders = piutangData.length;
  const overdueOrders = piutangData.filter(order => order.days_overdue > 7).length;
  const recentOrders = piutangData.filter(order => order.days_overdue <= 7).length;

  const isFilterActive =
    (filterField === 'tanggal' && (
      (dateMode === 'single' && singleDate) ||
      (dateMode === 'range' && range.from && range.to)
    )) ||
    (filterField !== 'tanggal' && filterValue.trim() !== '') ||
    selectedStatus !== 'all';

  // Check access to Piutang page
  if (!hasAccess('Transaction', 'view_transactions')) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman piutang.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Piutang (Receivables)</h1>
          <p className="text-gray-600">Kelola orderan yang belum lunas pembayarannya</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={isFilterActive ? 'default' : 'outline'}
                className={`gap-2 ${isFilterActive ? 'bg-[#0050C8] text-white' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]">
              <div className="mb-3 font-semibold text-sm">Filter Piutang</div>
              
              {/* Status Filter */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">Status Piutang</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                                         <SelectItem value="recent">Piutang Baru (≤7 hari)</SelectItem>
                     <SelectItem value="overdue">Piutang Lama (&gt;7 hari)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Field Filter */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">Field</label>
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_name">Customer</SelectItem>
                    <SelectItem value="order_number">Nomor Orderan</SelectItem>
                    <SelectItem value="order_status">Status Order</SelectItem>
                    <SelectItem value="tanggal">Tanggal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date or Value Filter */}
              {filterField === 'tanggal' ? (
                <>
                  <Select value={dateMode} onValueChange={v => setDateMode(v as 'single' | 'range')}>
                    <SelectTrigger className="w-full mb-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Per Tanggal</SelectItem>
                      <SelectItem value="range">Rentang Tanggal</SelectItem>
                    </SelectContent>
                  </Select>
                  {dateMode === 'single' ? (
                    <Calendar
                      mode="single"
                      selected={singleDate}
                      onSelect={setSingleDate}
                      className="w-full"
                      classNames={{
                        day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                        day_today: "border border-[#0050C8]",
                        day_range_end: "bg-[#0050C8] text-white",
                      }}
                    />
                  ) : (
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={(value) => setRange(value as any)}
                      className="w-full"
                      classNames={{
                        day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                        day_today: "border border-[#0050C8]",
                        day_range_end: "bg-[#0050C8] text-white",
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-1">Cari</label>
                  <Input 
                    value={filterValue} 
                    onChange={e => setFilterValue(e.target.value)} 
                    placeholder="Ketik kata kunci..." 
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { 
                    setSingleDate(undefined); 
                    setRange({ from: undefined, to: undefined }); 
                    setFilterField('customer_name'); 
                    setFilterValue(''); 
                    setSelectedStatus('all');
                    setFilterOpen(false); 
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0050C8] text-white hover:bg-[#003a8c]"
                  onClick={() => setFilterOpen(false)}
                >
                  Terapkan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {hasAccess('Transaction', 'export_data') && (
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          )}
          
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPiutang)}</div>
            <p className="text-xs text-muted-foreground">Total sisa pembayaran</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Order belum lunas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Piutang Baru</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recentOrders}</div>
            <p className="text-xs text-muted-foreground">≤7 hari</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Piutang Lama</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overdueOrders}</div>
                         <p className="text-xs text-muted-foreground">&gt;7 hari</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari orderan, customer, atau nomor order..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Hari Ini</Button>
          <Button variant="outline" size="sm">Minggu Ini</Button>
          <Button variant="outline" size="sm">Bulan Ini</Button>
        </div>
      </div>

      {/* Piutang Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Piutang ({filteredPiutang.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan orderan yang belum lunas pembayarannya
          </p>
        </div>
        <DataTable
          data={filteredPiutang}
          columns={columns}
          loading={isLoading}
          emptyMessage="Tidak ada piutang yang ditemukan"
        />
      </div>

      {/* Print Overlay */}
      {printOrderData && (
        <PrintOverlay
          isOpen={showPrintOverlay}
          onClose={handlePrintOverlayClose}
          onPrint={handlePrintSuccess}
          title="Print Nota"
          printType="nota"
          orderData={{
            orderNumber: printOrderData.order_number,
            customerName: printOrderData.customer_name,
            totalAmount: printOrderData.total_amount,
            desain: printOrderData.biaya_lain || 0,
            biayaLainnya: printOrderData.biaya_lain || 0,
            downPayment: printOrderData.down_payment || 0,
            estimasi: printOrderData.estimasi,
            estimasiWaktu: printOrderData.waktu,
            komputer: printOrderData.admin?.nama,
            desainer: printOrderData.desainer?.nama,
          }}
          orderList={(printOrderData.order_items || []).map((item: any) => {
            const displayName = item.item_name;
            
            return {
              id: item.id,
              item: displayName,
              quantity: item.quantity,
              subTotal: item.sub_total,
              ukuran: {
                panjang: item.panjang,
                lebar: item.lebar,
              },
              description: item.description,
              finishing: item.finishing,
            };
          })}
        />
      )}
    </div>
  );
};

export default PiutangPage;

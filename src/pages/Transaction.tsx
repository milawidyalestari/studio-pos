import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/common/DataTable';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { PrintOverlay } from '@/components/PrintOverlay';
import { 
  Download,
  FileDown,
  RefreshCw,
  Search,
  SlidersHorizontal,
  CheckCircle,
  LoaderCircle,
  Clock,
  Check,
  Printer,
  DollarSign,
  FileText,
  CheckSquare
} from 'lucide-react';
import { OrderWithItems } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHasAccess } from '@/context/RoleAccessContext';

// Interface untuk data transaksi dari orders
interface PaymentTransaction {
  id: string;
  order_number: string;
  customer_name: string;
  tanggal: string;
  down_payment: number;
  pelunasan: number;
  total_amount: number;
  payment_type: string;
  status: string;
  created_at: string;
  item_name: string; // Added for product/item name
}

const TransactionPage = () => {
  const hasAccess = useHasAccess();
  const { orders = [], isLoading, refetch } = useOrders({ enableAutoRefresh: false });
  const { data: paymentTypes = [] } = usePaymentTypes();
  const { data: products } = useProducts();
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

  const paymentTransactions = (orders as OrderWithMaybePelunasan[])
    .map(order => {
      const uangMuka = order.down_payment || 0;
      const pelunasan = order.pelunasan || 0;
      const totalOrder = order.total_amount || 0;
      let statusPembayaran = 'Belum Dibayar';
      if (uangMuka === 0 && pelunasan === 0) statusPembayaran = 'Belum Dibayar';
      else if (uangMuka + pelunasan < totalOrder) statusPembayaran = 'Belum Lunas';
      else if (uangMuka + pelunasan >= totalOrder) statusPembayaran = 'Lunas';
      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name || '-',
        tanggal: order.tanggal,
        down_payment: uangMuka,
        pelunasan: pelunasan,
        remaining_payment: order.remaining_payment || 0,
        total_amount: totalOrder,
        payment_type: paymentTypeMap[order.payment_type as string] || '-',
        status_pembayaran: statusPembayaran,
        receipt_printed: (order as any).receipt_printed || false,
        order_status_name: order.order_statuses?.name || '',
      };
    })
    .filter(t =>
      t.down_payment > 0 ||
      t.pelunasan > 0 ||
      t.receipt_printed === true ||
      t.order_status_name === 'Done' ||
      t.order_status_name === 'Selesai-Diambil'
    );

  // Filter berdasarkan search term
  const filteredTransactions = paymentTransactions.filter(transaction => {
    if (filterField === 'tanggal') {
      const tgl = new Date(transaction.tanggal);
      if (dateMode === 'single' && singleDate) {
        return tgl.toDateString() === singleDate.toDateString();
      } else if (dateMode === 'range' && range.from && range.to) {
        return tgl >= range.from && tgl <= range.to;
      }
      return true;
    } else {
      const fieldValue = (transaction[filterField] || '').toString().toLowerCase();
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

  const getPaymentStatus = (downPayment: number, pelunasan: number, totalAmount: number) => {
    const totalPaid = downPayment + pelunasan;
    if (totalPaid >= totalAmount) return 'Lunas';
    if (totalPaid > 0) return 'DP';
    return 'Belum Bayar';
  };

  const statusMap = {
    "Completed": {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="w-4 h-4 mr-1" />
    },
    "In Progress": {
      color: "bg-blue-100 text-blue-700",
      icon: <LoaderCircle className="w-4 h-4 mr-1" />
    },
    "Ready": {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="w-4 h-4 mr-1" />
    }
    // Tambahkan status lain jika perlu
  };

  // Handler print nota
  const handlePrintNota = async (orderId: string) => {
    try {
      // Find the order data
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found');
        return;
      }
      
      // Set order data for print overlay
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
        // Update receipt_printed di database
        const { error } = await supabase
          .from('orders')
          .update({ receipt_printed: true } as any)
          .eq('id', printOrderData.id);
          
        if (error) {
          console.error('Error updating receipt_printed:', error);
          return;
        }
        
        // Update state lokal agar badge langsung berubah
        setLocalReceipt(prev => ({ ...prev, [printOrderData.id]: true }));
        
        // Close overlay
        setShowPrintOverlay(false);
        setPrintOrderData(null);
      } catch (error) {
        console.error('Error in handlePrintSuccess:', error);
      }
    }
  };

  const columns: Column<typeof paymentTransactions[0]>[] = [
    {
      key: 'order_number',
      label: 'Nomor Orderan',
      render: value => <span className="font-semibold fonttext-sm text-gray-900">{value}</span>
    },
    {
      key: 'customer_name',
      label: 'Nama Customer',
      render: value => <span className="text-gray-900">{value}</span>
    },
    {
      key: 'tanggal',
      label: 'Tanggal Order',
      render: value => <span className="text-gray-700">{formatDate(value)}</span>
    },
    {
      key: 'down_payment',
      label: 'Uang Muka',
      render: value => <span className="font-semibold text-green-700">{formatCurrency(Number(value))}</span>
    },
    {
      key: 'remaining_payment',
      label: 'Sisa',
      render: value => <span className="font-bold text-red-600">{formatCurrency(Number(value))}</span>
    },
    {
      key: 'total_amount',
      label: 'Total Order',
      render: value => <span className="font-bold text-[#0050C8]">{formatCurrency(Number(value))}</span>
    },
    {
      key: 'payment_type',
      label: 'Metode',
      render: value => <span className="text-gray-700">{value}</span>
    },
    {
      key: 'status_pembayaran',
      label: 'Status Pembayaran',
      render: value => {
        let color = 'bg-gray-100 text-gray-700';
        if (value === 'Lunas') color = 'bg-green-100 text-green-700';
        else if (value === 'Belum Lunas') color = 'bg-yellow-100 text-yellow-700';
        else if (value === 'Belum Dibayar') color = 'bg-red-100 text-red-700';
        return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{value}</span>;
      }
    },
    {
      key: 'receipt_printed',
      label: 'Nota',
      render: (value, row) => {
        const printed = localReceipt[row.id] ?? value;
        return printed
          ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><Check className="w-4 h-4 mr-1" />Tercetak</span>
          : <button
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
              onClick={() => handlePrintNota(row.id)}
              type="button"
            >
              <Printer className="w-4 h-4 mr-1" />Print
            </button>;
      }
    }
  ];

  const handleRefresh = () => {
    console.log('Refreshing transactions...');
    refetch();
  };

  // Hitung total statistik
  const totalRevenue = paymentTransactions.reduce((sum, t) => sum + t.down_payment + t.remaining_payment, 0);
  const totalOrders = paymentTransactions.length;
  const completedPayments = paymentTransactions.filter(t => 
    (t.down_payment + t.remaining_payment) >= t.total_amount
  ).length;

  const isFilterActive =
    (filterField === 'tanggal' && (
      (dateMode === 'single' && singleDate) ||
      (dateMode === 'range' && range.from && range.to)
    )) ||
    (filterField !== 'tanggal' && filterValue.trim() !== '');

  // Check access to Transaction page
  if (!hasAccess('Transaction', 'view_transactions')) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CheckSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman transaksi.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Lihat riwayat pembayaran dari semua orderan</p>
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
            <PopoverContent className="w-[250px]">
              <div className="mb-2 font-semibold text-sm">Filter Transaksi</div>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1">Field</label>
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_name">Customer</SelectItem>
                    <SelectItem value="order_number">Nomor Orderan</SelectItem>
                    <SelectItem value="status_pembayaran">Status Pembayaran</SelectItem>
                    <SelectItem value="payment_type">Metode</SelectItem>
                    <SelectItem value="tanggal">Tanggal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <div className="mb-2">
                  <label className="block text-xs font-semibold mb-1">Cari</label>
                  <Input value={filterValue} onChange={e => setFilterValue(e.target.value)} placeholder="Ketik kata kunci..." />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => { setSingleDate(undefined); setRange({ from: undefined, to: undefined }); setFilterField('customer_name'); setFilterValue(''); setFilterOpen(false); }}>Reset</Button>
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
          {hasAccess('Transaction', 'export_data') && (
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <DollarSign className="text-blue-600 w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Order</p>
              <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
            </div>
            <div>
              <FileText className="text-blue-600 w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lunas</p>
              <p className="text-2xl font-bold text-blue-700">{completedPayments}</p>
            </div>
            <div>
              <CheckSquare className="text-blue-600 w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari orderan atau customer..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Kemarin</Button>
          <Button variant="outline" size="sm">Minggu ini</Button>
          <Button variant="outline" size="sm">Bulan Lalu</Button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Pembayaran ({filteredTransactions.length})
          </h3>
        </div>
        <DataTable
          data={filteredTransactions}
          columns={columns}
          loading={isLoading}
          emptyMessage="Tidak ada pembayaran yang ditemukan"
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
            // Convert product code to product name if needed (for backward compatibility)
            const product = products?.find(p => p.kode === item.item_name);
            const displayName = product?.nama || item.item_name; // Use product name if found, otherwise use existing value
            
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

export default TransactionPage;

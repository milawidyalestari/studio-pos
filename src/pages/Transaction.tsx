import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/common/DataTable';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { supabase } from '@/integrations/supabase/client';
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
  Printer
} from 'lucide-react';
import { OrderWithItems } from '@/types';

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
  const { orders = [], isLoading, refetch } = useOrders();
  const { data: paymentTypes = [] } = usePaymentTypes();
  const [searchTerm, setSearchTerm] = useState('');
  const [localReceipt, setLocalReceipt] = useState<Record<string, boolean>>({});

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
        total_amount: totalOrder,
        payment_type: paymentTypeMap[order.payment_type as string] || '-',
        status_pembayaran: statusPembayaran,
        receipt_printed: (order as any).receipt_printed || false,
        order_status_name: order.order_statuses?.name || '',
      };
    })
    .filter(t => t.down_payment > 0 || t.pelunasan > 0 || t.order_status_name === 'Selesai-Diambil');

  // Filter berdasarkan search term
  const filteredTransactions = paymentTransactions.filter(transaction =>
    transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Update receipt_printed di database
    await supabase
      .from('orders')
      .update({ receipt_printed: true })
      .eq('id', orderId);
    // Update state lokal agar badge langsung berubah
    setLocalReceipt(prev => ({ ...prev, [orderId]: true }));
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
      key: 'pelunasan',
      label: 'Pelunasan',
      render: value => <span className="font-semibold text-green-500">{formatCurrency(Number(value))}</span>
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
  const totalRevenue = paymentTransactions.reduce((sum, t) => sum + t.down_payment + t.pelunasan, 0);
  const totalOrders = paymentTransactions.length;
  const completedPayments = paymentTransactions.filter(t => 
    (t.down_payment + t.pelunasan) >= t.total_amount
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pembayaran</h1>
          <p className="text-gray-600">Lihat riwayat pembayaran dari semua orderan</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Order</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lunas</p>
              <p className="text-2xl font-bold text-purple-600">{completedPayments}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-purple-600 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          ✅ {paymentTransactions.length} transaksi pembayaran berhasil dimuat dari database
        </p>
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
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
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
    </div>
  );
};

export default TransactionPage;

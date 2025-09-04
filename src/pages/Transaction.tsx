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
  CheckSquare,
  AlertCircle,
  CreditCard,
  Users,
  AlertTriangle,
  CreditCard as CreditCardIcon,
  X,
  XCircle
} from 'lucide-react';
import { OrderWithItems } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useHasAccess } from '@/context/RoleAccessContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
  receipt_printed: boolean;
}

const TransactionPage = () => {
  const hasAccess = useHasAccess();
  const { orders = [], isLoading, refetch } = useOrders({ enableAutoRefresh: false });
  const { data: paymentTypes = [] } = usePaymentTypes();
  const { data: products } = useProducts();
  const [activeTab, setActiveTab] = useState('transactions');
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
  const [showPelunasanModal, setShowPelunasanModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [pelunasanAmount, setPelunasanAmount] = useState<number>(0);
  const [pelunasanNote, setPelunasanNote] = useState<string>('');
  const [customerOrders, setCustomerOrders] = useState<PiutangData[]>([]);

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

  // Mapping semua order menjadi data transaksi
  const allTransactionData = (orders as OrderWithMaybePelunasan[])
    .map(order => {
      const uangMuka = order.down_payment || 0;
      const pelunasan = order.pelunasan || 0;
      const totalOrder = order.total_amount || 0;
      const sisaPembayaran = totalOrder - (uangMuka + pelunasan);
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
        remaining_payment: sisaPembayaran,
        total_amount: totalOrder,
        payment_type: paymentTypeMap[order.payment_type as string] || '-',
        status_pembayaran: statusPembayaran,
        receipt_printed: (order as any).receipt_printed || false,
        order_status_name: order.order_statuses?.name || '',
      };
    });

  // Filter untuk transaksi yang sudah ada pembayaran atau status selesai
  const paymentTransactions = allTransactionData.filter(t =>
    // Hanya tampilkan orderan yang sudah melakukan pembayaran (DP atau Pelunasan)
    // ATAU orderan yang berstatus Done/Selesai-Diambil
    // ATAU orderan yang notanya sudah tercetak
    (t.down_payment > 0 || t.pelunasan > 0) ||
    t.order_status_name === 'Done' ||
    t.order_status_name === 'Selesai-Diambil' ||
    t.receipt_printed === true
  );

  // Filter untuk piutang (order yang memenuhi kriteria piutang) - dikelompokkan per customer
  // Hanya menampilkan orderan dengan kondisi:
  // 1. Status pembayaran "belum lunas" (not fully paid)
  // 2. Status pembayaran "belum bayar" (not paid)
  // 3. Status nota "Sudah di print" (already printed) / TRUE
  const piutangDataRaw = (orders as OrderWithMaybePelunasan[])
    .map(order => {
      // Pastikan semua nilai numerik valid dan tidak null/undefined
      const uangMuka = Number(order.down_payment) || 0;
      const pelunasan = Number(order.pelunasan) || 0;
      const totalOrder = Number(order.total_amount) || 0;
      
      // Validasi bahwa totalOrder > 0 untuk menghindari NaN
      if (totalOrder <= 0) {
        console.warn(`Order ${order.order_number} memiliki total_amount invalid:`, order.total_amount);
        return null;
      }
      
      const sisaPembayaran = Math.max(0, totalOrder - (uangMuka + pelunasan));
      
      // Hitung hari keterlambatan dengan validasi tanggal
      let daysDiff = 0;
      try {
        const orderDate = new Date(order.tanggal);
        if (!isNaN(orderDate.getTime())) {
          const today = new Date();
          daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      } catch (error) {
        console.warn(`Order ${order.order_number} memiliki tanggal invalid:`, order.tanggal);
      }
      
      let statusPembayaran = 'Belum Dibayar';
      if (uangMuka === 0 && pelunasan === 0) statusPembayaran = 'Belum Dibayar';
      else if (uangMuka + pelunasan < totalOrder) statusPembayaran = 'Belum Lunas';
      else if (uangMuka + pelunasan >= totalOrder) statusPembayaran = 'Lunas';

      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name || '-',
        customer_whatsapp: (order as any).customer_whatsapp,
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
        days_overdue: daysDiff,
        receipt_printed: (order as any).receipt_printed || false
      };tgyyyyyyyyyyyyyyyyyyyyyyyyyyy
    })
    .filter(order => {
      // Filter out order yang null atau invalid
      if (!order) return false;
      
      // HANYA tampilkan order yang BELUM LUNAS (masih ada sisa pembayaran)
      // Customer yang sudah lunas tidak akan masuk ke daftar piutang
      const isPaymentNotFullyPaid = order.status_pembayaran === 'Belum Lunas' || order.status_pembayaran === 'Belum Dibayar';
      
      // Orderan harus memenuhi kriteria: masih ada sisa pembayaran
      return isPaymentNotFullyPaid && order.total_amount > 0;
    });

  // Kelompokkan piutang berdasarkan customer
  const piutangDataGrouped = piutangDataRaw.reduce((acc, order) => {
    const customerName = order.customer_name;
    
    if (!acc[customerName]) {
      acc[customerName] = {
        customer_name: customerName,
        customer_whatsapp: order.customer_whatsapp,
        total_piutang: 0,
        total_orders: 0,
        orders: [],
        max_days_overdue: 0,
        total_down_payment: 0,
        total_pelunasan: 0
      };
    }
    
    // Pastikan semua nilai numerik valid sebelum melakukan operasi matematika
    const remainingPayment = Number(order.remaining_payment) || 0;
    const downPayment = Number(order.down_payment) || 0;
    const pelunasan = Number(order.pelunasan) || 0;
    const daysOverdue = Number(order.days_overdue) || 0;
    
    acc[customerName].total_piutang += remainingPayment;
    acc[customerName].total_orders += 1;
    acc[customerName].orders.push(order);
    acc[customerName].max_days_overdue = Math.max(acc[customerName].max_days_overdue, daysOverdue);
    acc[customerName].total_down_payment += downPayment;
    acc[customerName].total_pelunasan += pelunasan;
    
    return acc;
  }, {} as Record<string, any>);

  // Convert ke array untuk DataTable
  const piutangData: any[] = Object.values(piutangDataGrouped);

  // Filter berdasarkan search term untuk transaksi
  const filteredTransactions = paymentTransactions.filter(transaction => {
    // Filter berdasarkan search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        transaction.customer_name.toLowerCase().includes(searchLower) ||
        transaction.order_number.toLowerCase().includes(searchLower) ||
        transaction.payment_type.toLowerCase().includes(searchLower) ||
        transaction.status_pembayaran.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filter berdasarkan field filter
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

  // Filter berdasarkan search term untuk piutang
  const filteredPiutang = piutangData.filter(customer => {
    // Filter berdasarkan search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        customer.customer_name.toLowerCase().includes(searchLower) ||
        (customer.customer_whatsapp && customer.customer_whatsapp.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Filter berdasarkan status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'overdue' && customer.max_days_overdue <= 7) return false;
      if (selectedStatus === 'overdue' && customer.max_days_overdue > 7) return true;
      if (selectedStatus === 'recent' && customer.max_days_overdue <= 7) return true;
      return false;
    }

    // Filter berdasarkan field lain (tidak termasuk tanggal karena sudah dikelompokkan)
    if (filterField !== 'tanggal') {
      const fieldValue = (customer[filterField] || '').toString().toLowerCase();
      return !filterValue || fieldValue.includes(filterValue.toLowerCase());
    }
    
    return true;
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

  // Handler untuk membuka modal pelunasan
  const handleOpenPelunasanModal = (customerName: string) => {
    setSelectedCustomer(customerName);
    
    // Filter orderan berdasarkan customer dari data mentah (orders), bukan dari piutangData yang sudah di-aggregate
    const customerOrderList = (orders as OrderWithMaybePelunasan[])
      .filter(order => order.customer_name === customerName)
      .map(order => {
        // Pastikan semua nilai numerik valid dan tidak null/undefined
        const uangMuka = Number(order.down_payment) || 0;
        const pelunasan = Number(order.pelunasan) || 0;
        const totalOrder = Number(order.total_amount) || 0;
        
        // Validasi bahwa totalOrder > 0 untuk menghindari NaN
        if (totalOrder <= 0) {
          console.warn(`Order ${order.order_number} memiliki total_amount invalid:`, order.total_amount);
          return null;
        }
        
        const sisaPembayaran = Math.max(0, totalOrder - (uangMuka + pelunasan));
        
        // Hitung hari keterlambatan dengan validasi tanggal
        let daysDiff = 0;
        try {
          const orderDate = new Date(order.tanggal);
          if (!isNaN(orderDate.getTime())) {
            const today = new Date();
            daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          }
        } catch (error) {
          console.warn(`Order ${order.order_number} memiliki tanggal invalid:`, order.tanggal);
        }
        
        let statusPembayaran = 'Belum Dibayar';
        if (uangMuka === 0 && pelunasan === 0) statusPembayaran = 'Belum Dibayar';
        else if (uangMuka + pelunasan < totalOrder) statusPembayaran = 'Belum Lunas';
        else if (uangMuka + pelunasan >= totalOrder) statusPembayaran = 'Lunas';

        return {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name || '-',
          customer_whatsapp: (order as any).customer_whatsapp,
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
          days_overdue: daysDiff,
          receipt_printed: (order as any).receipt_printed || false,
          order_items: (order as any).order_items || [] // Tambahkan order_items
        };
      })
      .filter(order => {
        // Filter out order yang null atau invalid
        if (!order) return false;
        
        // HANYA tampilkan order yang BELUM LUNAS (masih ada sisa pembayaran)
        // Customer yang sudah lunas tidak akan masuk ke daftar piutang
        const isPaymentNotFullyPaid = order.status_pembayaran === 'Belum Lunas' || order.status_pembayaran === 'Belum Dibayar';
        
        // Orderan harus memenuhi kriteria: masih ada sisa pembayaran
        return isPaymentNotFullyPaid && order.total_amount > 0;
      });
    
    setCustomerOrders(customerOrderList);
    
    // Hitung total sisa pembayaran dengan validasi
    const totalRemaining = customerOrderList.reduce((sum, order) => {
      const remaining = Number(order.remaining_payment) || 0;
      return sum + remaining;
    }, 0);
    
    // Pastikan nilai valid sebelum set state
    if (!isNaN(totalRemaining) && totalRemaining >= 0) {
      setPelunasanAmount(totalRemaining);
    } else {
      console.warn('Total remaining payment invalid:', totalRemaining);
      setPelunasanAmount(0);
    }
    
    setShowPelunasanModal(true);
  };

  // Handler untuk submit pelunasan
  const handleSubmitPelunasan = async () => {
    try {
      // Update pelunasan untuk semua orderan customer
      for (const order of customerOrders) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            pelunasan: (order.pelunasan || 0) + order.remaining_payment,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', order.id);
          
        if (error) {
          console.error(`Error updating order ${order.order_number}:`, error);
          return;
        }
      }
      
      // Reset form dan close modal
      setShowPelunasanModal(false);
      setSelectedCustomer('');
      setPelunasanAmount(0);
      setPelunasanNote('');
      setCustomerOrders([]);
      
      // Refresh data
      refetch();
      
      // Tampilkan notifikasi sukses
      alert('Pelunasan berhasil disimpan!');
    } catch (error) {
      console.error('Error in handleSubmitPelunasan:', error);
      alert('Terjadi kesalahan saat menyimpan pelunasan');
    }
  };

  // Columns untuk transaksi
  // Menampilkan orderan yang sudah melakukan pembayaran (DP/Pelunasan)
  // atau berstatus Done/Selesai-Diambil atau notanya sudah tercetak
  const transactionColumns: Column<typeof paymentTransactions[0]>[] = [
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

  // Columns untuk piutang (dikelompokkan per customer)
  // Menampilkan orderan yang memenuhi kriteria piutang:
  // - Status Done, Proses Cetak, Export, Selesai-Diambil
  // - Atau yang sudah melakukan pembayaran (Uang Muka/Pelunasan)
  const piutangColumns: Column<any>[] = [
    {
      key: 'customer_name',
      label: 'Nama Customer',
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
      key: 'total_piutang',
      label: 'Total Piutang',
      render: (value, row) => {
        const isOverdue = row.max_days_overdue > 7;
        return (
          <div className="flex flex-col">
            <span className={`font-bold text-lg ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
              {formatCurrency(Number(value))}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs mt-1">
                {row.max_days_overdue} hari
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'total_orders',
      label: 'Jumlah Orderan',
      render: (value) => (
        <div className="text-center">
          <span className="font-bold text-blue-600 text-lg">{value}</span>
          <div className="text-xs text-gray-500">Orderan</div>
        </div>
      )
    },
    {
      key: 'total_down_payment',
      label: 'Total Uang Muka',
      render: value => (
        <span className="font-semibold text-green-700">{formatCurrency(Number(value))}</span>
      )
    },
    {
      key: 'max_days_overdue',
      label: 'Umur Piutang',
      render: (value) => {
        const days = Number(value);
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
            variant="default"
            onClick={() => handleOpenPelunasanModal(row.customer_name)}
            className="h-9 px-3 text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
          >
            <CreditCardIcon className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleRefresh = () => {
    console.log('Refreshing transactions...');
    refetch();
  };

  // Hitung total statistik untuk transaksi
  const totalRevenue = paymentTransactions.reduce((sum, t) => sum + t.down_payment + t.remaining_payment, 0);
  const totalOrders = paymentTransactions.length;
  
  // Hitung orderan berdasarkan status pembayaran
  const completedPayments = paymentTransactions.filter(t => 
    t.status_pembayaran === 'Lunas'
  ).length;
  
  const incompletePayments = paymentTransactions.filter(t => 
    t.status_pembayaran === 'Belum Lunas'
  ).length;
  
  const unpaidOrders = paymentTransactions.filter(t => 
    t.status_pembayaran === 'Belum Dibayar'
  ).length;

  // Hitung total statistik untuk piutang (dikelompokkan per customer)
  const totalPiutang = piutangData.reduce((sum, customer) => sum + customer.total_piutang, 0);
  const totalPiutangOrders = piutangData.reduce((sum, customer) => sum + customer.total_orders, 0);
  const overdueOrders = piutangData.filter(customer => customer.max_days_overdue > 7).length;
  const recentOrders = piutangData.filter(customer => customer.max_days_overdue <= 7).length;

  const isFilterActive =
    (filterField === 'tanggal' && (
      (dateMode === 'single' && singleDate) ||
      (dateMode === 'range' && range.from && range.to)
    )) ||
    (filterField !== 'tanggal' && filterValue.trim() !== '') ||
    (activeTab === 'piutang' && selectedStatus !== 'all');

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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Transaksi & Piutang</h1>
              <p className="text-gray-600">Kelola pembayaran dan piutang customer</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {[
              { id: 'transactions', label: 'Semua Transaksi', icon: FileText },
              { id: 'piutang', label: 'Piutang', icon: CreditCard }
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
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 ">
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
              <div className="mb-3 font-semibold text-sm">
                Filter {activeTab === 'transactions' ? 'Transaksi' : 'Piutang'}
              </div>
              
              {/* Status Filter untuk Piutang */}
              {activeTab === 'piutang' && (
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
              )}

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
                    {activeTab === 'transactions' && (
                      <>
                        <SelectItem value="status_pembayaran">Status Pembayaran</SelectItem>
                        <SelectItem value="payment_type">Metode</SelectItem>
                      </>
                    )}
                    {activeTab === 'piutang' && (
                      <SelectItem value="order_status">Status Order</SelectItem>
                    )}
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
                    setSearchTerm('');
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
          
          {hasAccess('Transaction', 'export_data') && (
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Statistik Transaksi */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Total semua pembayaran</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Order</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">Order dengan pembayaran</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orderan Lunas</CardTitle>
                <CheckSquare className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{completedPayments}</div>
                <p className="text-xs text-muted-foreground">Jumlah orderan yang telah lunas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orderan Belum Lunas</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{incompletePayments}</div>
                <p className="text-xs text-muted-foreground">Jumlah orderan yang belum lunas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Belum Dibayar</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unpaidOrders}</div>
                <p className="text-xs text-muted-foreground">Jumlah orderan yang belum dibayar</p>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar Transaksi */}
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
              columns={transactionColumns}
              loading={isLoading}
              emptyMessage="Tidak ada pembayaran yang ditemukan"
            />
          </div>
        </div>
        )}

        {/* Tab Content - Piutang */}
        {activeTab === 'piutang' && (
        <div className="space-y-6">
          {/* Statistik Piutang */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPiutang)}</div>
                <p className="text-xs text-muted-foreground">Total sisa pembayaran orderan piutang</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Order</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalPiutangOrders}</div>
                <p className="text-xs text-muted-foreground">Order memenuhi kriteria piutang</p>
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

          {/* Search Bar Piutang */}
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
            </div>
            <DataTable
              data={filteredPiutang}
              columns={piutangColumns}
              loading={isLoading}
              emptyMessage="Tidak ada piutang yang ditemukan"
            />
          </div>
        </div>
        )}
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

      {/* Modal Pelunasan */}
      <Dialog open={showPelunasanModal} onOpenChange={setShowPelunasanModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-green-600" />
              Aksi Pelunasan - {selectedCustomer}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Ringkasan Orderan Customer */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Ringkasan Orderan Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{customerOrders.length}</div>
                  <div className="text-sm text-gray-600">Total Orderan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(customerOrders.reduce((sum, order) => {
                      const remaining = Number(order.remaining_payment) || 0;
                      return sum + remaining;
                    }, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Sisa Pembayaran</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(customerOrders.reduce((sum, order) => {
                      const downPayment = Number(order.down_payment) || 0;
                      return sum + downPayment;
                    }, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Uang Muka</div>
                </div>
              </div>
            </div>

            {/* Daftar Pembelian */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Daftar Pembelian</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">No Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Item</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sub Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customerOrders.flatMap((order) => {
                      // Ambil order items dari order
                      const orderItems = (order as any).order_items || [];
                      
                      // Jika tidak ada order items, tampilkan order sebagai satu baris
                      if (orderItems.length === 0) {
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {order.tanggal ? formatDate(order.tanggal) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">-</td>
                            <td className="px-4 py-3 text-sm text-gray-700">-</td>
                            <td className="px-4 py-3 text-sm font-bold text-blue-600">{formatCurrency(Number(order.total_amount) || 0)}</td>
                          </tr>
                        );
                      }
                      
                      // Jika ada order items, tampilkan setiap item sebagai baris terpisah
                      return orderItems.map((item: any, index: number) => (
                        <tr key={`${order.id}-${item.id || index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {order.tanggal ? formatDate(order.tanggal) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.item_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-600">{formatCurrency(Number(item.sub_total) || 0)}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Total Sub Total:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">
                        {formatCurrency(
                          customerOrders.reduce((total, order) => {
                            const orderItems = (order as any).order_items || [];
                            if (orderItems.length === 0) {
                              return total + (Number(order.total_amount) || 0);
                            }
                            return total + orderItems.reduce((itemTotal: number, item: any) => {
                              return itemTotal + (Number(item.sub_total) || 0);
                            }, 0);
                          }, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Form Pelunasan */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Form Pelunasan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pelunasanAmount">Jumlah Pelunasan</Label>
                  <Input
                    id="pelunasanAmount"
                    type="number"
                    value={pelunasanAmount}
                    onChange={(e) => setPelunasanAmount(Number(e.target.value))}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jumlah ini akan dibayarkan untuk semua orderan customer
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="pelunasanNote">Catatan Pelunasan</Label>
                  <Textarea
                    id="pelunasanNote"
                    value={pelunasanNote}
                    onChange={(e) => setPelunasanNote(e.target.value)}
                    className="mt-1"
                    placeholder="Catatan tambahan untuk pelunasan..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPelunasanModal(false)}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Batal
              </Button>
              <Button
                onClick={handleSubmitPelunasan}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <CreditCardIcon className="w-4 h-4" />
                Simpan Pelunasan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionPage;

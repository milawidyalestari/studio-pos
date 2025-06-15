
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/common/DataTable';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { 
  Download,
  FileDown,
  RefreshCw,
  Search,
  SlidersHorizontal
} from 'lucide-react';

const TransactionPage = () => {
  const { data: transactions = [], isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction =>
    transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
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

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'Kode Transaksi',
      width: '180px',
      render: (value) => (
        <div className="font-mono text-sm">
          <span className="font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-md border">
            {String(value).slice(0, 8).toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'customer_name',
      label: 'Nama Customer',
      width: '250px',
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value || 'N/A'}</span>
          <span className="text-xs text-gray-500">Customer</span>
        </div>
      )
    },
    {
      key: 'transaction_date',
      label: 'Tanggal Selesai',
      width: '160px',
      render: (value) => (
        <div className="text-center">
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
            {formatDate(value)}
          </span>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Total Harga',
      width: '180px',
      render: (value) => (
        <div className="text-right">
          <span className="font-bold text-lg text-[#0050C8] bg-blue-50 px-3 py-1 rounded-md">
            {formatCurrency(Number(value))}
          </span>
        </div>
      )
    },
    {
      key: 'payment_method',
      label: 'Metode Pembayaran',
      width: '160px',
      render: (value) => (
        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === 'cash' ? 'bg-green-100 text-green-700' :
            value === 'transfer' ? 'bg-blue-100 text-blue-700' :
            value === 'credit' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {value === 'cash' ? 'Tunai' :
             value === 'transfer' ? 'Transfer' :
             value === 'credit' ? 'Kredit' :
             value || 'Tunai'}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Lihat riwayat transaksi yang telah selesai</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari transaksi..." 
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
            Daftar Transaksi ({filteredTransactions.length})
          </h3>
        </div>
        <DataTable
          data={filteredTransactions}
          columns={columns}
          loading={isLoading}
          emptyMessage="Tidak ada transaksi yang ditemukan"
        />
      </div>
    </div>
  );
};

export default TransactionPage;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download,
  FileDown,
  RefreshCw,
  Search,
  SlidersHorizontal
} from 'lucide-react';

const Transaction = () => {
  const transactions = [
    { id: '009274', customer: 'Anna Aliaksei', date: '12/04/25', estimatedDate: '14/04/25', status: 'Cek File', category: 'Sticker', total: '2,000,000' },
    { id: '009275', customer: 'Kovonk', date: '13/04/25', estimatedDate: '15:00 13/04/25', status: 'Cek File', category: 'Sticker', total: '76,000' },
    { id: '009276', customer: 'Bagus', date: '13/04/25', estimatedDate: '13/04/25', status: 'Desain', category: 'Spanduk', total: '20,000' },
    { id: '009277', customer: 'Ajunk', date: '13/04/25', estimatedDate: '18/04/25', status: 'Desain', category: 'Spanduk', total: '80,000' },
    { id: '009278', customer: 'Anny Mas', date: '13/04/25', estimatedDate: '15:00 13/04/25', status: 'Desain', category: 'Sticker', total: '150,000' },
    { id: '009279', customer: 'Kedai Kota', date: '13/04/25', estimatedDate: '13/04/25', status: 'Konfirmasi', category: 'X-Banner', total: '80,000' },
    { id: '009280', customer: 'Jambe Pedas', date: '13/04/25', estimatedDate: '13/04/25', status: 'Desain', category: 'Sticker', total: '15,000' },
    { id: '009281', customer: 'Rahwana', date: '14/04/25', estimatedDate: '15/04/25', status: 'Cek File', category: 'Spanduk', total: '35,000' },
    { id: '009282', customer: 'Bunga', date: '14/04/25', estimatedDate: '14/04/25', status: 'Desain', category: 'Spanduk', total: '80,000' },
    { id: '009283', customer: 'Peterkantropus', date: '14/04/25', estimatedDate: '18/04/25', status: 'Konfirmasi', category: 'Spanduk', total: '90,000' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction</h1>
          <p className="text-gray-600">View and manage all transactions</p>
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
            <Input placeholder="Search transactions..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Kemarin</Button>
          <Button variant="outline" size="sm">Minggu ini</Button>
          <Button variant="outline" size="sm">Bulan Lalu</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.estimatedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">
                    IDR {transaction.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
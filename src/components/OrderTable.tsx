
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'Design' | 'Cek File' | 'Konfirmasi' | 'Export' | 'Done' | 'Proses Cetak';
  date: string;
  estimatedDate: string;
}

interface OrderTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onOrderClick?: (order: Order) => void;
}

const OrderTable = ({ orders, onUpdateStatus, onOrderClick }: OrderTableProps) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Design': return 'bg-purple-100 text-purple-800';
      case 'Cek File': return 'bg-blue-100 text-blue-800';
      case 'Konfirmasi': return 'bg-yellow-100 text-yellow-800';
      case 'Export': return 'bg-orange-100 text-orange-800';
      case 'Proses Cetak': return 'bg-indigo-100 text-indigo-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'Design': return 'Cek File';
      case 'Cek File': return 'Konfirmasi';
      case 'Konfirmasi': return 'Export';
      case 'Export': return 'Proses Cetak';
      case 'Proses Cetak': return 'Done';
      case 'Done': return null;
      default: return null;
    }
  };

  const handleRowClick = (order: Order) => {
    if (onOrderClick) {
      onOrderClick(order);
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              
              return (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {nextStatus && (
                        <Button 
                          size="sm" 
                          className="bg-[#0050C8] hover:bg-[#003a9b]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(order.id, nextStatus);
                          }}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;

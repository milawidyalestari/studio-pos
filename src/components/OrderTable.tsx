import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { OrderWithItems } from '@/types';
import { formatCurrency } from '@/services/masterData';

type OrderStatus = OrderWithItems['status'];

interface OrderTableProps {
  orders: OrderWithItems[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick?: (order: OrderWithItems) => void;
  onEditOrder?: (order: OrderWithItems) => void;
}

const OrderTable = ({ orders, onUpdateStatus, onOrderClick, onEditOrder }: OrderTableProps) => {
  const getStatusColor = (status: OrderStatus) => {
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

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
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

  const handleRowClick = (order: OrderWithItems) => {
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.order_items?.map(item => item.item_name).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">{formatCurrency(order.total_amount || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.tanggal).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditOrder) onEditOrder(order);
                        }}
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

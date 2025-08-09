import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { OrderWithItems } from '@/types';
import { formatCurrency } from '@/services/masterData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type OrderStatus = string;

interface OrderTableProps {
  orders: OrderWithItems[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick?: (order: OrderWithItems) => void;
  onEditOrder?: (order: OrderWithItems) => void;
  onDeleteOrder?: (orderId: string) => void;
}

const OrderTable = ({ orders, onUpdateStatus, onOrderClick, onEditOrder, onDeleteOrder }: OrderTableProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, order: OrderWithItems) => {
    e.stopPropagation();
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete && onDeleteOrder) {
      onDeleteOrder(orderToDelete.id);
    }
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Design': return 'bg-purple-100 text-purple-800';
      case 'Cek File': return 'bg-blue-100 text-blue-800';
      case 'Revisi': return 'bg-orange-100 text-orange-800';
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
      case 'Revisi': return 'Export';
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Orderan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Order</th>
              <th className="pl-14 py-3  text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              const currentStatus = order.order_statuses?.name || 'Design';
              const nextStatus = getNextStatus(currentStatus);
              
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
                    <Badge className={getStatusColor(currentStatus)}>
                      {currentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.tanggal).toLocaleDateString('id-ID', {
                    timeZone: 'Asia/Kuala_Lumpur',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}</td>
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(e, order)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Order</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus order ini? 
              <br />
              <strong>Order #{orderToDelete?.order_number}</strong> - <strong>{orderToDelete?.customer_name}</strong>
              <br />
              <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => { e.stopPropagation(); handleCancelDelete(); }}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.stopPropagation(); handleConfirmDelete(); }}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderTable;

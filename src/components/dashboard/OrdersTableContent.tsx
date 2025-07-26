import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { formatCurrency } from '@/services/productPricing';
import type { OrderWithItems } from '@/types';
import type { Database } from '@/integrations/supabase/types';
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItemsExtended extends OrderWithItems {
  order_statuses?: { id: number; name: string };
  admin?: { id: string; nama: string };
  desainer?: { id: string; nama: string };
}

interface OrdersTableContentProps {
  orders: OrderWithItemsExtended[];
}

const OrdersTableContent: React.FC<OrdersTableContentProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'desain': return 'bg-yellow-100 text-yellow-800';
      case 'konfirmasi': return 'bg-blue-100 text-blue-800';
      case 'cek file': return 'bg-green-100 text-green-800';
      case 'revisi': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItemsExtended | null>(null);

  const handleRowClick = (order: OrderWithItemsExtended) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  return (
    <>
      <ScrollArea className="h-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Desainer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(order)}>
                <TableCell className="font-medium">{order.customer_name || '-'}</TableCell>
                <TableCell>{order.tanggal ? new Date(order.tanggal).toLocaleDateString('id-ID') : '-'}</TableCell>
                <TableCell>{order.estimasi || '-'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.order_statuses?.name || '-')}>
                    {order.order_statuses?.name || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{order.desainer?.nama || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div><b>Customer:</b> {selectedOrder.customer_name || '-'}</div>
                <div><b>Tanggal:</b> {selectedOrder.tanggal ? new Date(selectedOrder.tanggal).toLocaleDateString('id-ID') : '-'}</div>
                <div><b>Deadline:</b> {selectedOrder.estimasi || '-'}</div>
                <div><b>Status:</b> {selectedOrder.order_statuses?.name || '-'}</div>
                <div><b>Total:</b> {formatCurrency(selectedOrder.total_amount || 0)}</div>
                <div><b>Admin:</b> {selectedOrder.admin?.nama || '-'}</div>
                <div><b>Desainer:</b> {selectedOrder.desainer?.nama || '-'}</div>
                <div><b>Catatan:</b> {selectedOrder.notes || '-'}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Daftar Item Order</h4>
                <div className="border rounded-lg max-h-48 overflow-auto">
                  <div className="grid grid-cols-6 gap-1 text-xs font-semibold border-b p-2 bg-gray-50">
                    <span>No</span>
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Sub Total</span>
                    <span>Bahan</span>
                    <span>Finishing</span>
                  </div>
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item: OrderItem, idx: number) => (
                      <div key={item.id || idx} className="grid grid-cols-6 gap-1 text-xs py-2 px-2 border-b">
                        <span>{idx + 1}</span>
                        <span className="truncate" title={item.item_name}>{item.item_name}</span>
                        <span>{item.quantity}</span>
                        <span className="text-green-600 font-semibold">{formatCurrency(item.sub_total || 0)}</span>
                        <span>{item.bahan || '-'}</span>
                        <span>{item.finishing || '-'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-gray-500">Tidak ada item order.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersTableContent;

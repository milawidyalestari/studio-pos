import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Grid, List } from 'lucide-react';
import { DropResult } from 'react-beautiful-dnd';
import RequestOrderModal from '@/components/RequestOrderModal';
import KanbanBoard from '@/components/KanbanBoard';
import OrderTable from '@/components/OrderTable';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/services/masterData';
import { useToast } from '@/hooks/use-toast';
import { deleteOrderFromDatabase } from '@/services/deleteOrderService';
import { Order, OrderWithItems, Employee } from '@/types';
import { supabase } from '@/integrations/supabase/client';
// FIX: Temporarily comment out or remove the import that causes an error if the module does not exist
// import { getStatusIdByName } from '@/utils/getStatusId';

const Orderan = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const { orders: dbOrders, isLoading, updateOrder, deleteOrder } = useOrders();
  const orders = dbOrders || [];
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  React.useEffect(() => {
    supabase
      .from('employees')
      .select('id, nama')
      .then(({ data }) => {
        setEmployees(data || []);
      });
  }, []);

  const handleOrderModalSubmit = (orderData: object) => {
    // The order is automatically saved through the RequestOrderModal using useOrders hook
    // The order list will automatically refresh due to React Query invalidation
    console.log('Order submitted:', orderData);
  };

  const updateOrderStatus = async (orderId: string, status_id: string) => {
    try {
      // Cari order lama dari state
      const oldOrder = orders.find(order => order.id === orderId);
      if (!oldOrder) throw new Error('Order not found');

      // Kirim order_items lama ke parameter items
      await updateOrder({
        orderId,
        orderData: { status_id: parseInt(status_id) },
        items: oldOrder.order_items || [],
      });
      // toast({
      //   title: 'Status Updated',
      //   description: `Order status changed`,
      // });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    console.log(`Drag ended: moving order ${draggableId} to ${newStatus}`);
    
    // The updateOrderStatus will be called by the KanbanBoard component
  };

  const handleOrderClick = (order: OrderWithItems) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (order: OrderWithItems) => {
    setEditingOrder(order);
    setShowRequestModal(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
  };

  const handleModalClose = () => {
    setShowRequestModal(false);
    setEditingOrder(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white mb-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Orderan</h1>
          <p className="text-gray-600">Manage customer orders and requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              className="pl-10 w-80"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
            >
              <Grid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
          <Button 
            onClick={() => setShowRequestModal(true)}
            className="bg-[#0050C8] hover:bg-[#003a9b]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">No orders found</p>
            <p className="text-gray-400">Create your first order to get started</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'kanban' ? (
            <KanbanBoard 
              orders={orders} 
              onDragEnd={handleDragEnd} 
              onOrderClick={handleOrderClick}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onUpdateOrderStatus={updateOrderStatus}
              employees={employees}
            />
          ) : (
            <OrderTable orders={orders} onUpdateStatus={updateOrderStatus} onOrderClick={handleOrderClick} onEditOrder={handleEditOrder} />
          )}
        </>
      )}

      <RequestOrderModal
        open={showRequestModal}
        onClose={handleModalClose}
        onSubmit={handleOrderModalSubmit}
        editingOrder={editingOrder as any}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">Customer:</label>
                <p>
                  {selectedOrder.customer_name ||
                    selectedOrder.customer?.name ||
                    selectedOrder.customer_id ||
                    'Unknown'}
                </p>
              </div>
              <div>
                <label className="font-semibold">Items:</label>
                <div className="space-y-1">
                  {(selectedOrder.order_items || []).map((orderItem: any, index: number) => (
                    <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                      {orderItem.item_name || orderItem.name || orderItem.title || 'Unknown Item'}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold">Total:</label>
                <p className="text-[#0050C8] font-semibold">{selectedOrder.total}</p>
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <p className="capitalize">{selectedOrder.order_statuses?.name || selectedOrder.status_id}</p>
              </div>
              <div>
                <label className="font-semibold">Order Date:</label>
                <p>{selectedOrder.date}</p>
              </div>
              <div>
                <label className="font-semibold">Estimated Date:</label>
                <p>{selectedOrder.estimatedDate}</p>
              </div>
              <div>
                <label className="font-semibold">Admin:</label>
                <p>
                  {selectedOrder.admin?.nama || 'Not assigned'}
                </p>
              </div>
              <div>
                <label className="font-semibold">Designer:</label>
                <p>
                  {selectedOrder.desainer?.nama || 'Not assigned'}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Orderan;
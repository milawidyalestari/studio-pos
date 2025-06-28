
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

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: string;
  date: string;
  estimatedDate: string;
  designer?: {
    name: string;
    avatar?: string;
    assignedBy?: string;
  };
}

const Orderan = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const { orders: dbOrders, isLoading } = useOrders();
  const { toast } = useToast();
  
  // Transform database orders to match UI format and merge with local state
  React.useEffect(() => {
    if (dbOrders) {
      const transformedOrders: Order[] = dbOrders.map((order, index) => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.customer_name || 'Unknown Customer',
        items: order.order_items?.map(item => item.item_name) || [],
        total: formatCurrency(order.total_amount || 0),
        status: order.status,
        date: new Date(order.tanggal).toLocaleDateString(),
        estimatedDate: order.estimasi || '',
        // Add sample designer data for demonstration (every other order has a designer assigned)
        designer: index % 2 === 0 ? {
          name: index % 4 === 0 ? 'Alex Chen' : 'Sarah Wilson',
          avatar: index % 4 === 0 ? '/lovable-uploads/04d2c4d6-1119-4b62-9672-b1f8bd3f7143.png' : undefined,
          assignedBy: 'Orbit'
        } : undefined
      }));
      
      setLocalOrders(transformedOrders);
    }
  }, [dbOrders]);

  const handleOrderModalSubmit = (orderData: any) => {
    // The order is automatically saved through the RequestOrderModal using useOrders hook
    // The order list will automatically refresh due to React Query invalidation
    console.log('Order submitted:', orderData);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log('Updating order status:', orderId, 'to', newStatus);
    
    // Update local state immediately for better UX
    setLocalOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );

    // TODO: Implement actual database update
    // For now, we'll just update the local state and show a success message
    try {
      // Here you would call your API to update the order status in the database
      // await updateOrderStatusInDatabase(orderId, newStatus);
      
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Revert local state on error
      setLocalOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: order.status } // revert to original status
            : order
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
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

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowRequestModal(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Remove from local state immediately for better UX
      setLocalOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      // Delete from database
      await deleteOrderFromDatabase(orderId);
      
      toast({
        title: "Order Deleted",
        description: "Order has been permanently deleted from the system",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      
      // If database delete fails, we need to refresh the data to restore the order in UI
      // The useOrders hook will automatically refetch the data
      toast({
        title: "Error",
        description: "Failed to delete order from database",
        variant: "destructive",
      });
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
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
      {localOrders.length === 0 ? (
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
              orders={localOrders} 
              onDragEnd={handleDragEnd} 
              onOrderClick={handleOrderClick}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onUpdateOrderStatus={updateOrderStatus}
            />
          ) : (
            <OrderTable orders={localOrders} onUpdateStatus={updateOrderStatus} onOrderClick={handleOrderClick} />
          )}
        </>
      )}

      <RequestOrderModal
        open={showRequestModal}
        onClose={handleModalClose}
        onSubmit={handleOrderModalSubmit}
        editingOrder={editingOrder}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">Customer:</label>
                <p>{selectedOrder.customer}</p>
              </div>
              <div>
                <label className="font-semibold">Items:</label>
                <div className="space-y-1">
                  {selectedOrder.items.map((item, index) => (
                    <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                      {item}
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
                <p className="capitalize">{selectedOrder.status}</p>
              </div>
              <div>
                <label className="font-semibold">Order Date:</label>
                <p>{selectedOrder.date}</p>
              </div>
              <div>
                <label className="font-semibold">Estimated Date:</label>
                <p>{selectedOrder.estimatedDate}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Orderan;

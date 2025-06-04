
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Grid, List } from 'lucide-react';
import { DropResult } from 'react-beautiful-dnd';
import RequestOrderModal from '@/components/RequestOrderModal';
import KanbanBoard from '@/components/KanbanBoard';
import OrderTable from '@/components/OrderTable';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'pending' | 'in-progress' | 'ready' | 'done';
  date: string;
  estimatedDate: string;
}

const Orderan = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: '#009461',
      customer: 'John Doe',
      items: ['Luster Banner', 'Business Cards'],
      total: 'IDR 125,000',
      status: 'pending',
      date: '2024-06-03',
      estimatedDate: '2024-06-05'
    },
    {
      id: '2',
      orderNumber: '#009462',
      customer: 'Jane Smith',
      items: ['HVS A3', 'Stickers'],
      total: 'IDR 15,000',
      status: 'in-progress',
      date: '2024-06-03',
      estimatedDate: '2024-06-04'
    },
    {
      id: '3',
      orderNumber: '#009463',
      customer: 'Bob Wilson',
      items: ['Banner'],
      total: 'IDR 20,000',
      status: 'ready',
      date: '2024-06-02',
      estimatedDate: '2024-06-03'
    }
  ]);

  const handleAddOrder = (orderData: any) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: orderData.orderNumber,
      customer: orderData.customer,
      items: orderData.items.map((item: any) => item.item).filter((item: string) => item),
      total: orderData.totalPrice || 'IDR 0',
      status: 'pending',
      date: orderData.tanggal,
      estimatedDate: orderData.estimasi
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as Order['status'];
    updateOrderStatus(draggableId, newStatus);
  };

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
      {viewMode === 'kanban' ? (
        <KanbanBoard orders={orders} onDragEnd={handleDragEnd} />
      ) : (
        <OrderTable orders={orders} onUpdateStatus={updateOrderStatus} />
      )}

      <RequestOrderModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleAddOrder}
      />
    </div>
  );
};

export default Orderan;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Grid, List, Edit } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import RequestOrderModal from '@/components/RequestOrderModal';

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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'done': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const kanbanColumns = [
    { status: 'pending' as const, title: 'Pending', orders: orders.filter(o => o.status === 'pending') },
    { status: 'in-progress' as const, title: 'In Progress', orders: orders.filter(o => o.status === 'in-progress') },
    { status: 'ready' as const, title: 'Ready', orders: orders.filter(o => o.status === 'ready') },
  ];

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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-6">
            {kanbanColumns.map((column) => (
              <div key={column.status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary">{column.orders.length}</Badge>
                </div>
                <Droppable droppableId={column.status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 min-h-[200px]"
                    >
                      {column.orders.map((order, index) => (
                        <Draggable key={order.id} draggableId={order.id} index={index}>
                          {(provided, snapshot) => (
                            <Card 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-grab hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm font-medium">{order.orderNumber}</CardTitle>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-gray-600 mb-2">{order.customer}</p>
                                <div className="space-y-1 mb-3">
                                  {order.items.map((item, index) => (
                                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-[#0050C8]">{order.total}</span>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
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
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        {order.status !== 'done' && (
                          <Button 
                            size="sm" 
                            className="bg-[#0050C8] hover:bg-[#003a9b]"
                            onClick={() => {
                              const nextStatus = order.status === 'pending' ? 'in-progress' : 
                                               order.status === 'in-progress' ? 'ready' : 'done';
                              updateOrderStatus(order.id, nextStatus);
                            }}
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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

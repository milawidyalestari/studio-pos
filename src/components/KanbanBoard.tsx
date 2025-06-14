
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import OrderCard from './OrderCard';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'desain' | 'cek-file' | 'konfirmasi' | 'tunggu-dp' | 'export' | 'done';
  date: string;
  estimatedDate: string;
  designer?: {
    name: string;
    avatar?: string;
    assignedBy?: string;
  };
}

interface KanbanBoardProps {
  orders: Order[];
  onDragEnd: (result: DropResult) => void;
  onOrderClick?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onRemoveOrder?: (orderId: string) => void;
}

const KanbanBoard = ({ orders, onDragEnd, onOrderClick, onEditOrder, onRemoveOrder }: KanbanBoardProps) => {
  const kanbanColumns = [
    { 
      status: 'desain' as const, 
      title: 'Desain', 
      orders: orders.filter(o => o.status === 'desain'),
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      status: 'cek-file' as const, 
      title: 'Cek File', 
      orders: orders.filter(o => o.status === 'cek-file'),
      color: 'bg-yellow-50 border-yellow-200'
    },
    { 
      status: 'konfirmasi' as const, 
      title: 'Konfirmasi', 
      orders: orders.filter(o => o.status === 'konfirmasi'),
      color: 'bg-orange-50 border-orange-200'
    },
    { 
      status: 'tunggu-dp' as const, 
      title: 'Tunggu DP', 
      orders: orders.filter(o => o.status === 'tunggu-dp'),
      color: 'bg-purple-50 border-purple-200'
    },
    { 
      status: 'export' as const, 
      title: 'Export', 
      orders: orders.filter(o => o.status === 'export'),
      color: 'bg-indigo-50 border-indigo-200'
    },
    { 
      status: 'done' as const, 
      title: 'Done', 
      orders: orders.filter(o => o.status === 'done'),
      color: 'bg-green-50 border-green-200'
    },
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-6 gap-4 overflow-x-auto">
        {kanbanColumns.map((column) => (
          <div key={column.status} className={`${column.color} rounded-lg p-3 border-2 min-w-[280px]`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.orders.length}
              </Badge>
            </div>
            <Droppable droppableId={column.status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] transition-colors ${
                    snapshot.isDraggingOver ? 'bg-white/50 rounded-lg' : ''
                  }`}
                >
                  {column.orders.map((order, index) => (
                    <Draggable key={order.id} draggableId={order.id} index={index}>
                      {(provided, snapshot) => (
                        <OrderCard 
                          order={order}
                          provided={provided}
                          snapshot={snapshot}
                          onOrderClick={onOrderClick}
                          onEditOrder={onEditOrder}
                          onRemoveOrder={onRemoveOrder}
                        />
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
  );
};

export default KanbanBoard;

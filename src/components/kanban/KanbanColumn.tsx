import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import OrderCard from '../OrderCard';
import { KanbanColumn as KanbanColumnType } from './KanbanTypes';

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

interface KanbanColumnProps {
  column: KanbanColumnType;
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  isOptimisticallyMoved?: (orderId: string) => boolean;
}

const KanbanColumn = ({ 
  column, 
  orders, 
  onOrderClick, 
  onEditOrder, 
  onDeleteOrder,
  isOptimisticallyMoved
}: KanbanColumnProps) => {
  return (
    <div 
      className={`flex-shrink-0 w-80 rounded-lg border-2 mt-4 ${column.color || 'bg-white border-gray-200'} flex flex-col max-h-[calc(100vh-120px)]`}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-3 border-b border-gray-200 rounded-t-lg">
        <h3 className="font-semibold text-gray-900">{column.title}</h3>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <Droppable droppableId={column.status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex flex-col space-y-3 p-3 min-h-full transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
              }`}
            >
              {orders.map((order, index) => (
                <Draggable key={order.id} draggableId={order.id} index={index}>
                  {(provided, snapshot) => (
                     <OrderCard 
                       order={order}
                       provided={provided}
                       snapshot={snapshot}
                       onOrderClick={onOrderClick}
                       onEditOrder={onEditOrder}
                       onDeleteOrder={onDeleteOrder}
                       isOptimisticallyMoved={isOptimisticallyMoved?.(order.id)}
                     />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default KanbanColumn;

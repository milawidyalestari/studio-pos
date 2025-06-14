
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import OrderCard from '../OrderCard';
import { Order, KanbanColumn as KanbanColumnType } from './KanbanTypes';

interface KanbanColumnProps {
  column: KanbanColumnType;
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onArchiveOrder?: (orderId: string) => void;
}

const KanbanColumn = ({ 
  column, 
  orders, 
  onOrderClick, 
  onEditOrder, 
  onArchiveOrder 
}: KanbanColumnProps) => {
  return (
    <div 
      className={`flex-shrink-0 w-80 rounded-lg p-4 border-2 ${column.color || 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{column.title}</h3>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>
      
      <Droppable droppableId={column.status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
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
                    onArchiveOrder={onArchiveOrder}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;

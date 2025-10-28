
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import OrderCard from '../OrderCard';
import { KanbanColumn as KanbanColumnType } from './KanbanTypes';
import './kanban-styles.css';

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
  onPrintNota?: (order: Order) => void;
  isOptimisticallyMoved?: (orderId: string) => boolean;
  onMarkAsTaken?: (orderId: string) => void;
}

const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(({ 
  column, 
  orders, 
  onOrderClick, 
  onEditOrder, 
  onDeleteOrder,
  onPrintNota,
  isOptimisticallyMoved,
  onMarkAsTaken
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`flex-shrink-0 w-80 rounded-lg bg-gray-100 p-4 flex flex-col`}
      style={{ overflow: 'visible', minHeight: '500px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
        <span className="text-sm text-gray-500">{orders.length}</span>
      </div>
      
      {/* Droppable Area - Entire Column Height */}
      <Droppable droppableId={column.status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col space-y-2 flex-1 p-2 rounded-lg kanban-droppable-area ${
              snapshot.isDraggingOver ? 'dragging-over bg-blue-50/50 border-2 border-blue-300 border-dashed' : 'border-2 border-transparent'
            }`}
            style={{ 
              overflow: 'visible'
            }}
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
                    onPrintNota={onPrintNota}
                    isOptimisticallyMoved={isOptimisticallyMoved?.(order.id)}
                    isDoneColumn={column.status === 'Done'}
                    onMarkPickedUp={onMarkAsTaken && order.status === 'Done' && String(order.status) !== 'Selesai-Diambil' ? onMarkAsTaken : undefined}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {/* Empty Drop Zone Indicator */}
            {orders.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 text-sm">
                Drop order di sini
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;

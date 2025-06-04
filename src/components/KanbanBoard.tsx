
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
  status: 'pending' | 'in-progress' | 'ready' | 'done';
  date: string;
  estimatedDate: string;
}

interface KanbanBoardProps {
  orders: Order[];
  onDragEnd: (result: DropResult) => void;
}

const KanbanBoard = ({ orders, onDragEnd }: KanbanBoardProps) => {
  const kanbanColumns = [
    { status: 'pending' as const, title: 'Pending', orders: orders.filter(o => o.status === 'pending') },
    { status: 'in-progress' as const, title: 'In Progress', orders: orders.filter(o => o.status === 'in-progress') },
    { status: 'ready' as const, title: 'Ready', orders: orders.filter(o => o.status === 'ready') },
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                        <OrderCard 
                          order={order}
                          provided={provided}
                          snapshot={snapshot}
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

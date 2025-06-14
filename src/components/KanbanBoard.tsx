
import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';
import KanbanColumn from './kanban/KanbanColumn';
import AddColumnDialog from './kanban/AddColumnDialog';
import AddColumnButton from './kanban/AddColumnButton';
import { 
  Order, 
  KanbanColumn as KanbanColumnType, 
  KanbanBoardProps, 
  DEFAULT_COLUMNS 
} from './kanban/KanbanTypes';

const KanbanBoard = ({ 
  orders, 
  onDragEnd, 
  onOrderClick, 
  onEditOrder, 
  onArchiveOrder,
  onUpdateOrderStatus 
}: KanbanBoardProps) => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(DEFAULT_COLUMNS);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const { toast } = useToast();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination or same position, do nothing
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const sourceStatus = source.droppableId;
    
    console.log(`Moving order ${draggableId} from ${sourceStatus} to ${newStatus}`);
    
    // Update the order status in the system
    if (onUpdateOrderStatus && newStatus !== sourceStatus) {
      onUpdateOrderStatus(draggableId, newStatus);
      
      // Show success message
      const targetColumn = columns.find(col => col.status === newStatus);
      toast({
        title: "Order moved",
        description: `Order moved to ${targetColumn?.title || newStatus}`,
      });
    }
    
    // Call the parent's onDragEnd handler
    onDragEnd(result);
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumn: KanbanColumnType = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newColumnTitle,
      status: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      // Don't set any background color for new columns
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setShowAddColumn(false);
    
    toast({
      title: "Status added",
      description: `New status "${newColumnTitle}" has been added`,
    });
  };

  const handleArchiveOrder = (orderId: string) => {
    if (onArchiveOrder) {
      onArchiveOrder(orderId);
      toast({
        title: "Order archived",
        description: "Order has been moved to archive",
      });
    }
  };

  const getColumnOrders = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const handleCloseAddColumn = () => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
          {columns.map((column) => {
            const columnOrders = getColumnOrders(column.status);
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                orders={columnOrders}
                onOrderClick={onOrderClick}
                onEditOrder={onEditOrder}
                onArchiveOrder={handleArchiveOrder}
              />
            );
          })}
          
          <AddColumnButton onClick={() => setShowAddColumn(true)} />
        </div>
      </DragDropContext>

      <AddColumnDialog
        open={showAddColumn}
        newColumnTitle={newColumnTitle}
        onOpenChange={setShowAddColumn}
        onTitleChange={setNewColumnTitle}
        onAdd={handleAddColumn}
        onCancel={handleCloseAddColumn}
      />
    </div>
  );
};

export default KanbanBoard;

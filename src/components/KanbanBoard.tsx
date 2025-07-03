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
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { Employee, OrderWithItems } from '@/types';

interface KanbanBoardWithEmployeesProps extends KanbanBoardProps {
  employees?: Employee[];
}

const KanbanBoard = ({ 
  orders, 
  onDragEnd, 
  onOrderClick, 
  onEditOrder, 
  onDeleteOrder,
  onUpdateOrderStatus,
  employees = []
}: KanbanBoardWithEmployeesProps) => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(DEFAULT_COLUMNS);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const { toast } = useToast();
  const { statuses } = useOrderStatus();

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
      // Find the status_id for the newStatus name
      const statusObj = statuses.find(s => s.name === newStatus);
      if (statusObj) {
        onUpdateOrderStatus(draggableId, String(statusObj.id));
      } else {
        toast({
          title: 'Error',
          description: `Status "${newStatus}" not found in database`,
          variant: 'destructive',
        });
      }
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

  const handleDeleteOrder = (orderId: string) => {
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
      toast({
        title: "Order deleted",
        description: "Order has been permanently deleted from the system",
      });
    }
  };

  const getColumnOrders = (status: string) => {
    return orders.filter(order => {
      // Prefer the joined status name from order_statuses
      if (order.order_statuses && order.order_statuses.name) {
        return order.order_statuses.name === status;
      }
      // Fallback to legacy status string if present
      return order.status === status;
    });
  };

  const handleCloseAddColumn = () => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 min-h-[600px]">
          {columns.map((column) => {
            const columnOrders = getColumnOrders(column.status).map(order => {
              // Cari employee desainer berdasarkan desainer_id
              let designer = undefined;
              if (order.desainer_id && Array.isArray(employees)) {
                const emp = employees.find(e => e.id === order.desainer_id);
                if (emp) {
                  designer = { name: emp.nama };
                }
              }
              return {
                ...order,
                customer: order.customer_name || order.customer || 'Unknown',
                estimatedDate: order.estimasi || order.estimatedDate || '',
                items: order.items || (order.order_items
                  ? order.order_items.map(item => item.item_name || item.name || item.title || 'Unknown Item')
                  : []),
                created_at: order.created_at,
                designer
              };
            });
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                orders={columnOrders as Order[]}
                onOrderClick={(order: Order) => onOrderClick(order as OrderWithItems)}
                onEditOrder={(order: Order) => onEditOrder(order as OrderWithItems)}
                onDeleteOrder={handleDeleteOrder}
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

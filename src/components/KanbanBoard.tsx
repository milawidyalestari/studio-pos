import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';
import KanbanColumn from './kanban/KanbanColumn';
import AddColumnDialog from './kanban/AddColumnDialog';
import AddColumnButton from './kanban/AddColumnButton';
import { 
  KanbanColumn as KanbanColumnType, 
  KanbanBoardProps, 
  DEFAULT_COLUMNS 
} from './kanban/KanbanTypes';
import { OrderWithItems } from '@/types';
import { useOrderStatus } from '@/hooks/useOrderStatus';

const KanbanBoard = ({ 
  orders, 
  onDragEnd, 
  onOrderClick, 
  onEditOrder, 
  onDeleteOrder,
  onUpdateOrderStatus 
}: KanbanBoardProps) => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(DEFAULT_COLUMNS);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const { toast } = useToast();
  const { statuses, loading: statusesLoading } = useOrderStatus();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatusName = destination.droppableId;
    const sourceStatus = source.droppableId;

    // Cari status tujuan dari database
    const targetStatus = statuses.find(s => s.name === newStatusName);
    if (onUpdateOrderStatus && targetStatus && targetStatus.id) {
      onUpdateOrderStatus(draggableId, targetStatus.id);
      toast({
        title: 'Order moved',
        description: `Order moved to ${targetStatus.name}`,
      });
    }
    onDragEnd(result);
  };

  // Kolom kanban dinamis dari database jika sudah ada status
  const dynamicColumns = statuses.length > 0
    ? statuses.map(s => ({ id: s.id.toString(), title: s.name, status: s.name }))
    : columns;

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    // Kolom baru hanya di state lokal, tidak ke database
    const newColumn: KanbanColumnType = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newColumnTitle,
      status: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
    };
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setShowAddColumn(false);
    toast({
      title: 'Status added',
      description: `New status "${newColumnTitle}" has been added`,
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
      toast({
        title: 'Order deleted',
        description: 'Order has been permanently deleted from the system',
      });
    }
  };

  function mapOrderWithItemsToOrder(order: OrderWithItems): Order {
    return {
      id: order.id,
      orderNumber: order.order_number,
      customer: order.customer_name,
      items: (order.order_items || []).map(item => item.item_name),
      total: order.total_amount,
      status: order.order_statuses?.name ?? '',
      date: order.tanggal,
      estimatedDate: order.estimasi,
    };
  }

  const getColumnOrders = (status: string) => {
    return orders
      .filter(order => order.order_statuses?.name === status)
      .map(mapOrderWithItemsToOrder);
  };

  const handleCloseAddColumn = () => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 pb-4 min-h-[600px]">
          {dynamicColumns.map((column) => {
            const columnOrders = getColumnOrders(column.status);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                orders={columnOrders}
                onOrderClick={onOrderClick}
                onEditOrder={onEditOrder}
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

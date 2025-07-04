import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';
import KanbanColumn from './kanban/KanbanColumn';
import AddColumnDialog from './kanban/AddColumnDialog';
import AddColumnButton from './kanban/AddColumnButton';
import { KanbanColumn as KanbanColumnType, KanbanBoardProps, DEFAULT_COLUMNS } from './kanban/KanbanTypes';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { Employee, OrderWithItems, Order } from '@/types';

interface KanbanBoardWithEmployeesProps extends KanbanBoardProps {
  employees?: Employee[];
}

function getOrderStatus(order: OrderWithItems): string {
  if (typeof order === 'object' && order !== null) {
    if ('order_statuses' in order && order.order_statuses && typeof order.order_statuses === 'object' && 'name' in order.order_statuses && typeof order.order_statuses.name === 'string') {
      return order.order_statuses.name;
    } else if ('status' in order && typeof (order as { status?: string }).status === 'string') {
      return (order as { status?: string }).status || 'Design';
    }
  }
  return 'Design';
}

function mapOrderWithItemsToOrder(order: OrderWithItems, employeeMap: Map<string, Employee>): Order {
  const designer = order.desainer_id && employeeMap.has(order.desainer_id)
    ? { name: employeeMap.get(order.desainer_id)!.nama }
    : undefined;
  const status = getOrderStatus(order);
  return {
    id: order.id,
    orderNumber: order.order_number || '-',
    customer: order.customer_name || '-',
    items: order.order_items ? order.order_items.map(item => item.item_name || 'Unknown Item') : [],
    total: order.total_amount?.toString() || '-',
    status: status as Order['status'],
    date: order.created_at || order.tanggal || '-',
    estimatedDate: order.estimasi || '-',
    designer,
    created_at: order.created_at || '-',
  };
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
  const [columnOrderSequence, setColumnOrderSequence] = useState<{[columnId: string]: string[]}>({});
  const [optimisticOrders, setOptimisticOrders] = useState<OrderWithItems[]>(orders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const { statuses } = useOrderStatus();
  const hasInitialized = useRef(false);

  // Memoize employee lookup
  const employeeMap = useMemo(() => {
    return new Map(employees.map(emp => [emp.id, emp]));
  }, [employees]);

  // Initialize order sequences only once on mount
  useEffect(() => {
    if (!hasInitialized.current && orders.length > 0) {
      const sequences: {[columnId: string]: string[]} = {};
      const statusGroups: {[status: string]: OrderWithItems[]} = {};
      orders.forEach(order => {
        const status = getOrderStatus(order);
        if (!statusGroups[status]) statusGroups[status] = [];
        statusGroups[status].push(order);
      });
      Object.keys(statusGroups).forEach(status => {
        sequences[status] = statusGroups[status]
          .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
          .map(order => order.id);
      });
      setColumnOrderSequence(sequences);
      hasInitialized.current = true;
    }
  }, [orders, isUpdating]);

  // Update optimistic orders when real orders change
  useEffect(() => {
    setOptimisticOrders(orders);
  }, [orders]);

  // Ambil dan urutkan order per kolom
  const getColumnOrders = useCallback((status: string): Order[] => {
    const sequence = columnOrderSequence[status] || [];
    const statusOrders = optimisticOrders.filter(order => getOrderStatus(order) === status);
    // Urutkan sesuai sequence, fallback ke created_at jika belum pernah di-drag
    return statusOrders.sort((a, b) => {
      const aIndex = sequence.indexOf(a.id);
      const bIndex = sequence.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
    }).map(order => mapOrderWithItemsToOrder(order, employeeMap));
  }, [optimisticOrders, columnOrderSequence, employeeMap]);

  // Drag and drop logic
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId;
    const newStatus = destination.droppableId;
    const newSequences = { ...columnOrderSequence };

    if (sourceStatus === newStatus) {
      // Reorder dalam kolom yang sama
      const columnSequence = [...(newSequences[sourceStatus] || [])];
      const [movedId] = columnSequence.splice(source.index, 1);
      columnSequence.splice(destination.index, 0, movedId);
      newSequences[sourceStatus] = columnSequence;
    } else {
      // Pindah antar kolom
      const sourceSequence = [...(newSequences[sourceStatus] || [])];
      const destSequence = [...(newSequences[newStatus] || [])];
      const [movedId] = sourceSequence.splice(source.index, 1);
      destSequence.splice(destination.index, 0, movedId);
      newSequences[sourceStatus] = sourceSequence;
      newSequences[newStatus] = destSequence;
    }

    // Optimistic update
    setColumnOrderSequence(newSequences);
    setOptimisticOrders(prev =>
      prev.map(order => {
        if (order.id === draggableId && sourceStatus !== newStatus) {
          let prevStatuses: Record<string, unknown> = {};
          if ('order_statuses' in order && order.order_statuses && typeof order.order_statuses === 'object') {
            prevStatuses = order.order_statuses as Record<string, unknown>;
          }
          return { ...order, status: newStatus, order_statuses: { ...prevStatuses, name: newStatus } };
        }
        return order;
      })
    );
    setIsUpdating(draggableId);
    toast({ title: 'Order Moved', description: 'Order berhasil dipindahkan', variant: 'default' });

    // Update status ke server jika pindah kolom
    try {
      if (sourceStatus !== newStatus && onUpdateOrderStatus) {
        const statusObj = statuses.find(s => s.name === newStatus);
        if (statusObj) {
          await onUpdateOrderStatus(draggableId, String(statusObj.id));
        }
      }
      setIsUpdating(null);
      onDragEnd(result);
    } catch (error) {
      // Rollback
      setColumnOrderSequence(columnOrderSequence);
      setOptimisticOrders(orders);
      setIsUpdating(null);
      toast({ title: 'Error', description: 'Gagal memindahkan order. Perubahan dibatalkan.', variant: 'destructive' });
    }
  }, [columnOrderSequence, orders, onUpdateOrderStatus, statuses, toast, onDragEnd]);

  const handleAddColumn = useCallback(() => {
    if (!newColumnTitle.trim()) return;
    const newColumn: KanbanColumnType = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newColumnTitle,
      status: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      color: 'bg-gray-50 border-gray-200',
    };
    setColumns(prev => [...prev, newColumn]);
    setNewColumnTitle('');
    setShowAddColumn(false);
    toast({ title: 'Status added', description: `New status "${newColumnTitle}" has been added` });
  }, [newColumnTitle, toast]);

  const handleDeleteOrder = useCallback((orderId: string) => {
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
      toast({ title: 'Order deleted', description: 'Order has been permanently deleted from the system' });
    }
  }, [onDeleteOrder, toast]);

  const handleCloseAddColumn = useCallback(() => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  }, []);

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-4 min-h-[600px]">
          {columns.map((column) => {
            const columnOrders = getColumnOrders(column.status);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                orders={columnOrders}
                onOrderClick={onOrderClick ? (order) => onOrderClick(order as unknown as OrderWithItems) : undefined}
                onEditOrder={onEditOrder ? (order) => onEditOrder(order as unknown as OrderWithItems) : undefined}
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

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

// Interface untuk tracking posisi kartu
interface CardPosition {
  orderId: string;
  status: string;
  position: number;
  timestamp: number;
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
  
  // State untuk tracking posisi kartu yang telah di-drag
  const [cardPositions, setCardPositions] = useState<Map<string, CardPosition>>(new Map());
  
  // State untuk optimistic updates
  const [optimisticStatusChanges, setOptimisticStatusChanges] = useState<Map<string, string>>(new Map());
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { statuses } = useOrderStatus();
  const lastOrdersRef = useRef<OrderWithItems[]>([]);

  // Memoize employee lookup
  const employeeMap = useMemo(() => {
    return new Map(employees.map(emp => [emp.id, emp]));
  }, [employees]);

  // Cleanup old positions (5 minutes)
  useEffect(() => {
    const cleanup = () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      setCardPositions(prev => {
        const newPositions = new Map();
        prev.forEach((position, key) => {
          if (position.timestamp > fiveMinutesAgo) {
            newPositions.set(key, position);
          }
        });
        return newPositions;
      });
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  // Reset positions when orders change significantly (new orders added, etc.)
  useEffect(() => {
    const currentOrderIds = new Set(orders.map(o => o.id));
    const lastOrderIds = new Set(lastOrdersRef.current.map(o => o.id));
    
    // Check if there are new orders or deleted orders
    const hasNewOrders = orders.some(o => !lastOrderIds.has(o.id));
    const hasDeletedOrders = lastOrdersRef.current.some(o => !currentOrderIds.has(o.id));
    
    if (hasNewOrders || hasDeletedOrders) {
      // Only remove positions for deleted orders
      setCardPositions(prev => {
        const newPositions = new Map();
        prev.forEach((position, key) => {
          if (currentOrderIds.has(key)) {
            newPositions.set(key, position);
          }
        });
        return newPositions;
      });
    }
    
    lastOrdersRef.current = orders;
  }, [orders]);

  // Get current status for an order (considering optimistic updates)
  const getCurrentStatus = useCallback((order: OrderWithItems): string => {
    const optimisticStatus = optimisticStatusChanges.get(order.id);
    if (optimisticStatus) {
      return optimisticStatus;
    }
    return getOrderStatus(order);
  }, [optimisticStatusChanges]);

  // Get orders for a specific column with proper sorting
  const getColumnOrders = useCallback((status: string): Order[] => {
    // Get all orders for this status
    const statusOrders = orders.filter(order => getCurrentStatus(order) === status);
    
    // Sort orders based on their positions
    const sortedOrders = statusOrders.sort((a, b) => {
      const aPosition = cardPositions.get(a.id);
      const bPosition = cardPositions.get(b.id);
      
      // Both have positions in this status
      if (aPosition && bPosition && aPosition.status === status && bPosition.status === status) {
        return aPosition.position - bPosition.position;
      }
      
      // Only one has position in this status
      if (aPosition && aPosition.status === status && (!bPosition || bPosition.status !== status)) {
        return -1; // a comes first
      }
      
      if (bPosition && bPosition.status === status && (!aPosition || aPosition.status !== status)) {
        return 1; // b comes first
      }
      
      // Neither has position in this status, sort by creation date
      const aDate = new Date(a.created_at || '').getTime();
      const bDate = new Date(b.created_at || '').getTime();
      return bDate - aDate; // Newest first
    });
    
    return sortedOrders.map(order => mapOrderWithItemsToOrder(order, employeeMap));
  }, [orders, cardPositions, getCurrentStatus, employeeMap]);

  // Handle drag end
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId;
    const newStatus = destination.droppableId;
    const newPosition = destination.index;
    
    console.log(`Moving ${draggableId} from ${sourceStatus}[${source.index}] to ${newStatus}[${newPosition}]`);
    
    // Update card position immediately
    const newCardPosition: CardPosition = {
      orderId: draggableId,
      status: newStatus,
      position: newPosition,
      timestamp: Date.now()
    };
    
    setCardPositions(prev => {
      const newPositions = new Map(prev);
      
      // Update positions for all cards in the affected columns
      const sourceOrders = getColumnOrders(sourceStatus);
      const destOrders = getColumnOrders(newStatus);
      
      if (sourceStatus === newStatus) {
        // Reordering within same column
        const columnOrders = [...sourceOrders];
        const [movedOrder] = columnOrders.splice(source.index, 1);
        columnOrders.splice(newPosition, 0, movedOrder);
        
        // Update positions for all cards in this column
        columnOrders.forEach((order, index) => {
          newPositions.set(order.id, {
            orderId: order.id,
            status: newStatus,
            position: index,
            timestamp: Date.now()
          });
        });
      } else {
        // Moving between columns
        // Remove from source column and update positions
        const sourceColumnOrders = sourceOrders.filter(order => order.id !== draggableId);
        sourceColumnOrders.forEach((order, index) => {
          newPositions.set(order.id, {
            orderId: order.id,
            status: sourceStatus,
            position: index,
            timestamp: Date.now()
          });
        });
        
        // Add to destination column and update positions
        const destColumnOrders = [...destOrders];
        const movedOrder = sourceOrders.find(order => order.id === draggableId);
        if (movedOrder) {
          destColumnOrders.splice(newPosition, 0, movedOrder);
          destColumnOrders.forEach((order, index) => {
            newPositions.set(order.id, {
              orderId: order.id,
              status: newStatus,
              position: index,
              timestamp: Date.now()
            });
          });
        }
      }
      
      return newPositions;
    });
    
    // Handle status change
    if (sourceStatus !== newStatus) {
      // Add optimistic status change
      setOptimisticStatusChanges(prev => {
        const newMap = new Map(prev);
        newMap.set(draggableId, newStatus);
        return newMap;
      });
      
      setIsUpdating(draggableId);
      
      // Update status on server
      if (onUpdateOrderStatus) {
        try {
          const statusObj = statuses.find(s => s.name === newStatus);
          if (statusObj) {
            await onUpdateOrderStatus(draggableId, String(statusObj.id));
            toast({
              title: 'Order Moved',
              description: `Order moved to ${newStatus}`,
              variant: 'default'
            });
          } else {
            throw new Error(`Status "${newStatus}" not found`);
          }
        } catch (error) {
          console.error('Failed to update order status:', error);
          
          // Rollback optimistic changes
          setOptimisticStatusChanges(prev => {
            const newMap = new Map(prev);
            newMap.delete(draggableId);
            return newMap;
          });
          
          // Rollback position changes
          setCardPositions(prev => {
            const newPositions = new Map(prev);
            newPositions.delete(draggableId);
            return newPositions;
          });
          
          toast({
            title: 'Error',
            description: 'Failed to move order. Changes have been reverted.',
            variant: 'destructive'
          });
        } finally {
          setIsUpdating(null);
          // Remove optimistic status change after some time
          setTimeout(() => {
            setOptimisticStatusChanges(prev => {
              const newMap = new Map(prev);
              newMap.delete(draggableId);
              return newMap;
            });
          }, 2000);
        }
      }
    }
    
    // Call parent handler
    if (onDragEnd) {
      onDragEnd(result);
    }
  }, [getColumnOrders, onUpdateOrderStatus, statuses, toast, onDragEnd]);

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
    
    toast({
      title: 'Status added',
      description: `New status "${newColumnTitle}" has been added`
    });
  }, [newColumnTitle, toast]);

  const handleDeleteOrder = useCallback((orderId: string) => {
    if (onDeleteOrder) {
      // Remove from positions
      setCardPositions(prev => {
        const newPositions = new Map(prev);
        newPositions.delete(orderId);
        return newPositions;
      });
      
      // Remove from optimistic changes
      setOptimisticStatusChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
      
      onDeleteOrder(orderId);
      toast({
        title: 'Order deleted',
        description: 'Order has been permanently deleted from the system'
      });
    }
  }, [onDeleteOrder, toast]);

  const handleCloseAddColumn = useCallback(() => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  }, []);

  // Check if order is being moved optimistically
  const isOrderOptimisticallyMoved = useCallback((orderId: string) => {
    return optimisticStatusChanges.has(orderId) || isUpdating === orderId;
  }, [optimisticStatusChanges, isUpdating]);

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
                isOptimisticallyMoved={isOrderOptimisticallyMoved}
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
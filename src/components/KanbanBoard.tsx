import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, DropResult, DragUpdate } from 'react-beautiful-dnd';
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
  // Get designer info from the joined data if available, otherwise fallback to employeeMap
  let designer = undefined;
  if (order.desainer && order.desainer.nama) {
    designer = { name: order.desainer.nama };
  } else if (order.desainer_id && employeeMap.has(order.desainer_id)) {
    designer = { name: employeeMap.get(order.desainer_id)!.nama };
  }
  
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
    customer_name: order.customer_name,
    estimasi: order.estimasi,
    order_items: order.order_items,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);

  const employeeMap = useMemo(() => {
    return new Map(employees.map(emp => [emp.id, emp]));
  }, [employees]);

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

  const getColumnOrders = useCallback((status: string): Order[] => {
    const sequence = columnOrderSequence[status] || [];
    const statusOrders = optimisticOrders.filter(order => getOrderStatus(order) === status);
    return statusOrders.sort((a, b) => {
      const aIndex = sequence.indexOf(a.id);
      const bIndex = sequence.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
    }).map(order => mapOrderWithItemsToOrder(order, employeeMap));
  }, [optimisticOrders, columnOrderSequence, employeeMap]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    // Clear any ongoing scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId;
    const newStatus = destination.droppableId;
    const newSequences = { ...columnOrderSequence };

    if (sourceStatus === newStatus) {
      const columnSequence = [...(newSequences[sourceStatus] || [])];
      const [movedId] = columnSequence.splice(source.index, 1);
      columnSequence.splice(destination.index, 0, movedId);
      newSequences[sourceStatus] = columnSequence;
    } else {
      const sourceSequence = [...(newSequences[sourceStatus] || [])];
      const destSequence = [...(newSequences[newStatus] || [])];
      const [movedId] = sourceSequence.splice(source.index, 1);
      destSequence.splice(destination.index, 0, movedId);
      newSequences[sourceStatus] = sourceSequence;
      newSequences[newStatus] = destSequence;
    }

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
    };
    setColumns(prev => [...prev, newColumn]);
    setNewColumnTitle('');
    setShowAddColumn(false);
    toast({ title: 'Status added', description: `New status "${newColumnTitle}" has been added` });
  }, [newColumnTitle, toast]);

  const handleDeleteOrder = (orderId: string) => {
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
      toast({ title: 'Order deleted', description: 'Order has been permanently deleted from the system' });
    }
  };

  const handleCloseAddColumn = () => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  };

  const handleMarkAsTaken = async (orderId: string) => {
    const diambilStatus = statuses.find(s => s.name === 'Selesai-Diambil');
    if (!diambilStatus) {
      toast({ title: 'Error', description: 'Status "Selesai-Diambil" tidak ditemukan', variant: 'destructive' });
      return;
    }
    setIsUpdating(orderId);
    try {
      if (onUpdateOrderStatus) {
        await onUpdateOrderStatus(orderId, String(diambilStatus.id));
      }
      toast({ title: 'Order Diambil', description: 'Order telah diubah ke status Selesai-Diambil', variant: 'default' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status order.', variant: 'destructive' });
    } finally {
      setIsUpdating(null);
    }
  };

  // --- SMOOTH AUTO SCROLL LOGIC DENGAN AKSELERASI ---
  const scrollDirectionRef = useRef<'left' | 'right' | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const SCROLL_THRESHOLD = 10; // px dari kiri/kanan layar
  const SCROLL_SPEED_INITIAL = 30; // px per frame (awal)
  const SCROLL_SPEED_ACCEL = 10; // px per frame (tambah per frame)
  const SCROLL_SPEED_MAX = 150; // px per frame (maksimal)
  const currentScrollSpeedRef = useRef<number>(SCROLL_SPEED_INITIAL);

  // Fungsi animasi scroll dengan akselerasi
  const smoothScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !scrollDirectionRef.current) return;
    // Scroll sesuai arah dan kecepatan saat ini
    if (scrollDirectionRef.current === 'left') {
      container.scrollLeft = Math.max(0, container.scrollLeft - currentScrollSpeedRef.current);
    } else if (scrollDirectionRef.current === 'right') {
      const maxScroll = container.scrollWidth - container.clientWidth;
      container.scrollLeft = Math.min(maxScroll, container.scrollLeft + currentScrollSpeedRef.current);
    }
    // Tambah kecepatan (akselerasi) hingga batas maksimal
    currentScrollSpeedRef.current = Math.min(
      currentScrollSpeedRef.current + SCROLL_SPEED_ACCEL,
      SCROLL_SPEED_MAX
    );
    animationFrameRef.current = requestAnimationFrame(smoothScroll);
  }, []);

  // Mousemove handler untuk deteksi arah scroll
  const handleAutoScrollEdge = useCallback((e: MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    // Deteksi arah
    if (mouseX - containerRect.left < SCROLL_THRESHOLD) {
      if (scrollDirectionRef.current !== 'left') {
        scrollDirectionRef.current = 'left';
        currentScrollSpeedRef.current = SCROLL_SPEED_INITIAL;
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(smoothScroll);
        }
      }
    } else if (containerRect.right - mouseX < SCROLL_THRESHOLD) {
      if (scrollDirectionRef.current !== 'right') {
        scrollDirectionRef.current = 'right';
        currentScrollSpeedRef.current = SCROLL_SPEED_INITIAL;
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(smoothScroll);
        }
      }
    } else {
      // Kursor keluar area trigger, stop scroll dan reset kecepatan
      scrollDirectionRef.current = null;
      currentScrollSpeedRef.current = SCROLL_SPEED_INITIAL;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [smoothScroll]);

  // Pasang event listener mousemove saat drag
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    window.addEventListener('mousemove', handleAutoScrollEdge);
    // Bersihkan animasi lama jika ada
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    scrollDirectionRef.current = null;
    currentScrollSpeedRef.current = SCROLL_SPEED_INITIAL;
  }, [handleAutoScrollEdge]);

  // Lepas event listener dan animasi saat drag selesai
  const handleDragEndWrapper = useCallback(async (result: DropResult) => {
    isDraggingRef.current = false;
    window.removeEventListener('mousemove', handleAutoScrollEdge);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    scrollDirectionRef.current = null;
    currentScrollSpeedRef.current = SCROLL_SPEED_INITIAL;
    await handleDragEnd(result);
  }, [handleDragEnd, handleAutoScrollEdge]);

  // handleDragUpdate tetap untuk fallback (tidak dihapus)
  const handleDragUpdate = useCallback((update: DragUpdate) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Clear any existing scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Ambil posisi mouse dari window event, tanpa 'any'
    let mouseX: number | undefined = undefined;
    if (typeof window !== 'undefined' && window.event && typeof (window.event as MouseEvent).clientX === 'number') {
      mouseX = (window.event as MouseEvent).clientX;
    }
    if (typeof mouseX !== 'number') return;

    const containerRect = container.getBoundingClientRect();
    const scrollThreshold = 150; // Larger threshold for easier triggering
    const scrollAmount = 100; // Faster scroll for better UX

    // Check if we need to scroll based on mouse position
    const shouldScrollLeft = mouseX - containerRect.left < scrollThreshold;
    const shouldScrollRight = containerRect.right - mouseX < scrollThreshold;

    if (shouldScrollLeft || shouldScrollRight) {
      scrollIntervalRef.current = setInterval(() => {
        const currentContainer = scrollContainerRef.current;
        if (!currentContainer) return;
        
        if (shouldScrollLeft && currentContainer.scrollLeft > 0) {
          currentContainer.scrollLeft = Math.max(0, currentContainer.scrollLeft - scrollAmount);
        } else if (shouldScrollRight) {
          const maxScroll = currentContainer.scrollWidth - currentContainer.clientWidth;
          if (currentContainer.scrollLeft < maxScroll) {
            currentContainer.scrollLeft = Math.min(maxScroll, currentContainer.scrollLeft + scrollAmount);
          }
        }
      }, 100); // Slower interval for smoother experience
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleAutoScrollEdge);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scrollDirectionRef.current = null;
      currentScrollSpeedRef.current = SCROLL_SPEED_INITIAL;
    };
  }, [handleAutoScrollEdge]);

  return (
    <div className="w-full">
      <DragDropContext 
        onDragEnd={handleDragEndWrapper} 
        onDragUpdate={handleDragUpdate}
        onDragStart={handleDragStart}
      >
        <div
          ref={scrollContainerRef}
          className="kanban-scroll-container flex gap-2 overflow-x-auto overflow-y-hidden pb-2 min-h-[600px]"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            overflowX: 'auto'
          }}
        >
          {columns.map((column) => {
            const columnOrders = getColumnOrders(column.status).map(order => {
              return {
                ...order,
                customer: order.customer_name || order.customer || 'Unknown',
                estimatedDate: order.estimasi || order.estimatedDate || '',
                items: order.items || (order.order_items
                  ? order.order_items.map(item => item.item_name || item.name || item.title || 'Unknown Item')
                  : []),
                created_at: order.created_at,
                designer: order.designer
              };
            });

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                orders={columnOrders}
                onOrderClick={onOrderClick ? (order) => {
                  const original = orders.find(o => o.id === order.id);
                  if (original) onOrderClick(original);
                } : undefined}
                onEditOrder={onEditOrder ? (order) => {
                  const original = orders.find(o => o.id === order.id);
                  if (original) onEditOrder(original);
                } : undefined}
                onDeleteOrder={handleDeleteOrder}
                onMarkAsTaken={column.status === 'Done' ? handleMarkAsTaken : undefined}
              />
            );
          })}
          {/* <AddColumnButton onClick={() => setShowAddColumn(true)} /> */}
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

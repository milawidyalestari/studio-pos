import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, DropResult, DragUpdate } from 'react-beautiful-dnd';
import KanbanColumn from './kanban/KanbanColumn';
import AddColumnDialog from './kanban/AddColumnDialog';
import AddColumnButton from './kanban/AddColumnButton';
import { KanbanColumn as KanbanColumnType, KanbanBoardProps, DEFAULT_COLUMNS } from './kanban/KanbanTypes';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { useProducts } from '@/hooks/useProducts';
import { Employee, OrderWithItems, Order } from '@/types';

interface KanbanBoardWithEmployeesProps extends KanbanBoardProps {
  employees?: Employee[];
  fadeReload?: boolean;
  onPrintNota?: (order: OrderWithItems) => void;
}

function getOrderStatus(order: OrderWithItems): string {
  if (typeof order === 'object' && order !== null) {
    // Prioritas 1: Ambil dari order_statuses yang sudah di-join
    if ('order_statuses' in order && order.order_statuses && typeof order.order_statuses === 'object' && 'name' in order.order_statuses && typeof order.order_statuses.name === 'string') {
      return order.order_statuses.name;
    }
    // Prioritas 2: Ambil dari status_id yang sudah di-mapping ke nama status
    else if ('status_id' in order && order.status_id && typeof order.status_id === 'number') {
      // Status akan di-mapping di mapOrderWithItemsToOrder
      return 'Design'; // Default fallback
    }
  }
  return 'Design';
}

function mapOrderWithItemsToOrder(order: OrderWithItems, employeeMap: Map<string, Employee>, statuses: any[], products: any[]): Order {
  // Get designer info from the joined data if available, otherwise fallback to employeeMap
  let designer = undefined;
  if (order.desainer && order.desainer.nama) {
    designer = { name: order.desainer.nama };
  } else if (order.desainer_id && employeeMap.has(order.desainer_id)) {
    designer = { name: employeeMap.get(order.desainer_id)!.nama };
  }
  
  // Get status dengan prioritas yang benar
  let status = 'Design'; // default
  if (order.order_statuses && order.order_statuses.name) {
    status = order.order_statuses.name;
  } else if (order.status_id && statuses && statuses.length > 0) {
    const statusObj = statuses?.find(s => s.id === order.status_id);
    if (statusObj) {
      status = statusObj.name;
    }
  }
  
  return {
    id: order.id,
    orderNumber: order.order_number || '-',
    customer: order.customer_name || '-',
    items: order.order_items ? order.order_items.map(item => {
      // Cari nama produk berdasarkan item_name (kode produk)
      const product = products?.find(p => p.kode === item.item_name);
      return product?.nama || item.item_name || 'Unknown Item';
    }) : [],
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

// Function to calculate deadline priority for sorting
function getDeadlinePriority(estimatedDate: string): number {
  if (!estimatedDate || estimatedDate === '-') {
    return 999; // No deadline = lowest priority
  }
  
  const deadline = new Date(estimatedDate);
  if (isNaN(deadline.getTime())) {
    return 999; // Invalid date = lowest priority
  }
  
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Priority system:
  // 1. Overdue (negative days) - highest priority (0-99)
  // 2. Today (0 days) - high priority (100-199)
  // 3. Tomorrow (1 day) - medium-high priority (200-299)
  // 4. This week (2-7 days) - medium priority (300-399)
  // 5. Next week (8-14 days) - low-medium priority (400-499)
  // 6. Later (15+ days) - low priority (500+)
  // 7. No deadline - lowest priority (999)
  
  if (diffDays < 0) {
    // Overdue - more overdue = higher priority
    return Math.abs(diffDays);
  } else if (diffDays === 0) {
    // Today
    return 100;
  } else if (diffDays === 1) {
    // Tomorrow
    return 200;
  } else if (diffDays <= 7) {
    // This week
    return 300 + diffDays;
  } else if (diffDays <= 14) {
    // Next week
    return 400 + diffDays;
  } else {
    // Later
    return 500 + diffDays;
  }
}

// Function to sort orders by deadline priority
function sortOrdersByDeadline(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const priorityA = getDeadlinePriority(a.estimatedDate);
    const priorityB = getDeadlinePriority(b.estimatedDate);
    
    // Lower number = higher priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by creation date (newest first)
    const dateA = new Date(a.created_at || a.date);
    const dateB = new Date(b.created_at || b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

const KanbanBoard = ({ 
  orders, 
  onDragEnd, 
  onOrderClick, 
  onEditOrder, 
  onDeleteOrder,
  onUpdateOrderStatus,
  onPrintNota,
  employees = [],
  fadeReload = false
}: KanbanBoardWithEmployeesProps) => {
  const { data: statuses } = useOrderStatus();
  const [showAddColumn, setShowAddColumn] = useState(false);
  const { data: products } = useProducts();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [columnOrderSequence, setColumnOrderSequence] = useState<{[columnId: string]: string[]}>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Generate columns dynamically from database statuses
  const columns = useMemo<KanbanColumnType[]>(() => {
    if (!statuses || statuses.length === 0) {
      return DEFAULT_COLUMNS;
    }
    return statuses
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map(status => ({
        id: status.name,
        title: status.name,
        status: status.name,
        color: status.color || 'bg-gray-50'
      }));
  }, [statuses]);
  const hasInitialized = useRef(false);
  const columnRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // --- ALTERNATIVE HORIZONTAL SCROLL EVENT HANDLERS ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Scroll configuration
  const SCROLL_ZONE_WIDTH = 10; // px
  const SCROLL_SPEED = 16; // px per interval
  const SCROLL_INTERVAL = 16; // ms (60fps)

  // State lokal untuk urutan card (optimistik)
  const [localOrders, setLocalOrders] = useState<OrderWithItems[]>(orders);

  // Sync localOrders dengan orders dari backend setiap kali orders berubah
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const employeeMap = useMemo(() => {
    return new Map(employees.map(emp => [emp.id, emp]));
  }, [employees]);

  // Sync columnOrderSequence jika orders berubah
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

  // Gunakan localOrders untuk mapping dan animasi
  const getColumnOrders = useCallback((status: string): Order[] => {
    const sequence = columnOrderSequence[status] || [];
    const statusOrders = localOrders.filter(order => getOrderStatus(order) === status);
    return statusOrders.sort((a, b) => {
      const aIndex = sequence.indexOf(a.id);
      const bIndex = sequence.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
    }).map(order => mapOrderWithItemsToOrder(order, employeeMap, statuses, products));
  }, [localOrders, columnOrderSequence, employeeMap, statuses, products]);

  // Saat drag & drop, update localOrders secara optimistik
  const handleDragEnd = useCallback(async (result: DropResult) => {
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
    
    // Update localOrders secara optimistik dengan status yang benar
    setLocalOrders(prev => {
      const updated = [...prev];
      const movedIdx = updated.findIndex(o => o.id === draggableId);
      if (movedIdx === -1) return updated;
      
      // Cari status_id yang sesuai dengan newStatus
      const statusObj = statuses?.find(s => s.name === newStatus);
      const newStatusId = statusObj ? statusObj.id : null;
      
      const movedOrder = { 
        ...updated[movedIdx], 
        status_id: newStatusId ? String(newStatusId) : updated[movedIdx].status_id,
        order_statuses: statusObj ? { id: statusObj.id, name: statusObj.name } : updated[movedIdx].order_statuses
      };
      
      updated.splice(movedIdx, 1);
      // Cari index tujuan di localOrders
      const destIdx = updated.findIndex(o => o.id === (newSequences[newStatus][destination.index]));
      if (destIdx === -1) {
        updated.push(movedOrder);
      } else {
        updated.splice(destIdx, 0, movedOrder);
      }
      return updated;
    });
    setIsUpdating(draggableId);

    try {
      if (sourceStatus !== newStatus && onUpdateOrderStatus) {
        const statusObj = statuses?.find(s => s.name === newStatus);
        if (statusObj) {
          await onUpdateOrderStatus(draggableId, String(statusObj.id));
        }
      }
      setIsUpdating(null);
      onDragEnd(result);
    } catch (error) {
      setColumnOrderSequence(columnOrderSequence);
      setIsUpdating(null);
      // Toast error dihapus untuk menghindari notifikasi yang mengganggu
    }
  }, [columnOrderSequence, statuses, onUpdateOrderStatus, onDragEnd]);

  // --- ALTERNATIVE SCROLL FUNCTIONS ---
  
  // Method 1: Mouse-based scroll detection
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    
    // Clear existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Check if mouse is in scroll zones
    const isInLeftZone = mouseX - rect.left < SCROLL_ZONE_WIDTH;
    const isInRightZone = rect.right - mouseX < SCROLL_ZONE_WIDTH;
    
    if (isInLeftZone && container.scrollLeft > 0) {
      setIsScrolling(true);
      scrollTimeoutRef.current = setTimeout(() => {
        container.scrollLeft -= SCROLL_SPEED;
        if (container.scrollLeft > 0) {
          handleMouseMove(e); // Continue scrolling
        } else {
          setIsScrolling(false);
        }
      }, SCROLL_INTERVAL);
    } else if (isInRightZone && container.scrollLeft < container.scrollWidth - container.clientWidth) {
      setIsScrolling(true);
      scrollTimeoutRef.current = setTimeout(() => {
        container.scrollLeft += SCROLL_SPEED;
        if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
          handleMouseMove(e); // Continue scrolling
        } else {
          setIsScrolling(false);
        }
      }, SCROLL_INTERVAL);
    } else {
      setIsScrolling(false);
    }
  }, []);

  // Method 2: Touch-based scroll for mobile
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX;
    
    // Check if touch is in scroll zones
    const isInLeftZone = touchX - rect.left < SCROLL_ZONE_WIDTH;
    const isInRightZone = rect.right - touchX < SCROLL_ZONE_WIDTH;
    
    if (isInLeftZone && container.scrollLeft > 0) {
      container.scrollLeft -= SCROLL_SPEED * 2; // Faster for touch
    } else if (isInRightZone && container.scrollLeft < container.scrollWidth - container.clientWidth) {
      container.scrollLeft += SCROLL_SPEED * 2; // Faster for touch
    }
  }, []);

  // Method 3: Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        container.scrollLeft -= SCROLL_SPEED * 3;
        break;
      case 'ArrowRight':
        e.preventDefault();
        container.scrollLeft += SCROLL_SPEED * 3;
        break;
      case 'Home':
        e.preventDefault();
        container.scrollLeft = 0;
        break;
      case 'End':
        e.preventDefault();
        container.scrollLeft = container.scrollWidth - container.clientWidth;
        break;
    }
  }, []);

  // Method 4: Wheel-based scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const container = scrollContainerRef.current;
    
    // Horizontal scroll with wheel
    if (e.deltaX !== 0) {
      container.scrollLeft += e.deltaX;
    } else if (e.deltaY !== 0) {
      // Convert vertical wheel to horizontal scroll
      container.scrollLeft += e.deltaY;
    }
  }, []);

  // Method 5: Intersection Observer for auto-scroll
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (!isDraggingRef.current) return;
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Column is visible, no need to scroll
        setIsScrolling(false);
      }
    });
  }, []);

  // Combined drag start handler
  const handleDragStart = useCallback((start: any) => {
    isDraggingRef.current = true;
    
    // Add all event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    // Setup intersection observer
    const observer = new IntersectionObserver(handleIntersection, {
      root: scrollContainerRef.current,
      threshold: 0.1
    });
    
    // Observe all columns
    const columns = scrollContainerRef.current?.querySelectorAll('[data-rbd-droppable-id]');
    columns?.forEach(column => observer.observe(column));
    
    return () => {
      observer.disconnect();
    };
  }, [handleMouseMove, handleTouchMove, handleKeyDown, handleWheel, handleIntersection]);

  // Combined drag end handler
  const handleDragEndWrapper = useCallback(async (result: DropResult) => {
    isDraggingRef.current = false;
    setIsScrolling(false);
    
    // Remove all event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('wheel', handleWheel);
    
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Call original handleDragEnd
    await handleDragEnd(result);
  }, [handleMouseMove, handleTouchMove, handleKeyDown, handleWheel, handleDragEnd]);

  const handleAddColumn = useCallback(() => {
    if (!newColumnTitle.trim()) return;
    // Note: Adding columns dynamically is now handled by database statuses
    // This function is kept for compatibility but should create a new status in DB
    setNewColumnTitle('');
    setShowAddColumn(false);
    // Toast notification dihapus untuk menghindari notifikasi yang mengganggu
  }, [newColumnTitle]);

  const handleDeleteOrder = (orderId: string) => {
    if (onDeleteOrder) {
      onDeleteOrder(orderId);
      // Toast notification dihapus untuk menghindari notifikasi yang mengganggu
    }
  };

  const handleCloseAddColumn = () => {
    setShowAddColumn(false);
    setNewColumnTitle('');
  };

  const handleMarkAsTaken = async (orderId: string) => {
    const diambilStatus = statuses?.find(s => s.name === 'Selesai-Diambil');
    if (!diambilStatus) {
      // Toast error dihapus untuk menghindari notifikasi yang mengganggu
      return;
    }
    setIsUpdating(orderId);
    try {
      if (onUpdateOrderStatus) {
        await onUpdateOrderStatus(orderId, String(diambilStatus.id));
      }
      // Toast success dihapus untuk menghindari notifikasi yang mengganggu
    } catch (error) {
      // Toast error dihapus untuk menghindari notifikasi yang mengganggu
    } finally {
      setIsUpdating(null);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleTouchMove, handleKeyDown, handleWheel]);

  return (
    <div style={{ overflow: 'visible' }}>
      <DragDropContext 
        onDragEnd={handleDragEndWrapper}
        onDragStart={handleDragStart}
      >
        <div
          ref={scrollContainerRef}
          className={`kanban-scroll-container flex gap-6 overflow-x-scroll p-8 bg-gray-50 relative ${
            isScrolling ? 'scroll-indicator' : ''
          }`}
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            overflowX: 'scroll',
            overflowY: 'visible',
            minHeight: 'fit-content'
          }}
        >
          {columns.map((column) => {
            const columnOrders = sortOrdersByDeadline(getColumnOrders(column.status)).map(order => {
              return {
                ...order,
                customer: order.customer_name || order.customer || 'Tidak diketahui',
                estimatedDate: order.estimasi || order.estimatedDate || '',
                items: order.items || (order.order_items
                  ? order.order_items.map(item => {
                      // Cari nama produk berdasarkan item_name (kode produk)
                      const product = products?.find(p => p.kode === (item.item_name || item.name || item.title));
                      return product?.nama || item.item_name || item.name || item.title || 'Item tidak diketahui';
                    })
                  : []),
                created_at: order.created_at,
                designer: order.designer
              };
            });

            return (
              <KanbanColumn
                key={column.id}
                ref={(el) => columnRefs.current[column.status] = el}
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
                onPrintNota={onPrintNota ? (order) => {
                  const original = orders.find(o => o.id === order.id);
                  if (original) onPrintNota(original);
                } : undefined}
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

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Grid, List, RefreshCw } from 'lucide-react';
import { DropResult } from 'react-beautiful-dnd';
import RequestOrderModal from '@/components/RequestOrderModal';
import KanbanBoard from '@/components/KanbanBoard';
import OrderTable from '@/components/OrderTable';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/services/masterData';
import { useToast } from '@/hooks/use-toast';
import { deleteOrderFromDatabase } from '@/services/deleteOrderService';
import { Order, OrderWithItems, Employee } from '@/types';
import { databaseService } from '@/services/databaseService';
import { useHasAccess } from '@/context/RoleAccessContext';
import { useProducts } from '@/hooks/useProducts';
import { PrintOverlay } from '@/components/PrintOverlay';
import { clearToastsWithDelay } from '@/utils/toastCleanup';

const Orderan = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const [tempEditingOrder, setTempEditingOrder] = useState<OrderWithItems | null>(null);
  const [showPrintOverlay, setShowPrintOverlay] = useState(false);
  const [printOrderData, setPrintOrderData] = useState<OrderWithItems | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { orders: dbOrders, isLoading, isFetching, updateOrder, deleteOrder, refetch } = useOrders({ enableAutoRefresh: false }); // disable auto polling
  
  // Filter orders untuk table view - sembunyikan order dengan status "Selesai-Diambil"
  const allOrders = dbOrders || [];
  const filteredOrdersForTable = allOrders.filter(order => {
    const statusName = order.order_statuses?.name;
    return statusName !== 'Selesai-Diambil';
  });
  
  // Filter berdasarkan search query
  const searchFilteredOrders = (ordersToFilter: OrderWithItems[]) => {
    if (!searchQuery.trim()) return ordersToFilter;
    
    const query = searchQuery.toLowerCase();
    return ordersToFilter.filter(order => {
      // Search by order number
      if (order.order_number?.toLowerCase().includes(query)) return true;
      
      // Search by customer name
      if (order.customer_name?.toLowerCase().includes(query)) return true;
      
      // Search by status
      if (order.order_statuses?.name?.toLowerCase().includes(query)) return true;
      
      // Search by designer name
      if (order.desainer?.nama?.toLowerCase().includes(query)) return true;
      
      // Search by admin name
      if (order.admin?.nama?.toLowerCase().includes(query)) return true;
      
      // Search by items
      if (order.order_items?.some(item => 
        item.item_name?.toLowerCase().includes(query)
      )) return true;
      
      return false;
    });
  };
  
  // Untuk kanban view, gunakan semua orders (tidak difilter)
  // Untuk table view, filter berdasarkan status dan search query
  const orders = viewMode === 'table' 
    ? searchFilteredOrders(filteredOrdersForTable) 
    : allOrders;
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fadeReload, setFadeReload] = useState(false);
  const hasAccess = useHasAccess();
  const { data: products } = useProducts();
  
  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        await databaseService.initialize();
        const employees = await databaseService.query<Employee>('employees', {
          select: 'id, nama, kode, posisi, status'
        });
        setEmployees(employees || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

  // Handle browser tab close/refresh to clean up print overlay state
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (showPrintOverlay) {
        setShowPrintOverlay(false);
        setPrintOrderData(null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showPrintOverlay]);

  // Realtime WebSocket: subscribe ke perubahan tabel orders
  React.useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      try {
        // Check if Supabase is available for realtime
        const { isSupabaseAvailable, getSupabaseClient } = await import('@/integrations/supabase/client');
        
        if (isSupabaseAvailable()) {
          const supabase = getSupabaseClient();
          if (supabase) {
            channel = supabase
              .channel('orders-changes')
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                  // Bisa cek payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
                  refetch();
                }
              )
              .subscribe();
          }
        }
      } catch (error) {
        console.warn('Realtime subscription not available:', error);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        try {
          // Channel cleanup is handled by the database service
          console.log('Cleaning up real-time channel');
        } catch (error) {
          console.warn('Error removing channel:', error);
        }
      }
    };
  }, [refetch]);

  // Sinkronkan fadeReload dengan proses fetch data
  React.useEffect(() => {
    if (isFetching) {
      setFadeReload(true); // fade out saat fetch mulai
    } else {
      setTimeout(() => setFadeReload(false), 100); // fade in setelah fetch selesai
    }
  }, [isFetching]);

  const handleOrderModalSubmit = (orderData: object) => {
    // The order is automatically saved through the RequestOrderModal using useOrders hook
    // The order list will automatically refresh due to React Query invalidation
    console.log('Order submitted:', orderData);
  };

  const updateOrderStatus = async (orderId: string, status_id: string) => {
    try {
      // Cari order lama dari state
      const oldOrder = orders.find(order => order.id === orderId);
      if (!oldOrder) throw new Error('Order not found');

      // Kirim order_items lama ke parameter items
      await updateOrder({
        orderId,
        orderData: { status_id: parseInt(status_id) },
        items: oldOrder.order_items || [],
      });
      // toast({
      //   title: 'Status Updated',
      //   description: `Order status changed`,
      // });
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui status order',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    console.log(`Drag ended: moving order ${draggableId} to ${newStatus}`);
    
    // The updateOrderStatus will be called by the KanbanBoard component
  };

  const handleOrderClick = (order: OrderWithItems) => {
    // Prevent click if print overlay is open
    if (showPrintOverlay) {
      return;
    }
    setSelectedOrder(order);
  };

  const handleEditOrder = (order: OrderWithItems) => {
    setEditingOrder(order);
    setShowRequestModal(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
  };

  const handleModalClose = () => {
    setShowRequestModal(false);
    setEditingOrder(null);
  };

  const handlePrintNota = (order: OrderWithItems) => {
    setPrintOrderData(order);
    setShowPrintOverlay(true);
  };

  const handlePrintOverlayClose = () => {
    setShowPrintOverlay(false);
    setPrintOrderData(null);
    // Clear any pending toast notifications that might interfere with UI
    clearToastsWithDelay(100);
  };

  const handlePrintSuccess = async () => {
    if (printOrderData) {
      try {
        toast({
          title: 'Berhasil',
          description: 'Nota berhasil dicetak',
        });
        // Close print overlay after successful print
        setTimeout(() => {
          handlePrintOverlayClose();
        }, 1000);
      } catch (error) {
        toast({
          title: 'Gagal',
          description: 'Gagal mencetak nota',
          variant: 'destructive',
        });
      }
    }
  };

  const handleReload = async () => {
    setFadeReload(true);
    setTimeout(async () => {
      await refetch();
      setFadeReload(false);
    }, 250); // fade out dulu, lalu refetch dan fade in
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Orderan</h1>
          <p className="text-gray-600">Manajemen order dan request pelanggan</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search bar - hanya tampil di table view */}
          {viewMode === 'table' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari order, customer, status..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            {/* Tombol Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReload}
              className={`flex items-center${fadeReload ? ' opacity-50 pointer-events-none' : ''}`}
              title="Refresh Orders"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4${isFetching ? ' animate-spin' : ''}`} />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
            >
              <Grid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
          {hasAccess('Orderan', 'create_order') && (
            <Button 
              onClick={() => setShowRequestModal(true)}
              className="bg-[#0050C8] hover:bg-[#003a9b]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Order Baru
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">Tidak ada orderan</p>
            <p className="text-gray-400">Buat orderan baru untuk memulai </p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'kanban' ? (
            <KanbanBoard 
              orders={orders} 
              onDragEnd={handleDragEnd} 
              onOrderClick={handleOrderClick}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onUpdateOrderStatus={updateOrderStatus}
              onPrintNota={handlePrintNota}
              employees={employees}
              fadeReload={fadeReload}
            />
          ) : (
            <OrderTable orders={orders} onUpdateStatus={updateOrderStatus} onOrderClick={handleOrderClick} onEditOrder={handleEditOrder} onDeleteOrder={handleDeleteOrder} />
          )}
        </>
      )}

      <RequestOrderModal
        open={showRequestModal}
        onClose={handleModalClose}
        onSubmit={handleOrderModalSubmit}
        editingOrder={editingOrder as any}
        onReopen={(restoredEditingOrder) => {
          setEditingOrder(restoredEditingOrder as any);
          setShowRequestModal(true);
        }}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">Customer:</label>
                <p>
                  {selectedOrder.customer_name || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="font-semibold">Items:</label>
                <div className="space-y-1">
                  {(selectedOrder.order_items || []).map((orderItem: any, index: number) => {
                    // Cari nama produk berdasarkan item_name (kode produk)
                    const product = products?.find(p => p.kode === orderItem.item_name);
                    const displayName = product?.nama || orderItem.item_name || 'Item tidak diketahui';
                    
                    return (
                      <div key={index} className="text-sm bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                        <div className="font-medium">{displayName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="font-semibold">Total:</label>
                <p className="text-[#0050C8] font-semibold">{formatCurrency(selectedOrder.total_amount || 0)}</p>
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <p className="capitalize">{selectedOrder.order_statuses?.name || 'Tidak diketahui'}</p>
              </div>
              <div>
                <label className="font-semibold">Tanggal Order:</label>
                <p>{selectedOrder.tanggal ? new Date(selectedOrder.tanggal).toLocaleDateString('id-ID', {
                  timeZone: 'Asia/Kuala_Lumpur',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }) : 'Belum ditentukan'}</p>
              </div>
              <div>
                <label className="font-semibold">Deadline:</label>
                <p>{selectedOrder.estimasi || 'Belum ditentukan'}</p>
              </div>
              <div>
                <label className="font-semibold">Admin:</label>
                <p>
                  {selectedOrder.admin?.nama || 'Belum ditugaskan'}
                </p>
              </div>
              <div>
                <label className="font-semibold">Designer:</label>
                <p>
                  {selectedOrder.desainer?.nama || 'Belum ditugaskan'}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Print Overlay */}
      {printOrderData && (
        <PrintOverlay
          isOpen={showPrintOverlay}
          onClose={handlePrintOverlayClose}
          onPrint={handlePrintSuccess}
          title="Print Nota"
          printType="nota"
          preventCloseOnOutsideClick={true}
          orderData={{
            orderNumber: printOrderData.order_number,
            customerName: printOrderData.customer_name,
            totalAmount: printOrderData.total_amount,
            desain: printOrderData.biaya_lain || 0,
            biayaLainnya: printOrderData.biaya_lain || 0,
            downPayment: printOrderData.down_payment || 0,
            pelunasan: printOrderData.pelunasan || 0,
            estimasi: printOrderData.estimasi,
            estimasiWaktu: printOrderData.waktu,
            komputer: printOrderData.admin?.nama,
            desainer: printOrderData.desainer?.nama,
          }}
          orderList={(printOrderData.order_items || []).map((item: any) => {
            // Convert product code to product name if needed (for backward compatibility)
            const product = products?.find(p => p.kode === item.item_name);
            const displayName = product?.nama || item.item_name; // Use product name if found, otherwise use existing value
            
            return {
              id: item.id,
              item: displayName,
              quantity: item.quantity,
              subTotal: item.sub_total,
              ukuran: {
                panjang: item.panjang,
                lebar: item.lebar,
              },
              description: item.description,
              finishing: item.finishing,
            };
          })}
          onCloseAndReopenRequestOrder={() => {
            setEditingOrder(printOrderData);
            setShowRequestModal(true);
            setShowPrintOverlay(false);
          }}
        />
      )}
    </div>
  );
};

export default Orderan;
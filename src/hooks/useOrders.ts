import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { OrderWithItems } from '@/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

interface OrderWithItemsExtended extends OrderWithItems {
  order_statuses?: { id: number; name: string } | null;
  admin?: { id: string; nama: string } | null;
  desainer?: { id: string; nama: string } | null;
  payment_types?: { id: string; type: string; payment_method: string } | null;
  payment_update?: string | null; // Add payment_update field
}

// Helper function to create notification
const createNotification = async (
  type: 'order_created' | 'order_deleted' | 'order_updated' | 'order_processing' | 'order_completed',
  message: string,
  orderId?: string,
  orderData?: any
) => {
  try {
    // Get current user info
    const { authService } = await import('@/services/authService');
    const currentUser = authService.getCurrentUser();
    const userName = currentUser?.nama || currentUser?.username || 'System';
    
    await databaseService.create('notifications', {
      type,
      message,
      order_id: orderId,
      order_data: orderData,
      user_name: userName,
      timestamp: new Date().toISOString(),
      is_read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const useOrders = (options?: { enableAutoRefresh?: boolean }) => {
  const { enableAutoRefresh = false } = options || {};
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        await databaseService.initialize();
        
        // Get orders with related data
        const ordersData = await databaseService.query('orders', {
          orderBy: { column: 'created_at', direction: 'desc' }
        });

        // Get order items for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order: any) => {
            const orderItems = await databaseService.query('order_items', {
              where: { order_id: order.id }
            });

            // Get related data
            const orderStatus = order.status_id ? 
              await databaseService.query('order_statuses', {
                where: { id: order.status_id },
                limit: 1
              }) : [];

            const admin = order.admin_id ? 
              await databaseService.query('employees', {
                where: { id: order.admin_id },
                limit: 1
              }) : [];

            const desainer = order.desainer_id ? 
              await databaseService.query('employees', {
                where: { id: order.desainer_id },
                limit: 1
              }) : [];

            const paymentType = order.payment_type_id ? 
              await databaseService.query('payment_types', {
                where: { id: order.payment_type_id },
                limit: 1
              }) : [];

            return {
              ...order,
              order_items: orderItems,
              order_statuses: orderStatus[0] || null,
              admin: admin[0] || null,
              desainer: desainer[0] || null,
              payment_types: paymentType[0] || null
            };
          })
        );

        return ordersWithItems as OrderWithItemsExtended[];
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
    refetchInterval: enableAutoRefresh ? 3000 : false, // conditional polling
    refetchOnWindowFocus: enableAutoRefresh, // conditional refetch on focus
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ orderData, items }: { orderData: OrderInsert; items: OrderItemInsert[] }) => {
      try {
        await databaseService.initialize();
        
        // Add payment_update timestamp when creating order
        const orderDataWithPaymentUpdate = {
          ...orderData,
          payment_update: new Date().toISOString()
        };

        // First create the order
        const order = await databaseService.create('orders', orderDataWithPaymentUpdate);

        // Then create the order items
        const orderItems = items.map(item => ({
          ...item,
          order_id: order.id
        }));

        for (const item of orderItems) {
          await databaseService.create('order_items', item);
        }

        return order;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    onSuccess: async (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['today-order-stats'] });
      
      // Create notification for new order
      await createNotification(
        'order_created',
        `Orderan baru ditambahkan dengan nomor ${order.nomor_order || order.id}`,
        order.id,
        { nomor_order: order.nomor_order }
      );
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: "Gagal Membuat Order",
        description: "Terjadi kesalahan saat menyimpan order. Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, orderData, items }: { orderId: string; orderData: OrderUpdate; items?: OrderItemInsert[] }) => {
      try {
        await databaseService.initialize();
        
        // Get original order to compare status
        const originalOrders = await databaseService.query('orders', {
          where: { id: orderId },
          limit: 1
        });
        const originalOrder = originalOrders[0];
        
        if (!originalOrder) {
          throw new Error('Order not found');
        }
        
        // Don't manually set payment_update here - let the database trigger handle it
        // The trigger will only update payment_update when down_payment or pelunasan actually changes
        const updateData = { ...orderData };

        // Update the order
        const updatedOrder = await databaseService.update('orders', orderId, updateData);

        // Only update order items if items is provided and not empty
        if (items && items.length > 0) {
          // Delete existing order items
          const existingItems = await databaseService.query('order_items', {
            where: { order_id: orderId }
          });
          
          for (const item of existingItems) {
            await databaseService.delete('order_items', item.id);
          }
          
          // Insert new items
          const newItems = items.map(item => ({
            ...item,
            order_id: updatedOrder.id
          }));

          if (newItems.length > 0) {
            for (const item of newItems) {
              await databaseService.create('order_items', item);
            }
          }
        }

        return { updatedOrder, originalOrder, statusChanged: originalOrder?.status_id !== orderData.status_id };
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    },

    onSuccess: async ({ updatedOrder, originalOrder, statusChanged }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['today-order-stats'] });
      
      // Create notification based on what changed
      if (statusChanged && updatedOrder.status_id) {
        // Status changed notification
        await createNotification(
          'order_processing',
          `Status orderan ${updatedOrder.nomor_order || originalOrder?.nomor_order} telah diubah`,
          updatedOrder.id,
          { nomor_order: updatedOrder.nomor_order, status_id: updatedOrder.status_id }
        );
      } else {
        // General update notification
        await createNotification(
          'order_updated',
          `Orderan ${updatedOrder.nomor_order || originalOrder?.nomor_order} telah diperbarui`,
          updatedOrder.id,
          { nomor_order: updatedOrder.nomor_order }
        );
      }
    },

    onError: (error) => {
      console.error('Error updating order:', error);
      toast({
        title: "Gagal Memperbarui Order",
        description: `Terjadi kesalahan saat memperbarui order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Get order info before deleting
      const orderToDelete = await databaseService.query('orders', {
        where: { id: orderId },
        select: 'nomor_order',
        limit: 1
      });
      
      // Use the deleteOrderFromDatabase service which handles stock restoration
      const { deleteOrderFromDatabase } = await import('@/services/deleteOrderService');
      await deleteOrderFromDatabase(orderId);
      
      return orderToDelete;
    },
    onSuccess: async (orderToDelete) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['today-order-stats'] });
      
      // Create notification for deleted order
      await createNotification(
        'order_deleted',
        `Orderan ${orderToDelete?.nomor_order || 'telah'} dihapus`,
        undefined,
        { nomor_order: orderToDelete?.nomor_order }
      );
    },
    onError: (error) => {
      toast({
        title: "Gagal Menghapus Order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    orders,
    isLoading,
    isFetching, // tambahkan ini
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
    updateOrder: updateOrderMutation.mutateAsync,
    isUpdatingOrder: updateOrderMutation.isPending,
    deleteOrder: deleteOrderMutation.mutateAsync,
    refetch, // tambahkan refetch di sini
  };
};

// Custom hook: Statistik order hari ini

export const useTodayOrderStats = (options?: { enableAutoRefresh?: boolean }) => {
  const { enableAutoRefresh = false } = options || {};
  
  return useQuery({
    queryKey: ['today-order-stats'],
    queryFn: async () => {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      // Ambil semua order hari ini berdasarkan created_at untuk pendapatan dan transaksi
      const todayOrders = await databaseService.query('orders', {
        select: 'total_amount, desainer_id',
        where: {
          created_at_gte: todayStart,
          created_at_lt: todayEnd
        }
      });
      
      const orders = todayOrders || [];
      
      // Ambil SEMUA order yang belum memiliki designer (belum diproses)
      // Tidak peduli kapan dibuat atau apakah deadline sudah lewat
      const unprocessedOrders = await databaseService.query('orders', {
        select: 'id',
        where: { desainer_id: null }
      });
      
      // Hitung statistik
      const totalPendapatan = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const totalTransaksi = orders.length;
      const belumDiproses = (unprocessedOrders || []).length; // Semua orderan tanpa designer
      
      return { totalPendapatan, totalTransaksi, belumDiproses };
    },
    refetchInterval: enableAutoRefresh ? 3000 : false,
    refetchOnWindowFocus: enableAutoRefresh,
  });
};

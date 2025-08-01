import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { OrderWithItems } from '@/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

interface OrderWithItemsExtended extends OrderWithItems {
  order_statuses?: { id: number; name: string };
  admin?: { id: string; nama: string };
  desainer?: { id: string; nama: string };
}

export const useOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_statuses:order_statuses (id, name),
          admin:admin_id (id, nama),
          desainer:desainer_id (id, nama)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithItemsExtended[];
    },
    refetchInterval: 3000, // polling setiap 3 detik
    refetchOnWindowFocus: true, // opsional, refetch saat window aktif
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ orderData, items }: { orderData: OrderInsert; items: OrderItemInsert[] }) => {
      // First create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Then create the order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: "Error creating order",
        description: "There was an error saving the order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, orderData, items }: { orderId: string; orderData: OrderUpdate; items?: OrderItemInsert[] }) => {
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Only update order items if items is provided and not empty
      if (items && items.length > 0) {
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId);

        if (deleteError) {
          // Optional: Handle case where deletion fails but order was updated
          console.error('Failed to delete old items, but order was updated. Manual cleanup may be required.');
          throw deleteError;
        }
        
        const newItems = items.map(item => ({
          ...item,
          order_id: updatedOrder.id
        }));

        if(newItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(newItems);
    
          if (itemsError) throw itemsError;
        }
      }

      return updatedOrder;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // toast({
      //   title: "Order updated successfully",
      //   description: "The order has been updated in the database.",
      // });
    },

    onError: (error) => {
      console.error('Error updating order:', error);
      toast({
        title: "Error updating order",
        description: `There was an error updating the order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Use the deleteOrderFromDatabase service which handles stock restoration
      const { deleteOrderFromDatabase } = await import('@/services/deleteOrderService');
      await deleteOrderFromDatabase(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order deleted successfully",
        description: "The order has been removed from the database.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting order",
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

export const useTodayOrderStats = () => {
  return useQuery({
    queryKey: ['today-order-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      // Ambil semua order hari ini
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, desainer_id')
        .eq('tanggal', today);
      if (error) throw error;
      const orders = data || [];
      // Hitung statistik
      const totalPendapatan = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const totalTransaksi = orders.length;
      const belumDiproses = orders.filter(o => !o.desainer_id).length;
      return { totalPendapatan, totalTransaksi, belumDiproses };
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
};

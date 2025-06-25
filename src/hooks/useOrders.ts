import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { deleteOrderFromDatabase } from '@/services/deleteOrderService';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export const useOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_statuses (name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Ensure order_items always exists as an array
      return (data as any[]).map(order => ({
        ...order,
        order_items: order.order_items ?? [],
      })) as OrderWithItems[];
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ orderData, items }: { orderData: OrderInsert; items: OrderItemInsert[] }) => {
      // 1. Get the next order number from the database
      const { data: orderNumber, error: orderNumberError } = await supabase.rpc('get_next_order_number');
      if (orderNumberError) throw orderNumberError;
      const orderNum = Array.isArray(orderNumber) ? orderNumber[0] : orderNumber;

      // 2. Add the order number to the orderData
      const orderPayload = {
        ...orderData,
        order_number: orderNum,
      };

      // 3. Create the order as usual
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
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
      toast({
        title: "Order created successfully",
        description: "The order has been saved to the database.",
      });
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
    mutationFn: async ({ orderId, orderData, items }: { orderId: string; orderData: OrderUpdate; items: OrderItemInsert[] }) => {
      // Update the order
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Delete old order items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      // Insert new order items
      const newItems = items.map(item => ({ ...item, order_id: updatedOrder.id }));
      if (newItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(newItems);
        if (itemsError) throw itemsError;
      }

      return updatedOrder;
    },
    // === OPTIMISTIC UI PATCH START ===
    onMutate: async ({ orderId, orderData }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData(['orders']);

      // Optimistically update status_id and order_statuses in cache
      queryClient.setQueryData(['orders'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(order =>
          order.id === orderId
            ? {
                ...order,
                status_id: orderData.status_id,
                order_statuses: order.order_statuses
                  ? { ...order.order_statuses, id: orderData.status_id }
                  : { id: orderData.status_id }
              }
            : order
        );
      });

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      toast({
        title: 'Error updating order',
        description: 'Failed to update order status. Changes reverted.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    // === OPTIMISTIC UI PATCH END ===
    onSuccess: () => {
      toast({
        title: 'Order updated successfully',
        description: 'The order has been updated in the database.',
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await deleteOrderFromDatabase(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order deleted",
        description: "Order has been deleted from the database.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting order",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    orders,
    isLoading,
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    updateOrder: updateOrderMutation.mutate,
    isUpdatingOrder: updateOrderMutation.isPending,
    deleteOrder: deleteOrderMutation.mutate,
    isDeletingOrder: deleteOrderMutation.isPending,
  };
};
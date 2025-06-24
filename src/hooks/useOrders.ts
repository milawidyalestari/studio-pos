import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

interface OrderWithItems extends Order {
  order_items?: OrderItem[];
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
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
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
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

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

      return updatedOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order updated successfully",
        description: "The order has been updated in the database.",
      });
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

  return {
    orders,
    isLoading,
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    updateOrder: updateOrderMutation.mutate,
    isUpdatingOrder: updateOrderMutation.isPending,
  };
};

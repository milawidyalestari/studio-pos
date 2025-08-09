import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dataAccess, type Order, type CreateOrderData } from '@/lib/data-access';
import { databaseManager } from '@/lib/database-manager';

export const useOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get database info for environment detection
  const { data: dbInfo } = useQuery({
    queryKey: ['database-info'],
    queryFn: async () => {
      return await databaseManager.getInfo();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await dataAccess.getOrders({
        orderBy: { column: 'created_at', direction: 'desc' }
      });
    },
    refetchInterval: dbInfo?.type === 'supabase' ? 3000 : false, // Only poll for Supabase
    refetchOnWindowFocus: dbInfo?.type === 'supabase', // Only refetch on focus for Supabase
    enabled: !!dbInfo, // Only run when database info is available
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ orderData, items }: { orderData: CreateOrderData; items: any[] }) => {
      // Create order with items in a transaction
      const operations = [
        {
          type: 'create' as const,
          table: 'orders',
          data: orderData
        },
        ...items.map(item => ({
          type: 'create' as const,
          table: 'order_items',
          data: {
            ...item,
            order_id: '{{NEW_ORDER_ID}}' // Will be replaced by transaction
          }
        }))
      ];

      const results = await dataAccess.transaction(operations);
      return results[0] as Order; // First result is the order
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order berhasil dibuat",
        description: "Order telah disimpan ke database.",
      });
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      return await dataAccess.updateOrder(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order berhasil diupdate",
        description: "Perubahan telah disimpan.",
      });
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast({
        title: "Gagal Mengupdate Order",
        description: "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.",
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
      // Removed toast notification for delete as requested
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
    orders: orders || [],
    isLoading,
    isFetching,
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
    updateOrder: updateOrderMutation.mutateAsync,
    isUpdatingOrder: updateOrderMutation.isPending,
    deleteOrder: deleteOrderMutation.mutateAsync,
    refetch,
    dbInfo, // Expose database info for UI
  };
};

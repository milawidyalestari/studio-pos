import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderStatus {
  id: number;
  name: string;
  display_order: number;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useOrderStatus() {
  return useQuery({
    queryKey: ['order-statuses'],
    queryFn: async () => {
      console.log('Fetching order statuses from database...');
      
      const { data, error } = await supabase
        .from('order_statuses')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching order statuses:', error);
        throw error;
      }

      console.log('Order statuses fetched successfully:', data);
      return data as OrderStatus[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
} 
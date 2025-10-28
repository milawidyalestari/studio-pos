import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';

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
      
      const data = await databaseService.query<OrderStatus>('order_statuses', {
        orderBy: { column: 'display_order', direction: 'asc' }
      });

      console.log('Order statuses fetched successfully:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
} 
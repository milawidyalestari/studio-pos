
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';

export interface Transaction {
  id: string;
  order_id?: string;
  order_number?: string; // Add order_number from joined orders table
  customer_name?: string;
  transaction_date: string;
  amount: number;
  payment_method: string;
  category?: string;
  notes?: string;
  created_at: string;
  status?: string; // Add status for payment info (lunas/belum lunas)
}

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      console.log('Fetching all transactions from database...');
      
      const data = await databaseService.query<Transaction>('transactions', {
        orderBy: { column: 'transaction_date', direction: 'desc' }
      });

      console.log('Transactions fetched successfully:', data);
      console.log('Total transactions found:', data?.length || 0);
      
      return data;
    },
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchInterval: 60000, // Refetch every minute to get new transactions
  });
};

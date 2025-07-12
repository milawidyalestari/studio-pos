
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          orders!transactions_order_id_fkey (
            order_number
          )
        `)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log('Transactions fetched successfully:', data);
      console.log('Total transactions found:', data?.length || 0);
      
      // Transform the data to flatten the order_number
      const transformedData = data?.map(transaction => ({
        ...transaction,
        order_number: transaction.orders?.order_number || null
      })) || [];
      
      return transformedData as Transaction[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchInterval: 60000, // Refetch every minute to get new transactions
  });
};

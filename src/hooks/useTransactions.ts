
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  order_id?: string;
  customer_name?: string;
  transaction_date: string;
  amount: number;
  payment_method: string;
  category?: string;
  notes?: string;
  created_at: string;
}

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      console.log('Fetching all transactions from database...');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log('Transactions fetched successfully:', data);
      console.log('Total transactions found:', data?.length || 0);
      
      return data as Transaction[];
    },
    // Force refetch to get the new data
    staleTime: 0,
    refetchOnMount: true,
  });
};

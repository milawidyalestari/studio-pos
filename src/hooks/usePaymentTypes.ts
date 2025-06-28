
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentType {
  id: string;
  code: string;
  type: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export const usePaymentTypes = () => {
  return useQuery({
    queryKey: ['payment-types'],
    queryFn: async () => {
      console.log('Fetching payment types from database...');
      
      const { data, error } = await supabase
        .from('payment_types')
        .select('*')
        .order('type', { ascending: true });

      if (error) {
        console.error('Error fetching payment types:', error);
        throw error;
      }

      console.log('Payment types fetched successfully:', data);
      return data as PaymentType[];
    },
  });
};

export const useCreatePaymentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentTypeData: Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payment_types')
        .insert([paymentTypeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
    },
  });
};

export const useUpdatePaymentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...paymentTypeData }: Partial<PaymentType> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_types')
        .update(paymentTypeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
    },
  });
};

export const useDeletePaymentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
    },
  });
};

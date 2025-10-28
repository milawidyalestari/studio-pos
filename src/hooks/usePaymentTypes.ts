
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';

export interface PaymentType {
  id: string;
  code: string;
  type: string;
  payment_method: string;
  account_id?: string;
  created_at: string;
  updated_at: string;
}

export const usePaymentTypes = () => {
  return useQuery({
    queryKey: ['payment-types'],
    queryFn: async () => {
      console.log('Fetching payment types from database...');
      
      const data = await databaseService.query<PaymentType>('payment_types', {
        orderBy: { column: 'type', direction: 'asc' }
      });

      console.log('Payment types fetched successfully:', data);
      return data;
    },
  });
};

export const useCreatePaymentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentTypeData: Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>) => {
      return await databaseService.create<PaymentType>('payment_types', paymentTypeData as Omit<PaymentType, 'id'>);
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
      return await databaseService.update('payment_types', id, paymentTypeData);
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
      await databaseService.delete('payment_types', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
    },
  });
};

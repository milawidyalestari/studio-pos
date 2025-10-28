/**
 * Custom React Hook for Payment Method Accounts
 * 
 * Hook untuk mengelola mapping tipe pembayaran ke akun akuntansi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodAccountService, CreatePaymentMethodAccountData, UpdatePaymentMethodAccountData } from '@/services/paymentMethodAccountService';
import { toast } from 'sonner';

export const usePaymentMethodAccounts = () => {
  const queryClient = useQueryClient();

  // Get all payment method accounts
  const usePaymentMethodAccounts = () => {
    return useQuery({
      queryKey: ['payment-method-accounts'],
      queryFn: async () => {
        const { data, error } = await paymentMethodAccountService.getPaymentMethodAccounts();
        if (error) throw error;
        return data;
      },
    });
  };

  // Get specific payment method account
  const usePaymentMethodAccount = (paymentMethod: string) => {
    return useQuery({
      queryKey: ['payment-method-account', paymentMethod],
      queryFn: async () => {
        const { data, error } = await paymentMethodAccountService.getPaymentMethodAccount(paymentMethod);
        if (error) throw error;
        return data;
      },
      enabled: !!paymentMethod,
    });
  };

  // Get available payment methods
  const useAvailablePaymentMethods = () => {
    return useQuery({
      queryKey: ['available-payment-methods'],
      queryFn: async () => {
        const { data, error } = await paymentMethodAccountService.getAvailablePaymentMethods();
        if (error) throw error;
        return data;
      },
    });
  };

  // Create payment method account mutation
  const createPaymentMethodAccount = useMutation({
    mutationFn: async (data: CreatePaymentMethodAccountData) => {
      const { data: result, error } = await paymentMethodAccountService.createPaymentMethodAccount(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Mapping pembayaran berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['payment-method-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['available-payment-methods'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal membuat mapping: ${error.message}`);
    },
  });

  // Update payment method account mutation
  const updatePaymentMethodAccount = useMutation({
    mutationFn: async ({ paymentMethod, data }: { paymentMethod: string; data: UpdatePaymentMethodAccountData }) => {
      const { data: result, error } = await paymentMethodAccountService.updatePaymentMethodAccount(paymentMethod, data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Mapping pembayaran berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['payment-method-accounts'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal mengupdate mapping: ${error.message}`);
    },
  });

  // Toggle status mutation
  const togglePaymentMethodAccountStatus = useMutation({
    mutationFn: async (paymentMethod: string) => {
      const { data: result, error } = await paymentMethodAccountService.togglePaymentMethodAccountStatus(paymentMethod);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Status mapping berhasil diubah');
      queryClient.invalidateQueries({ queryKey: ['payment-method-accounts'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal mengubah status: ${error.message}`);
    },
  });

  // Delete payment method account mutation
  const deletePaymentMethodAccount = useMutation({
    mutationFn: async (paymentMethod: string) => {
      const { error } = await paymentMethodAccountService.deletePaymentMethodAccount(paymentMethod);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mapping pembayaran berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['payment-method-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['available-payment-methods'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus mapping: ${error.message}`);
    },
  });

  return {
    // Queries
    usePaymentMethodAccounts,
    usePaymentMethodAccount,
    useAvailablePaymentMethods,

    // Mutations
    createPaymentMethodAccount,
    updatePaymentMethodAccount,
    togglePaymentMethodAccountStatus,
    deletePaymentMethodAccount,
  };
};

/**
 * Hook untuk mendapatkan akun berdasarkan tipe pembayaran
 */
export const useAccountForPaymentMethod = (paymentMethod: string) => {
  return useQuery({
    queryKey: ['account-for-payment-method', paymentMethod],
    queryFn: async () => {
      const { data, error } = await paymentMethodAccountService.getAccountForPaymentMethod(paymentMethod);
      if (error) throw error;
      return data;
    },
    enabled: !!paymentMethod,
  });
};

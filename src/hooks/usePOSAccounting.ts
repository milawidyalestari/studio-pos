/**
 * Custom React Hook for POS-Accounting Integration
 * 
 * Hook untuk memudahkan integrasi POS dengan sistem akuntansi
 * di komponen React.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posAccountingService, PaymentReceiptData, ExpenseData } from '@/services/posAccountingService';
import { toast } from 'sonner';

export const usePOSAccounting = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get order journal entries
  const useOrderJournalEntries = (orderId?: string) => {
    return useQuery({
      queryKey: ['order-journal-entries', orderId],
      queryFn: async () => {
        const { data, error } = await posAccountingService.getOrderJournalEntries(orderId);
        if (error) throw error;
        return data;
      },
    });
  };

  // Get outstanding receivables
  const useOutstandingReceivables = () => {
    return useQuery({
      queryKey: ['outstanding-receivables'],
      queryFn: async () => {
        const { data, error } = await posAccountingService.getOutstandingReceivables();
        if (error) throw error;
        return data;
      },
    });
  };

  // Get sales summary
  const useSalesSummary = (startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: ['sales-summary', startDate, endDate],
      queryFn: async () => {
        const { data, error } = await posAccountingService.getSalesSummary(startDate, endDate);
        if (error) throw error;
        return data;
      },
    });
  };

  // Get cash flow
  const useCashFlow = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['cash-flow', startDate, endDate],
      queryFn: async () => {
        const { data, error } = await posAccountingService.getCashFlow(startDate, endDate);
        if (error) throw error;
        return data;
      },
      enabled: !!startDate && !!endDate,
    });
  };

  // Get account balance
  const useAccountBalance = (accountCode: string) => {
    return useQuery({
      queryKey: ['account-balance', accountCode],
      queryFn: async () => {
        const { data, error } = await posAccountingService.getAccountBalance(accountCode);
        if (error) throw error;
        return data;
      },
      enabled: !!accountCode,
    });
  };

  // Record payment receipt mutation
  const recordPaymentReceipt = useMutation({
    mutationFn: async (data: PaymentReceiptData) => {
      const { data: result, error } = await posAccountingService.recordPaymentReceipt(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Pembayaran berhasil dicatat');
      queryClient.invalidateQueries({ queryKey: ['outstanding-receivables'] });
      queryClient.invalidateQueries({ queryKey: ['order-journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal mencatat pembayaran: ${error.message}`);
    },
  });

  // Record expense mutation
  const recordExpense = useMutation({
    mutationFn: async (data: ExpenseData) => {
      const { data: result, error } = await posAccountingService.recordExpense(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Pengeluaran berhasil dicatat');
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal mencatat pengeluaran: ${error.message}`);
    },
  });

  // Verify journal balance
  const verifyJournalBalance = useCallback(async (journalEntryId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await posAccountingService.verifyJournalBalance(journalEntryId);
      if (error) {
        toast.error(`Gagal memverifikasi jurnal: ${error.message}`);
        return false;
      }
      if (data) {
        toast.success('Jurnal seimbang');
      } else {
        toast.error('Jurnal tidak seimbang');
      }
      return data;
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Queries
    useOrderJournalEntries,
    useOutstandingReceivables,
    useSalesSummary,
    useCashFlow,
    useAccountBalance,

    // Mutations
    recordPaymentReceipt,
    recordExpense,

    // Utils
    verifyJournalBalance,
    isLoading,
  };
};

/**
 * Hook untuk mendapatkan cash balance (saldo kas)
 */
export const useCashBalance = () => {
  return useQuery({
    queryKey: ['cash-balance'],
    queryFn: async () => {
      const { data, error } = await posAccountingService.getAccountBalance('1110');
      if (error) throw error;
      return data || 0;
    },
  });
};

/**
 * Hook untuk mendapatkan total receivables (total piutang)
 */
export const useTotalReceivables = () => {
  return useQuery({
    queryKey: ['total-receivables'],
    queryFn: async () => {
      const { data, error } = await posAccountingService.getAccountBalance('1130');
      if (error) throw error;
      return data || 0;
    },
  });
};

/**
 * Hook untuk dashboard metrics
 */
export const useAccountingMetrics = () => {
  const { data: cashBalance, isLoading: loadingCash } = useCashBalance();
  const { data: totalReceivables, isLoading: loadingReceivables } = useTotalReceivables();
  
  const today = new Date().toISOString().split('T')[0];
  const { data: todaySales, isLoading: loadingSales } = useQuery({
    queryKey: ['today-sales'],
    queryFn: async () => {
      const { data, error } = await posAccountingService.getSalesSummary(today, today);
      if (error) throw error;
      return data?.[0]?.total_sales || 0;
    },
  });

  const { data: outstandingOrders, isLoading: loadingOutstanding } = useQuery({
    queryKey: ['outstanding-count'],
    queryFn: async () => {
      const { data, error } = await posAccountingService.getOutstandingReceivables();
      if (error) throw error;
      return data?.length || 0;
    },
  });

  return {
    metrics: {
      cashBalance: cashBalance || 0,
      totalReceivables: totalReceivables || 0,
      todaySales: todaySales || 0,
      outstandingOrders: outstandingOrders || 0,
    },
    isLoading: loadingCash || loadingReceivables || loadingSales || loadingOutstanding,
  };
};


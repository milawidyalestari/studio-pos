import { useState, useEffect, useCallback } from 'react';
import { accountingService, ChartOfAccount, CashAccount, JournalEntry, CreateJournalEntryData, CreateCashAccountData } from '@/services/accountingService';
import { useToast } from '@/hooks/use-toast';

export const useChartOfAccounts = () => {
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const fetchChartOfAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await accountingService.getChartOfAccounts();
      if (error) throw error;
      setChartOfAccounts(data || []);
    } catch (err) {
      setError(err);
      toast({
        title: 'Error',
        description: 'Gagal memuat chart of accounts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createChartOfAccount = useCallback(async (accountData: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await accountingService.createChartOfAccount(accountData);
      if (error) throw error;
      if (data) {
        setChartOfAccounts(prev => [...prev, data]);
        toast({
          title: 'Berhasil',
          description: 'Chart of account berhasil dibuat',
        });
      }
      return { data, error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal membuat chart of account',
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  }, [toast]);

  const updateChartOfAccount = useCallback(async (id: string, accountData: Partial<ChartOfAccount>) => {
    try {
      const { data, error } = await accountingService.updateChartOfAccount(id, accountData);
      if (error) throw error;
      if (data) {
        setChartOfAccounts(prev => prev.map(account => account.id === id ? data : account));
        toast({
          title: 'Berhasil',
          description: 'Chart of account berhasil diperbarui',
        });
      }
      return { data, error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui chart of account',
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  }, [toast]);

  const deleteChartOfAccount = useCallback(async (id: string) => {
    try {
      const { error } = await accountingService.deleteChartOfAccount(id);
      if (error) throw error;
      setChartOfAccounts(prev => prev.filter(account => account.id !== id));
      toast({
        title: 'Berhasil',
        description: 'Chart of account berhasil dihapus',
      });
      return { error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus chart of account',
        variant: 'destructive',
      });
      return { error: err };
    }
  }, [toast]);

  useEffect(() => {
    fetchChartOfAccounts();
  }, [fetchChartOfAccounts]);

  return {
    chartOfAccounts,
    isLoading,
    error,
    fetchChartOfAccounts,
    createChartOfAccount,
    updateChartOfAccount,
    deleteChartOfAccount,
  };
};

export const useCashAccounts = () => {
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [primaryCashAccount, setPrimaryCashAccount] = useState<CashAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const fetchCashAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await accountingService.getCashAccounts();
      if (error) throw error;
      setCashAccounts(data || []);
    } catch (err) {
      setError(err);
      toast({
        title: 'Error',
        description: 'Gagal memuat cash accounts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchPrimaryCashAccount = useCallback(async () => {
    try {
      const { data, error } = await accountingService.getPrimaryCashAccount();
      if (error) throw error;
      setPrimaryCashAccount(data);
    } catch (err) {
      console.error('Error fetching primary cash account:', err);
    }
  }, []);

  const createCashAccount = useCallback(async (cashAccountData: CreateCashAccountData) => {
    try {
      const { data, error } = await accountingService.createCashAccount(cashAccountData);
      if (error) throw error;
      if (data) {
        setCashAccounts(prev => [...prev, data]);
        toast({
          title: 'Berhasil',
          description: 'Cash account berhasil dibuat',
        });
      }
      return { data, error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal membuat cash account',
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  }, [toast]);

  const updateCashAccount = useCallback(async (id: string, cashAccountData: Partial<CashAccount>) => {
    try {
      const { data, error } = await accountingService.updateCashAccount(id, cashAccountData);
      if (error) throw error;
      if (data) {
        setCashAccounts(prev => prev.map(account => account.id === id ? data : account));
        if (data.is_primary) {
          setPrimaryCashAccount(data);
        }
        toast({
          title: 'Berhasil',
          description: 'Cash account berhasil diperbarui',
        });
      }
      return { data, error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui cash account',
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  }, [toast]);

  const updateCashBalance = useCallback(async (accountId: string, amount: number, type: 'debit' | 'credit') => {
    try {
      const { error } = await accountingService.updateCashBalance(accountId, amount, type);
      if (error) throw error;
      
      // Update local state
      setCashAccounts(prev => prev.map(account => {
        if (account.id === accountId) {
          const newBalance = type === 'debit' 
            ? account.current_balance + amount 
            : account.current_balance - amount;
          return { ...account, current_balance: newBalance };
        }
        return account;
      }));

      if (primaryCashAccount?.id === accountId) {
        setPrimaryCashAccount(prev => {
          if (!prev) return prev;
          const newBalance = type === 'debit' 
            ? prev.current_balance + amount 
            : prev.current_balance - amount;
          return { ...prev, current_balance: newBalance };
        });
      }

      return { error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui saldo kas',
        variant: 'destructive',
      });
      return { error: err };
    }
  }, [toast, primaryCashAccount]);

  useEffect(() => {
    fetchCashAccounts();
    fetchPrimaryCashAccount();
  }, [fetchCashAccounts, fetchPrimaryCashAccount]);

  return {
    cashAccounts,
    primaryCashAccount,
    isLoading,
    error,
    fetchCashAccounts,
    fetchPrimaryCashAccount,
    createCashAccount,
    updateCashAccount,
    updateCashBalance,
  };
};

export const useJournalEntries = (limit: number = 50, offset: number = 0) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const fetchJournalEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await accountingService.getJournalEntries(limit, offset);
      if (error) throw error;
      setJournalEntries(data || []);
    } catch (err) {
      setError(err);
      toast({
        title: 'Error',
        description: 'Gagal memuat journal entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, toast]);

  const createJournalEntry = useCallback(async (entryData: CreateJournalEntryData) => {
    try {
      console.log('Creating journal entry with data:', entryData);
      const { data, error } = await accountingService.createJournalEntry(entryData);
      
      if (error) {
        console.error('Error from accounting service:', error);
        throw error;
      }
      
      if (data) {
        setJournalEntries(prev => [data, ...prev]);
        toast({
          title: 'Berhasil',
          description: 'Journal entry berhasil dibuat',
        });
      }
      return { data, error: null };
    } catch (err) {
      console.error('Error in createJournalEntry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat journal entry';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  }, [toast]);

  const postJournalEntry = useCallback(async (id: string) => {
    try {
      const { error } = await accountingService.postJournalEntry(id);
      if (error) throw error;
      
      setJournalEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, status: 'posted' } : entry
      ));
      
      toast({
        title: 'Berhasil',
        description: 'Journal entry berhasil diposting',
      });
      return { error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal memposting journal entry',
        variant: 'destructive',
      });
      return { error: err };
    }
  }, [toast]);

  const cancelJournalEntry = useCallback(async (id: string) => {
    try {
      const { error } = await accountingService.cancelJournalEntry(id);
      if (error) throw error;
      
      setJournalEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, status: 'cancelled' } : entry
      ));
      
      toast({
        title: 'Berhasil',
        description: 'Journal entry berhasil dibatalkan',
      });
      return { error: null };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal membatalkan journal entry',
        variant: 'destructive',
      });
      return { error: err };
    }
  }, [toast]);

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  return {
    journalEntries,
    isLoading,
    error,
    fetchJournalEntries,
    createJournalEntry,
    postJournalEntry,
    cancelJournalEntry,
  };
};

export const useAccounting = () => {
  const chartOfAccounts = useChartOfAccounts();
  const cashAccounts = useCashAccounts();
  const journalEntries = useJournalEntries();

  return {
    chartOfAccounts,
    cashAccounts,
    journalEntries,
  };
};


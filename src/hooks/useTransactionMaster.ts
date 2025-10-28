import { useState, useEffect, useCallback, useRef } from 'react';
import { databaseService } from '@/services/databaseService';
import { Database } from '@/integrations/supabase/types';

type TransactionMaster = Database['public']['Tables']['transaction_master']['Row'];
type TransactionMasterInsert = Database['public']['Tables']['transaction_master']['Insert'];
type TransactionMasterUpdate = Database['public']['Tables']['transaction_master']['Update'];

// Simplified type without problematic joins
type TransactionMasterWithBasicJoins = TransactionMaster & {
  categories?: {
    id: string;
    category_name: string;
    code: string;
    group_name: string;
  } | null;
};

interface UseTransactionMasterOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  filters?: {
    transaction_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    category_id?: string;
  };
}

interface UseTransactionMasterReturn {
  transactions: TransactionMasterWithBasicJoins[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTransaction: (data: Omit<TransactionMasterInsert, 'transaction_code'>) => Promise<TransactionMaster | null>;
  updateTransaction: (id: number, data: TransactionMasterUpdate) => Promise<TransactionMaster | null>;
  deleteTransaction: (id: number) => Promise<boolean>;
  getTransactionById: (id: number) => Promise<TransactionMasterWithBasicJoins | null>;
  generateTransactionCode: () => Promise<string>;
}

export const useTransactionMaster = (options: UseTransactionMasterOptions = {}): UseTransactionMasterReturn => {
  const {
    enableAutoRefresh = false,
    refreshInterval = 30000,
    filters = {}
  } = options;

  const [transactions, setTransactions] = useState<TransactionMasterWithBasicJoins[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent unnecessary re-renders and infinite loops
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const filtersRef = useRef(filters);

  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchTransactions = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log('Fetching transactions with filters:', filtersRef.current);

      await databaseService.initialize();

      // Build where conditions
      const whereConditions: any = {
        deleted_at: null
      };

      // Apply filters
      if (filtersRef.current.transaction_type) {
        whereConditions.transaction_type = filtersRef.current.transaction_type;
      }
      if (filtersRef.current.status) {
        whereConditions.status = filtersRef.current.status;
      }
      if (filtersRef.current.date_from) {
        whereConditions.transaction_date = { gte: filtersRef.current.date_from };
      }
      if (filtersRef.current.date_to) {
        whereConditions.transaction_date = { ...whereConditions.transaction_date, lte: filtersRef.current.date_to };
      }
      if (filtersRef.current.category_id) {
        whereConditions.category_id = filtersRef.current.category_id;
      }

      // Fetch transactions
      const transactions = await databaseService.query('transaction_master', {
        where: whereConditions,
        orderBy: { column: 'transaction_date', direction: 'desc' }
      });

      // Fetch categories for each transaction
      const transactionsWithCategories = await Promise.all(
        transactions.map(async (transaction: any) => {
          if (transaction.category_id) {
            const categories = await databaseService.query('categories', {
              where: { id: transaction.category_id },
              limit: 1
            });
            return {
              ...transaction,
              categories: categories[0] || null
            };
          }
          return {
            ...transaction,
            categories: null
          };
        })
      );

      console.log('Successfully fetched transactions:', transactionsWithCategories?.length || 0);
      setTransactions(transactionsWithCategories || []);
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Fetch request was aborted');
        return;
      }

      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // Remove filters from dependency to prevent infinite loops

  const createTransaction = useCallback(async (data: Omit<TransactionMasterInsert, 'transaction_code'>): Promise<TransactionMaster | null> => {
    try {
      await databaseService.initialize();

      // Generate transaction code (simplified version)
      const timestamp = new Date().getTime();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const transactionCode = `TXN-${timestamp}-${randomSuffix}`;

      // Prepare transaction data with proper defaults
      const transactionData: TransactionMasterInsert = {
        ...data,
        transaction_code: transactionCode,
        // Set category_id to null if not provided to avoid foreign key issues
        category_id: data.category_id || null,
        // Ensure required fields have proper values
        amount: data.amount || 0,
        currency: data.currency || 'IDR',
        status: data.status || 'pending',
        priority: data.priority || 'normal',
        // Don't override created_at and updated_at - let database handle it
      };

      console.log('Creating transaction with data:', transactionData);

      const newTransaction = await databaseService.create('transaction_master', transactionData);

      console.log('Transaction created successfully:', newTransaction);

      // Optimistically update the list
      setTransactions(prev => [newTransaction as TransactionMasterWithBasicJoins, ...prev]);

      return newTransaction;
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      console.error('Error details:', {
        message: errorMessage,
        data: data,
        error: err
      });
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateTransaction = useCallback(async (id: number, data: TransactionMasterUpdate): Promise<TransactionMaster | null> => {
    try {
      await databaseService.initialize();

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const updatedTransaction = await databaseService.update('transaction_master', id, updateData);

      // Optimistically update the list
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction as TransactionMasterWithBasicJoins : t)
      );

      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      return null;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: number): Promise<boolean> => {
    try {
      await databaseService.initialize();

      await databaseService.update('transaction_master', id, { 
        deleted_at: new Date().toISOString() 
      });

      // Optimistically update the list
      setTransactions(prev => prev.filter(t => t.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      return false;
    }
  }, []);

  const getTransactionById = useCallback(async (id: number): Promise<TransactionMasterWithBasicJoins | null> => {
    try {
      await databaseService.initialize();

      const transactions = await databaseService.query('transaction_master', {
        where: { id, deleted_at: null },
        limit: 1
      });

      if (transactions.length === 0) {
        return null;
      }

      const transaction = transactions[0];

      // Fetch category if exists
      if (transaction.category_id) {
        const categories = await databaseService.query('categories', {
          where: { id: transaction.category_id },
          limit: 1
        });
        return {
          ...transaction,
          categories: categories[0] || null
        };
      }

      return {
        ...transaction,
        categories: null
      };
    } catch (err) {
      console.error('Error fetching transaction by ID:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
      return null;
    }
  }, []);

  const generateTransactionCode = useCallback(async (): Promise<string> => {
    try {
      // Generate transaction code (simplified version)
      const timestamp = new Date().getTime();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `TXN-${timestamp}-${randomSuffix}`;
    } catch (err) {
      console.error('Error generating transaction code:', err);
      throw err;
    }
  }, []);

  // Initial fetch - only run once
  useEffect(() => {
    fetchTransactions();
  }, []); // Empty dependency array

  // Auto refresh - only if enabled
  useEffect(() => {
    if (!enableAutoRefresh) return;

    const interval = setInterval(fetchTransactions, refreshInterval);
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enableAutoRefresh, refreshInterval, fetchTransactions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    generateTransactionCode
  };
};

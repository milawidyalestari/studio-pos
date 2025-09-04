import { useState, useEffect, useCallback } from 'react';
import { database, Transaction, Category, FinancialSummary } from '@/lib/database';
import { initializeDatabase } from '@/services/databaseInitService';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export const useDatabase = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    pendingAmount: 0,
    thisMonthIncome: 0,
    thisMonthExpense: 0,
    // Initialize all required fields with safe defaults
    totalSales: 0,
    totalOrders: 0,
    thisMonthSales: 0,
    thisMonthOrders: 0,
    averageOrderValue: 0,
    profitMargin: 0,
    expenseRatio: 0,
    cashFlow: 0,
    financialHealthScore: 100,
    monthlyGrowthRate: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    workingCapital: 0,
    debtToIncomeRatio: 0,
    returnOnInvestment: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const initAndLoadData = async () => {
      // Initialize database first
      await initializeDatabase();
      // Then load data
      await loadData();
    };
    
    initAndLoadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [transactionsData, categoriesData, summaryData, ordersData] = await Promise.all([
        database.getTransactions(),
        database.getCategories(),
        database.getFinancialSummary(),
        loadOrdersData()
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setSummary(summaryData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders data from Supabase
  const loadOrdersData = useCallback(async (): Promise<OrderWithItems[]> => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return [];
      }

      // Validate and transform the data structure
      if (!ordersData || !Array.isArray(ordersData)) {
        console.warn('Orders data is not an array:', ordersData);
        return [];
      }

      // Ensure each order has the expected structure
      const validatedOrders = ordersData
        .filter(order => order && typeof order === 'object' && order.id)
        .map(order => ({
          order: order,
          items: Array.isArray(order.order_items) ? order.order_items : []
        }));

      console.log('Loaded orders:', validatedOrders.length);
      return validatedOrders;
    } catch (err) {
      console.error('Error loading orders data:', err);
      return [];
    }
  }, []);

  // Transaction methods
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      setError(null);
      const newTransaction = await database.addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update summary
      const newSummary = await database.getFinancialSummary();
      setSummary(newSummary);
      
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, transaction: Partial<Transaction>) => {
    try {
      setError(null);
      const updatedTransaction = await database.updateTransaction(id, transaction);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      
      // Update summary
      const newSummary = await database.getFinancialSummary();
      setSummary(newSummary);
      
      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      await database.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Update summary
      const newSummary = await database.getFinancialSummary();
      setSummary(newSummary);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  }, []);

  // Category methods
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      setError(null);
      const newCategory = await database.addCategory(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, category: Partial<Category>) => {
    try {
      setError(null);
      const updatedCategory = await database.updateCategory(id, category);
      setCategories(prev => 
        prev.map(c => c.id === id ? updatedCategory : c)
      );
      return updatedCategory;
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await database.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  }, []);

  // Utility methods
  const clearAllData = useCallback(async () => {
    try {
      setError(null);
      await database.clearAllData();
      setTransactions([]);
      setCategories([]);
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        pendingAmount: 0,
        thisMonthIncome: 0,
        thisMonthExpense: 0,
        // Initialize all required fields with safe defaults
        totalSales: 0,
        totalOrders: 0,
        thisMonthSales: 0,
        thisMonthOrders: 0,
        averageOrderValue: 0,
        profitMargin: 0,
        expenseRatio: 0,
        cashFlow: 0,
        financialHealthScore: 100,
        monthlyGrowthRate: 0,
        outstandingReceivables: 0,
        outstandingPayables: 0,
        workingCapital: 0,
        debtToIncomeRatio: 0,
        returnOnInvestment: 0
      });
    } catch (err) {
      console.error('Error clearing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear data');
      throw err;
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      setError(null);
      return await database.exportData();
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, []);

  const importData = useCallback(async (data: any) => {
    try {
      setError(null);
      await database.importData(data);
      await loadData(); // Reload all data after import
    } catch (err) {
      console.error('Error importing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to import data');
      throw err;
    }
  }, [loadData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    return await loadData();
  }, [loadData]);

  // Refresh orders data specifically
  const refreshOrders = useCallback(() => {
    loadOrdersData().then(setOrders);
  }, [loadOrdersData]);

  return {
    // Data
    transactions,
    categories,
    orders,
    summary,
    loading,
    error,
    
    // Transaction methods
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Category methods
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Utility methods
    clearAllData,
    exportData,
    importData,
    refreshData,
    refreshOrders
  };
}; 
import { useState, useEffect, useCallback } from 'react';
import { database, Transaction, Category, FinancialSummary } from '@/lib/database';
import { initializeDatabase } from '@/services/databaseInitService';

export const useDatabase = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    pendingAmount: 0,
    thisMonthIncome: 0,
    thisMonthExpense: 0
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
      
      const [transactionsData, categoriesData, summaryData] = await Promise.all([
        database.getTransactions(),
        database.getCategories(),
        database.getFinancialSummary()
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
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
        thisMonthExpense: 0
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
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    transactions,
    categories,
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
    refreshData
  };
}; 
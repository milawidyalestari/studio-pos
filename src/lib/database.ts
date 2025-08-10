import { createClient } from '@supabase/supabase-js';

// Environment variables - check both import.meta.env (Vite) and process.env (Create React App)
const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - use import.meta.env for Vite or window for injected vars
    return (import.meta as any)?.env?.[key] || (window as any)?.[key] || '';
  }
  // Node environment fallback
  return process?.env?.[key] || '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('REACT_APP_SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('REACT_APP_SUPABASE_ANON_KEY') || '';

// Database types
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  payment_method: string; // Changed from paymentMethod to match database
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string; // Added notes field
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingAmount: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  // New fields for orders data
  totalSales: number;
  totalOrders: number;
  thisMonthSales: number;
  thisMonthOrders: number;
  averageOrderValue: number;
  // Enhanced financial metrics
  profitMargin: number;
  expenseRatio: number;
  cashFlow: number;
  financialHealthScore: number;
  monthlyGrowthRate: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  workingCapital: number;
  debtToIncomeRatio: number;
  returnOnInvestment: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at?: string;
}

// Database interface
export interface DatabaseService {
  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  addCategory(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Summary methods
  getFinancialSummary(): Promise<FinancialSummary>;
  
  // Utility methods
  clearAllData(): Promise<void>;
  exportData(): Promise<any>;
  importData(data: any): Promise<void>;
}

// Local Storage Database Service
export class LocalDatabaseService implements DatabaseService {
  private readonly TRANSACTIONS_KEY = 'finance_transactions';
  private readonly CATEGORIES_KEY = 'finance_categories';

  private getTransactionsFromStorage(): Transaction[] {
    try {
      const data = localStorage.getItem(this.TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading transactions from localStorage:', error);
      return [];
    }
  }

  private saveTransactionsToStorage(transactions: Transaction[]): void {
    try {
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }

  private getCategoriesFromStorage(): Category[] {
    try {
      const data = localStorage.getItem(this.CATEGORIES_KEY);
      return data ? JSON.parse(data) : this.getDefaultCategories();
    } catch (error) {
      console.error('Error reading categories from localStorage:', error);
      return this.getDefaultCategories();
    }
  }

  private saveCategoriesToStorage(categories: Category[]): void {
    try {
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }

  private getDefaultCategories(): Category[] {
    return [
      { id: '1', name: 'Penjualan', type: 'income', color: '#10b981' },
      { id: '2', name: 'Jasa', type: 'income', color: '#10b981' },
      { id: '3', name: 'Bahan Baku', type: 'expense', color: '#ef4444' },
      { id: '4', name: 'Operasional', type: 'expense', color: '#ef4444' }
    ];
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.getTransactionsFromStorage();
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const transactions = this.getTransactionsFromStorage();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    this.saveTransactionsToStorage(transactions);
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const transactions = this.getTransactionsFromStorage();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    transactions[index] = {
      ...transactions[index],
      ...transaction,
      updated_at: new Date().toISOString()
    };
    
    this.saveTransactionsToStorage(transactions);
    return transactions[index];
  }

  async deleteTransaction(id: string): Promise<void> {
    const transactions = this.getTransactionsFromStorage();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    this.saveTransactionsToStorage(filteredTransactions);
  }

  async getCategories(): Promise<Category[]> {
    return this.getCategoriesFromStorage();
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const categories = this.getCategoriesFromStorage();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    categories.push(newCategory);
    this.saveCategoriesToStorage(categories);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const categories = this.getCategoriesFromStorage();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    categories[index] = {
      ...categories[index],
      ...category,
      updated_at: new Date().toISOString()
    };
    
    this.saveCategoriesToStorage(categories);
    return categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = this.getCategoriesFromStorage();
    const filteredCategories = categories.filter(c => c.id !== id);
    this.saveCategoriesToStorage(filteredCategories);
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const transactions = this.getTransactionsFromStorage();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const thisMonthExpense = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate enhanced financial metrics
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const cashFlow = totalIncome - totalExpense;
    
    // Calculate outstanding receivables and payables
    const outstandingReceivables = transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const outstandingPayables = transactions
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate working capital
    const workingCapital = totalIncome - totalExpense - outstandingPayables + outstandingReceivables;
    
    // Calculate debt to income ratio (simplified)
    const debtToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
    
    // Calculate monthly growth rate (simplified)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === previousMonth &&
               transactionDate.getFullYear() === previousYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyGrowthRate = previousMonthIncome > 0 
      ? ((thisMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 
      : 0;
    
    // Calculate return on investment (simplified)
    const returnOnInvestment = totalExpense > 0 ? (netProfit / totalExpense) * 100 : 0;
    
    // Calculate financial health score (0-100)
    let financialHealthScore = 100;
    
    // Deduct points for various risk factors
    if (profitMargin < 10) financialHealthScore -= 20;
    if (expenseRatio > 80) financialHealthScore -= 15;
    if (debtToIncomeRatio > 0.5) financialHealthScore -= 15;
    if (workingCapital < 0) financialHealthScore -= 20;
    if (monthlyGrowthRate < 0) financialHealthScore -= 10;
    if (outstandingReceivables > totalIncome * 0.3) financialHealthScore -= 10;
    
    // Ensure score doesn't go below 0
    financialHealthScore = Math.max(0, financialHealthScore);

    return {
      totalIncome,
      totalExpense,
      netProfit,
      pendingAmount,
      thisMonthIncome,
      thisMonthExpense,
      // Default values for orders data (will be populated by Supabase)
      totalSales: 0,
      totalOrders: 0,
      thisMonthSales: 0,
      thisMonthOrders: 0,
      averageOrderValue: 0,
      // Enhanced financial metrics
      profitMargin,
      expenseRatio,
      cashFlow,
      financialHealthScore,
      monthlyGrowthRate,
      outstandingReceivables,
      outstandingPayables,
      workingCapital,
      debtToIncomeRatio,
      returnOnInvestment
    };
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.TRANSACTIONS_KEY);
    localStorage.removeItem(this.CATEGORIES_KEY);
  }

  async exportData(): Promise<any> {
    return {
      transactions: this.getTransactionsFromStorage(),
      categories: this.getCategoriesFromStorage(),
      exported_at: new Date().toISOString()
    };
  }

  async importData(data: any): Promise<void> {
    if (data.transactions) {
      this.saveTransactionsToStorage(data.transactions);
    }
    if (data.categories) {
      this.saveCategoriesToStorage(data.categories);
    }
  }
}

// Supabase Database Service
export class SupabaseDatabaseService implements DatabaseService {
  private supabase;

  constructor(url?: string, key?: string) {
    const supabaseUrl = url || SUPABASE_URL;
    const supabaseKey = key || SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data || [];
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    return data;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .update({ ...transaction, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return data;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    return data;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const { data: transactions, error } = await this.supabase
      .from('transactions')
      .select('*');

    if (error) {
      console.error('Error fetching transactions for summary:', error);
      throw error;
    }

    const totalIncome = transactions
      ?.filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const totalExpense = transactions
      ?.filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const pendingAmount = transactions
      ?.filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthIncome = transactions
      ?.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const thisMonthExpense = transactions
      ?.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    // Get orders data for sales analysis
    const { data: orders, error: ordersError } = await this.supabase
      .from('orders')
      .select('total_amount, created_at');

    if (ordersError) {
      console.error('Error fetching orders for summary:', ordersError);
      // Continue with default values if orders fetch fails
    }

    const ordersData = orders || [];
    const totalSales = ordersData.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalOrders = ordersData.length;
    
    const thisMonthSales = ordersData
      .filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    
    const thisMonthOrders = ordersData
      .filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      }).length;

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate enhanced financial metrics
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const cashFlow = totalIncome - totalExpense;
    
    // Calculate outstanding receivables and payables
    const outstandingReceivables = transactions
      ?.filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const outstandingPayables = transactions
      ?.filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    // Calculate working capital
    const workingCapital = totalIncome - totalExpense - outstandingPayables + outstandingReceivables;
    
    // Calculate debt to income ratio (simplified)
    const debtToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
    
    // Calculate monthly growth rate (simplified)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthIncome = transactions
      ?.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === previousMonth &&
               transactionDate.getFullYear() === previousYear;
      })
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const monthlyGrowthRate = previousMonthIncome > 0 
      ? ((thisMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 
      : 0;
    
    // Calculate return on investment (simplified)
    const returnOnInvestment = totalExpense > 0 ? (netProfit / totalExpense) * 100 : 0;
    
    // Calculate financial health score (0-100)
    let financialHealthScore = 100;
    
    // Deduct points for various risk factors
    if (profitMargin < 10) financialHealthScore -= 20;
    if (expenseRatio > 80) financialHealthScore -= 15;
    if (debtToIncomeRatio > 0.5) financialHealthScore -= 15;
    if (workingCapital < 0) financialHealthScore -= 20;
    if (monthlyGrowthRate < 0) financialHealthScore -= 10;
    if (outstandingReceivables > totalIncome * 0.3) financialHealthScore -= 10;
    
    // Ensure score doesn't go below 0
    financialHealthScore = Math.max(0, financialHealthScore);

    return {
      totalIncome,
      totalExpense,
      netProfit,
      pendingAmount,
      thisMonthIncome,
      thisMonthExpense,
      totalSales,
      totalOrders,
      thisMonthSales,
      thisMonthOrders,
      averageOrderValue,
      // Enhanced financial metrics
      profitMargin,
      expenseRatio,
      cashFlow,
      financialHealthScore,
      monthlyGrowthRate,
      outstandingReceivables,
      outstandingPayables,
      workingCapital,
      debtToIncomeRatio,
      returnOnInvestment
    };
  }

  async clearAllData(): Promise<void> {
    const { error: transactionsError } = await this.supabase
      .from('transactions')
      .delete()
      .neq('id', '0'); // Delete all records

    const { error: categoriesError } = await this.supabase
      .from('categories')
      .delete()
      .neq('id', '0'); // Delete all records

    if (transactionsError || categoriesError) {
      console.error('Error clearing data:', { transactionsError, categoriesError });
      throw new Error('Failed to clear all data');
    }
  }

  async exportData(): Promise<any> {
    const [transactions, categories] = await Promise.all([
      this.getTransactions(),
      this.getCategories()
    ]);

    return {
      transactions,
      categories,
      exported_at: new Date().toISOString()
    };
  }

  async importData(data: any): Promise<void> {
    if (data.transactions && data.transactions.length > 0) {
      const { error } = await this.supabase
        .from('transactions')
        .insert(data.transactions);

      if (error) {
        console.error('Error importing transactions:', error);
        throw error;
      }
    }

    if (data.categories && data.categories.length > 0) {
      const { error } = await this.supabase
        .from('categories')
        .insert(data.categories);

      if (error) {
        console.error('Error importing categories:', error);
        throw error;
      }
    }
  }
}

// Database Factory
export class DatabaseFactory {
  static createDatabase(): DatabaseService {
    // Check stored configuration first
    const storedConfig = this.getStoredConfig();
    
    // Check environment variables
    const envUseSupabase = getEnvVar('VITE_USE_SUPABASE') || getEnvVar('REACT_APP_USE_SUPABASE');
    const envSupabaseUrl = SUPABASE_URL;
    const envSupabaseKey = SUPABASE_ANON_KEY;
    
    // Determine which configuration to use
    let useSupabase = false;
    let supabaseUrl = '';
    let supabaseKey = '';
    
    if (storedConfig) {
      // Use stored configuration (from settings)
      useSupabase = storedConfig.useSupabase;
      supabaseUrl = storedConfig.url || '';
      supabaseKey = storedConfig.key || '';
      console.log('📋 Using stored database configuration');
    } else {
      // Fallback to environment variables
      useSupabase = envUseSupabase === 'true' || (envSupabaseUrl && envSupabaseKey && envUseSupabase !== 'false');
      supabaseUrl = envSupabaseUrl;
      supabaseKey = envSupabaseKey;
      console.log('🔧 Using environment database configuration');
    }
    
    if (useSupabase && supabaseUrl && supabaseKey) {
      try {
        console.log('🚀 Initializing Supabase database connection...');
        return new SupabaseDatabaseService(supabaseUrl, supabaseKey);
      } catch (error) {
        console.warn('⚠️ Failed to initialize Supabase, falling back to local storage:', error);
        return new LocalDatabaseService();
      }
    }
    
    console.log('💾 Using local storage database...');
    return new LocalDatabaseService();
  }
  
  private static getStoredConfig(): { useSupabase: boolean; url?: string; key?: string } | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('database_config');
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.warn('Failed to read stored database config:', error);
    }
    return null;
  }
}

// Global database instance
export const database = DatabaseFactory.createDatabase(); 
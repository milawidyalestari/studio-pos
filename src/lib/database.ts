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
  transaction_code: string;
  transaction_type: 'income' | 'expense' | 'transfer' | 'adjustment';
  category_id?: string;
  description: string;
  amount: number;
  currency: string;
  payment_method?: string;
  bank_reference?: string;
  transaction_date: string;
  due_date?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recurring: boolean;
  recurring_pattern?: string;
  recurring_end_date?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  created_by?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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
      if (!data) return [];
      
      const oldTransactions = JSON.parse(data);
      
      // Transform old format to new format for backward compatibility
      return oldTransactions.map((t: any) => ({
        id: t.id,
        transaction_code: t.transaction_code || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transaction_type: t.transaction_type || t.type || 'income',
        category_id: t.category_id,
        description: t.description,
        amount: t.amount,
        currency: t.currency || 'IDR',
        payment_method: t.payment_method || '',
        bank_reference: t.bank_reference,
        transaction_date: t.transaction_date || t.date,
        due_date: t.due_date,
        status: t.status || 'pending',
        priority: t.priority || 'normal',
        recurring: t.recurring || false,
        recurring_pattern: t.recurring_pattern,
        recurring_end_date: t.recurring_end_date,
        notes: t.notes,
        attachments: t.attachments,
        tags: t.tags,
        created_by: t.created_by,
        approved_by: t.approved_by,
        created_at: t.created_at,
        updated_at: t.updated_at,
        deleted_at: t.deleted_at
      }));
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
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading categories from localStorage:', error);
      return [];
    }
  }

  private saveCategoriesToStorage(categories: Category[]): void {
    try {
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.getTransactionsFromStorage();
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const transactions = this.getTransactionsFromStorage();
    
    // Generate unique transaction code if not provided
    const transactionCode = transaction.transaction_code || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      transaction_code: transactionCode,
      transaction_type: transaction.transaction_type,
      category_id: transaction.category_id,
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency || 'IDR',
      payment_method: transaction.payment_method,
      bank_reference: transaction.bank_reference,
      transaction_date: transaction.transaction_date,
      due_date: transaction.due_date,
      status: transaction.status || 'pending',
      priority: transaction.priority || 'normal',
      recurring: transaction.recurring || false,
      recurring_pattern: transaction.recurring_pattern,
      recurring_end_date: transaction.recurring_end_date,
      notes: transaction.notes,
      attachments: transaction.attachments,
      tags: transaction.tags,
      created_by: transaction.created_by,
      approved_by: transaction.approved_by,
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
      id: Date.now().toString(),
      name: category.name,
      type: category.type,
      color: category.color,
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
      .filter(t => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.transaction_type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const thisMonthExpense = transactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.transaction_type === 'expense' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate enhanced financial metrics
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const cashFlow = totalIncome - totalExpense;
    
    // Calculate outstanding receivables and payables
    const outstandingReceivables = transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const outstandingPayables = transactions
      .filter(t => t.transaction_type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Calculate working capital
    const workingCapital = totalIncome - totalExpense - outstandingPayables + outstandingReceivables;
    
    // Calculate debt to income ratio (simplified)
    const debtToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
    
    // Calculate monthly growth rate (simplified)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.transaction_type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === previousMonth &&
               transactionDate.getFullYear() === previousYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
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
      // Transform old format to new format for backward compatibility
      const transformedTransactions = data.transactions.map((t: any) => ({
        id: t.id,
        transaction_code: t.transaction_code || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transaction_type: t.transaction_type || t.type || 'income',
        category_id: t.category_id,
        description: t.description,
        amount: t.amount,
        currency: t.currency || 'IDR',
        payment_method: t.payment_method || '',
        bank_reference: t.bank_reference,
        transaction_date: t.transaction_date || t.date,
        due_date: t.due_date,
        status: t.status || 'pending',
        priority: t.priority || 'normal',
        recurring: t.recurring || false,
        recurring_pattern: t.recurring_pattern,
        recurring_end_date: t.recurring_end_date,
        notes: t.notes,
        attachments: t.attachments,
        tags: t.tags,
        created_by: t.created_by,
        approved_by: t.approved_by,
        created_at: t.created_at,
        updated_at: t.updated_at,
        deleted_at: t.deleted_at
      }));
      
      this.saveTransactionsToStorage(transformedTransactions);
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
      .from('transaction_master')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Transform data to match the expected interface
    return (data || []).map(transaction => ({
      ...transaction,
      // Map category_id to category for backward compatibility
      category: transaction.categories?.name || '',
      // Map transaction_type to type for backward compatibility
      type: transaction.transaction_type,
      // Map transaction_date to date for backward compatibility
      date: transaction.transaction_date
    }));
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    // Transform the data to match transaction_master table
    const transactionData = {
      transaction_code: transaction.transaction_code || `TXN-${Date.now()}`,
      transaction_type: transaction.transaction_type,
      category_id: transaction.category_id,
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency || 'IDR',
      payment_method: transaction.payment_method,
      bank_reference: transaction.bank_reference,
      transaction_date: transaction.transaction_date,
      due_date: transaction.due_date,
      status: transaction.status || 'pending',
      priority: transaction.priority || 'normal',
      recurring: transaction.recurring || false,
      recurring_pattern: transaction.recurring_pattern,
      recurring_end_date: transaction.recurring_end_date,
      notes: transaction.notes,
      attachments: transaction.attachments,
      tags: transaction.tags,
      created_by: transaction.created_by,
      approved_by: transaction.approved_by
    };

    const { data, error } = await this.supabase
      .from('transaction_master')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    return data;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    // Transform the data to match transaction_master table
    const updateData: any = {};
    
    if (transaction.transaction_type) updateData.transaction_type = transaction.transaction_type;
    if (transaction.category_id !== undefined) updateData.category_id = transaction.category_id;
    if (transaction.description) updateData.description = transaction.description;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.currency) updateData.currency = transaction.currency;
    if (transaction.payment_method !== undefined) updateData.payment_method = transaction.payment_method;
    if (transaction.bank_reference !== undefined) updateData.bank_reference = transaction.bank_reference;
    if (transaction.transaction_date) updateData.transaction_date = transaction.transaction_date;
    if (transaction.due_date !== undefined) updateData.due_date = transaction.due_date;
    if (transaction.status) updateData.status = transaction.status;
    if (transaction.priority) updateData.priority = transaction.priority;
    if (transaction.recurring !== undefined) updateData.recurring = transaction.recurring;
    if (transaction.recurring_pattern !== undefined) updateData.recurring_pattern = transaction.recurring_pattern;
    if (transaction.recurring_end_date !== undefined) updateData.recurring_end_date = transaction.recurring_end_date;
    if (transaction.notes !== undefined) updateData.notes = transaction.notes;
    if (transaction.attachments !== undefined) updateData.attachments = transaction.attachments;
    if (transaction.tags !== undefined) updateData.tags = transaction.tags;
    if (transaction.approved_by !== undefined) updateData.approved_by = transaction.approved_by;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('transaction_master')
      .update(updateData)
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
    // Soft delete by setting deleted_at
    const { error } = await this.supabase
      .from('transaction_master')
      .update({ deleted_at: new Date().toISOString() })
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
      .from('transaction_master')
      .select('*')
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching transactions for summary:', error);
      throw error;
    }

    const totalIncome = transactions
      ?.filter(t => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const totalExpense = transactions
      ?.filter(t => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const pendingAmount = transactions
      ?.filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthIncome = transactions
      ?.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.transaction_type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const thisMonthExpense = transactions
      ?.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.transaction_type === 'expense' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

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
      ?.filter(t => t.transaction_type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const outstandingPayables = transactions
      ?.filter(t => t.transaction_type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    // Calculate working capital
    const workingCapital = totalIncome - totalExpense - outstandingPayables + outstandingReceivables;
    
    // Calculate debt to income ratio (simplified)
    const debtToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
    
    // Calculate monthly growth rate (simplified)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthIncome = transactions
      ?.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.transaction_type === 'income' && 
               t.status === 'completed' &&
               transactionDate.getMonth() === previousMonth &&
               transactionDate.getFullYear() === previousYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
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
    // Soft delete all transactions
    const { error: transactionsError } = await this.supabase
      .from('transaction_master')
      .update({ deleted_at: new Date().toISOString() })
      .is('deleted_at', null);

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
      // Transform transactions to match transaction_master table
      const transformedTransactions = data.transactions.map((t: any) => ({
        transaction_code: t.transaction_code || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transaction_type: t.transaction_type || t.type || 'income',
        category_id: t.category_id,
        description: t.description,
        amount: t.amount,
        currency: t.currency || 'IDR',
        payment_method: t.payment_method,
        bank_reference: t.bank_reference,
        transaction_date: t.transaction_date || t.date,
        due_date: t.due_date,
        status: t.status || 'pending',
        priority: t.priority || 'normal',
        recurring: t.recurring || false,
        recurring_pattern: t.recurring_pattern,
        recurring_end_date: t.recurring_end_date,
        notes: t.notes,
        attachments: t.attachments,
        tags: t.tags,
        created_by: t.created_by,
        approved_by: t.approved_by
      }));

      const { error } = await this.supabase
        .from('transaction_master')
        .insert(transformedTransactions);

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
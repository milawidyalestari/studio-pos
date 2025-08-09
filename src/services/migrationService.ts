import { createClient } from '@supabase/supabase-js';

// Types for migration
export interface MigrationData {
  customers: any[];
  products: any[];
  orders: any[];
  suppliers: any[];
  employees: any[];
  transactions: any[];
  categories: any[];
}

export interface MigrationProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  data?: MigrationData;
  error?: string;
  summary?: {
    customers: number;
    products: number;
    orders: number;
    suppliers: number;
    employees: number;
    transactions: number;
    categories: number;
  };
}

class MigrationService {
  private supabase: any;
  private progressCallback?: (progress: MigrationProgress) => void;

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables not found. Migration from Supabase will not be available.');
      return;
    }
    
    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (error) {
      console.error('Invalid Supabase URL format:', supabaseUrl);
      return;
    }
    
    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }

  setProgressCallback(callback: (progress: MigrationProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: Partial<MigrationProgress>) {
    if (this.progressCallback) {
      this.progressCallback(progress as MigrationProgress);
    }
  }

  // Export data from Supabase
  async exportFromSupabase(): Promise<MigrationResult> {
    try {
      this.updateProgress({
        step: 'Connecting to Supabase...',
        current: 0,
        total: 7,
        percentage: 0,
        status: 'running'
      });

      if (!this.supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)');
      }

      const migrationData: MigrationData = {
        customers: [],
        products: [],
        orders: [],
        suppliers: [],
        employees: [],
        transactions: [],
        categories: []
      };

      // Export customers
      this.updateProgress({
        step: 'Exporting customers...',
        current: 1,
        total: 7,
        percentage: 14,
        status: 'running'
      });
      const { data: customers, error: customersError } = await this.supabase
        .from('customers')
        .select('*');
      if (customersError) throw customersError;
      migrationData.customers = customers || [];

      // Export products
      this.updateProgress({
        step: 'Exporting products...',
        current: 2,
        total: 7,
        percentage: 28,
        status: 'running'
      });
      const { data: products, error: productsError } = await this.supabase
        .from('products')
        .select('*');
      if (productsError) throw productsError;
      migrationData.products = products || [];

      // Export orders
      this.updateProgress({
        step: 'Exporting orders...',
        current: 3,
        total: 7,
        percentage: 42,
        status: 'running'
      });
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select('*');
      if (ordersError) throw ordersError;
      migrationData.orders = orders || [];

      // Export suppliers
      this.updateProgress({
        step: 'Exporting suppliers...',
        current: 4,
        total: 7,
        percentage: 56,
        status: 'running'
      });
      const { data: suppliers, error: suppliersError } = await this.supabase
        .from('suppliers')
        .select('*');
      if (suppliersError) throw suppliersError;
      migrationData.suppliers = suppliers || [];

      // Export employees
      this.updateProgress({
        step: 'Exporting employees...',
        current: 5,
        total: 7,
        percentage: 70,
        status: 'running'
      });
      const { data: employees, error: employeesError } = await this.supabase
        .from('employees')
        .select('*');
      if (employeesError) throw employeesError;
      migrationData.employees = employees || [];

      // Export transactions
      this.updateProgress({
        step: 'Exporting transactions...',
        current: 6,
        total: 7,
        percentage: 84,
        status: 'running'
      });
      const { data: transactions, error: transactionsError } = await this.supabase
        .from('transactions')
        .select('*');
      if (transactionsError) throw transactionsError;
      migrationData.transactions = transactions || [];

      // Export categories
      this.updateProgress({
        step: 'Exporting categories...',
        current: 7,
        total: 7,
        percentage: 100,
        status: 'running'
      });
      const { data: categories, error: categoriesError } = await this.supabase
        .from('categories')
        .select('*');
      if (categoriesError) throw categoriesError;
      migrationData.categories = categories || [];

      // Calculate summary
      const summary = {
        customers: migrationData.customers.length,
        products: migrationData.products.length,
        orders: migrationData.orders.length,
        suppliers: migrationData.suppliers.length,
        employees: migrationData.employees.length,
        transactions: migrationData.transactions.length,
        categories: migrationData.categories.length
      };

      this.updateProgress({
        step: 'Export completed successfully!',
        current: 7,
        total: 7,
        percentage: 100,
        status: 'completed'
      });

      return {
        success: true,
        message: 'Data exported successfully from Supabase',
        data: migrationData,
        summary
      };

    } catch (error) {
      this.updateProgress({
        step: 'Export failed',
        current: 0,
        total: 7,
        percentage: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to export data from Supabase',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Import data to local database
  async importToLocal(data: MigrationData): Promise<MigrationResult> {
    try {
      this.updateProgress({
        step: 'Starting import to local database...',
        current: 0,
        total: 7,
        percentage: 0,
        status: 'running'
      });

      if (!(window as any).electronAPI?.database) {
        throw new Error('Electron database API not available');
      }

      const summary = {
        customers: 0,
        products: 0,
        orders: 0,
        suppliers: 0,
        employees: 0,
        transactions: 0,
        categories: 0
      };

      // Import customers
      this.updateProgress({
        step: 'Importing customers...',
        current: 1,
        total: 7,
        percentage: 14,
        status: 'running'
      });
      for (const customer of data.customers) {
        await (window as any).electronAPI.database.create('customers', customer);
        summary.customers++;
      }

      // Import products
      this.updateProgress({
        step: 'Importing products...',
        current: 2,
        total: 7,
        percentage: 28,
        status: 'running'
      });
      for (const product of data.products) {
        await (window as any).electronAPI.database.create('products', product);
        summary.products++;
      }

      // Import orders
      this.updateProgress({
        step: 'Importing orders...',
        current: 3,
        total: 7,
        percentage: 42,
        status: 'running'
      });
      for (const order of data.orders) {
        await (window as any).electronAPI.database.create('orders', order);
        summary.orders++;
      }

      // Import suppliers
      this.updateProgress({
        step: 'Importing suppliers...',
        current: 4,
        total: 7,
        percentage: 56,
        status: 'running'
      });
      for (const supplier of data.suppliers) {
        await (window as any).electronAPI.database.create('suppliers', supplier);
        summary.suppliers++;
      }

      // Import employees
      this.updateProgress({
        step: 'Importing employees...',
        current: 5,
        total: 7,
        percentage: 70,
        status: 'running'
      });
      for (const employee of data.employees) {
        await (window as any).electronAPI.database.create('employees', employee);
        summary.employees++;
      }

      // Import transactions
      this.updateProgress({
        step: 'Importing transactions...',
        current: 6,
        total: 7,
        percentage: 84,
        status: 'running'
      });
      for (const transaction of data.transactions) {
        await (window as any).electronAPI.database.create('transactions', transaction);
        summary.transactions++;
      }

      // Import categories
      this.updateProgress({
        step: 'Importing categories...',
        current: 7,
        total: 7,
        percentage: 100,
        status: 'running'
      });
      for (const category of data.categories) {
        await (window as any).electronAPI.database.create('categories', category);
        summary.categories++;
      }

      this.updateProgress({
        step: 'Import completed successfully!',
        current: 7,
        total: 7,
        percentage: 100,
        status: 'completed'
      });

      return {
        success: true,
        message: 'Data imported successfully to local database',
        summary
      };

    } catch (error) {
      this.updateProgress({
        step: 'Import failed',
        current: 0,
        total: 7,
        percentage: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to import data to local database',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Validate data before migration
  async validateData(data: MigrationData): Promise<MigrationResult> {
    try {
      const validationErrors: string[] = [];

      // Validate customers
      for (const customer of data.customers) {
        if (!customer.id || !customer.kode || !customer.nama) {
          validationErrors.push(`Invalid customer data: ${customer.id}`);
        }
      }

      // Validate products
      for (const product of data.products) {
        if (!product.id || !product.kode || !product.nama) {
          validationErrors.push(`Invalid product data: ${product.id}`);
        }
      }

      // Validate orders
      for (const order of data.orders) {
        if (!order.id || !order.order_number || !order.customer_name) {
          validationErrors.push(`Invalid order data: ${order.id}`);
        }
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Data validation failed',
          error: validationErrors.join(', ')
        };
      }

      return {
        success: true,
        message: 'Data validation passed',
        summary: {
          customers: data.customers.length,
          products: data.products.length,
          orders: data.orders.length,
          suppliers: data.suppliers.length,
          employees: data.employees.length,
          transactions: data.transactions.length,
          categories: data.categories.length
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Data validation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Complete migration process
  async performMigration(): Promise<MigrationResult> {
    try {
      // Step 1: Export from Supabase
      const exportResult = await this.exportFromSupabase();
      if (!exportResult.success) {
        return exportResult;
      }

      // Step 2: Validate data
      const validationResult = await this.validateData(exportResult.data!);
      if (!validationResult.success) {
        return validationResult;
      }

      // Step 3: Import to local database
      const importResult = await this.importToLocal(exportResult.data!);
      return importResult;

    } catch (error) {
      return {
        success: false,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const migrationService = new MigrationService();

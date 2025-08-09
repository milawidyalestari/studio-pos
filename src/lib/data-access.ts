import { databaseManager, type QueryOptions, type TransactionOperation } from './database-manager';

// Base entity types
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Order types
export interface Order extends BaseEntity {
  order_number: string;
  customer_name: string;
  tanggal: string;
  waktu?: string;
  estimasi?: string;
  estimasi_waktu?: string;
  outdoor: boolean;
  laser_printing: boolean;
  mug_nota: boolean;
  jasa_desain: number;
  biaya_lain: number;
  sub_total: number;
  discount: number;
  ppn: number;
  total_amount: number;
  payment_type?: string;
  bank?: string;
  admin_id?: string;
  desainer_id?: string;
  komputer?: string;
  notes?: string;
  status_id?: number;
}

export interface CreateOrderData {
  order_number: string;
  customer_name: string;
  tanggal: string;
  waktu?: string;
  estimasi?: string;
  estimasi_waktu?: string;
  outdoor: boolean;
  laser_printing: boolean;
  mug_nota: boolean;
  jasa_desain: number;
  biaya_lain: number;
  sub_total: number;
  discount: number;
  ppn: number;
  total_amount: number;
  payment_type?: string;
  bank?: string;
  admin_id?: string;
  desainer_id?: string;
  komputer?: string;
  notes?: string;
  status_id?: number;
}

// Product types
export interface Product extends BaseEntity {
  kode: string;
  jenis: string;
  nama: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok_awal: number;
  stok_masuk: number;
  stok_keluar: number;
  stok_opname: number;
}

export interface CreateProductData {
  kode: string;
  jenis: string;
  nama: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok_awal: number;
  stok_masuk: number;
  stok_keluar: number;
  stok_opname: number;
}

// Customer types
export interface Customer extends BaseEntity {
  kode: string;
  nama: string;
  whatsapp: string;
  level: 'Premium' | 'Regular' | 'VIP';
}

export interface CreateCustomerData {
  kode: string;
  nama: string;
  whatsapp: string;
  level: 'Premium' | 'Regular' | 'VIP';
}

// Supplier types
export interface Supplier extends BaseEntity {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  payment_terms: string;
  outstanding_balance: number;
  address: string;
}

export interface CreateSupplierData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  payment_terms: string;
  outstanding_balance: number;
  address: string;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
  color: string;
}

// Employee types
export interface Employee extends BaseEntity {
  kode: string;
  nama: string;
  posisi: string;
  status: 'Active' | 'Inactive';
}

export interface CreateEmployeeData {
  kode: string;
  nama: string;
  posisi: string;
  status: 'Active' | 'Inactive';
}

// Transaction types
export interface Transaction extends BaseEntity {
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface CreateTransactionData {
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'cancelled';
}

// Unified Data Access Interface
export interface DataAccessLayer {
  // Orders
  getOrders(options?: QueryOptions): Promise<Order[]>;
  createOrder(order: CreateOrderData): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  deleteOrder(id: string): Promise<void>;

  // Products
  getProducts(options?: QueryOptions): Promise<Product[]>;
  createProduct(product: CreateProductData): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Customers
  getCustomers(options?: QueryOptions): Promise<Customer[]>;
  createCustomer(customer: CreateCustomerData): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Suppliers
  getSuppliers(options?: QueryOptions): Promise<Supplier[]>;
  createSupplier(supplier: CreateSupplierData): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;

  // Categories
  getCategories(options?: QueryOptions): Promise<Category[]>;
  createCategory(category: CreateCategoryData): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Employees
  getEmployees(options?: QueryOptions): Promise<Employee[]>;
  createEmployee(employee: CreateEmployeeData): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Transactions
  getTransactions(options?: QueryOptions): Promise<Transaction[]>;
  createTransaction(transaction: CreateTransactionData): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Utility methods
  transaction<T>(operations: TransactionOperation[]): Promise<T[]>;
  isConnected(): Promise<boolean>;
  getInfo(): Promise<any>;
}

// Unified Data Access Implementation
export class UnifiedDataAccess implements DataAccessLayer {
  // Orders
  async getOrders(options?: QueryOptions): Promise<Order[]> {
    return await databaseManager.query<Order>('orders', options);
  }

  async createOrder(order: CreateOrderData): Promise<Order> {
    return await databaseManager.create<Order>('orders', order);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return await databaseManager.update<Order>('orders', id, updates);
  }

  async deleteOrder(id: string): Promise<void> {
    return await databaseManager.delete('orders', id);
  }

  // Products
  async getProducts(options?: QueryOptions): Promise<Product[]> {
    return await databaseManager.query<Product>('products', options);
  }

  async createProduct(product: CreateProductData): Promise<Product> {
    return await databaseManager.create<Product>('products', product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return await databaseManager.update<Product>('products', id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    return await databaseManager.delete('products', id);
  }

  // Customers
  async getCustomers(options?: QueryOptions): Promise<Customer[]> {
    return await databaseManager.query<Customer>('customers', options);
  }

  async createCustomer(customer: CreateCustomerData): Promise<Customer> {
    return await databaseManager.create<Customer>('customers', customer);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return await databaseManager.update<Customer>('customers', id, updates);
  }

  async deleteCustomer(id: string): Promise<void> {
    return await databaseManager.delete('customers', id);
  }

  // Suppliers
  async getSuppliers(options?: QueryOptions): Promise<Supplier[]> {
    return await databaseManager.query<Supplier>('suppliers', options);
  }

  async createSupplier(supplier: CreateSupplierData): Promise<Supplier> {
    return await databaseManager.create<Supplier>('suppliers', supplier);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    return await databaseManager.update<Supplier>('suppliers', id, updates);
  }

  async deleteSupplier(id: string): Promise<void> {
    return await databaseManager.delete('suppliers', id);
  }

  // Categories
  async getCategories(options?: QueryOptions): Promise<Category[]> {
    return await databaseManager.query<Category>('categories', options);
  }

  async createCategory(category: CreateCategoryData): Promise<Category> {
    return await databaseManager.create<Category>('categories', category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return await databaseManager.update<Category>('categories', id, updates);
  }

  async deleteCategory(id: string): Promise<void> {
    return await databaseManager.delete('categories', id);
  }

  // Employees
  async getEmployees(options?: QueryOptions): Promise<Employee[]> {
    return await databaseManager.query<Employee>('employees', options);
  }

  async createEmployee(employee: CreateEmployeeData): Promise<Employee> {
    return await databaseManager.create<Employee>('employees', employee);
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    return await databaseManager.update<Employee>('employees', id, updates);
  }

  async deleteEmployee(id: string): Promise<void> {
    return await databaseManager.delete('employees', id);
  }

  // Transactions
  async getTransactions(options?: QueryOptions): Promise<Transaction[]> {
    return await databaseManager.query<Transaction>('transactions', options);
  }

  async createTransaction(transaction: CreateTransactionData): Promise<Transaction> {
    return await databaseManager.create<Transaction>('transactions', transaction);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return await databaseManager.update<Transaction>('transactions', id, updates);
  }

  async deleteTransaction(id: string): Promise<void> {
    return await databaseManager.delete('transactions', id);
  }

  // Utility methods
  async transaction<T>(operations: TransactionOperation[]): Promise<T[]> {
    return await databaseManager.transaction<T>(operations);
  }

  async isConnected(): Promise<boolean> {
    return await databaseManager.isConnected();
  }

  async getInfo(): Promise<any> {
    return await databaseManager.getInfo();
  }
}

// Global data access instance
export const dataAccess = new UnifiedDataAccess();

// Export types for use in other files
export type {
  Order,
  CreateOrderData,
  Product,
  CreateProductData,
  Customer,
  CreateCustomerData,
  Supplier,
  CreateSupplierData,
  Category,
  CreateCategoryData,
  Employee,
  CreateEmployeeData,
  Transaction,
  CreateTransactionData
};

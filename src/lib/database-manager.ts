import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Environment detection
const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    return (import.meta as any)?.env?.[key] || (window as any)?.[key] || '';
  }
  return process?.env?.[key] || '';
};

// Database configuration types
export interface DatabaseConfig {
  mode: 'development' | 'production';
  type: 'supabase' | 'postgresql' | 'local';
  connection?: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    url?: string; // untuk Supabase
    key?: string; // untuk Supabase
  };
}

export interface DatabaseAdapter {
  query<T>(table: string, options?: QueryOptions): Promise<T[]>;
  create<T>(table: string, data: Omit<T, 'id'>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  transaction<T>(operations: TransactionOperation[]): Promise<T[]>;
  isConnected(): Promise<boolean>;
  getInfo(): Promise<DatabaseInfo>;
}

export interface QueryOptions {
  select?: string;
  where?: Record<string, any>;
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export interface TransactionOperation {
  type: 'create' | 'update' | 'delete';
  table: string;
  data?: any;
  id?: string;
}

export interface DatabaseInfo {
  type: 'supabase' | 'postgresql' | 'local';
  isConnected: boolean;
  mode: 'development' | 'production';
  version?: string;
  tables?: string[];
}

// Supabase Adapter
class SupabaseAdapter implements DatabaseAdapter {
  private supabase: any;

  constructor(url: string, key: string) {
    this.supabase = createClient<Database>(url, key);
  }

  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    let query = this.supabase.from(table).select(options?.select || '*');

    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.direction === 'asc' });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 1000) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async transaction<T>(operations: TransactionOperation[]): Promise<T[]> {
    const results: T[] = [];
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'create':
          results.push(await this.create(operation.table, operation.data));
          break;
        case 'update':
          results.push(await this.update(operation.table, operation.id!, operation.data));
          break;
        case 'delete':
          await this.delete(operation.table, operation.id!);
          break;
      }
    }

    return results;
  }

  async isConnected(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.from('transactions').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<DatabaseInfo> {
    const isConnected = await this.isConnected();
    return {
      type: 'supabase',
      isConnected,
      mode: 'development',
      version: '2.x'
    };
  }
}

// Local Storage Adapter
class LocalStorageAdapter implements DatabaseAdapter {
  private prefix = 'studio_pos_';

  private getKey(table: string, id?: string): string {
    return id ? `${this.prefix}${table}_${id}` : `${this.prefix}${table}`;
  }

  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    const key = this.getKey(table);
    const data = localStorage.getItem(key);
    if (!data) return [];

    let items: T[] = JSON.parse(data);

    // Apply filters
    if (options?.where) {
      items = items.filter(item => {
        return Object.entries(options.where!).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }

    // Apply sorting
    if (options?.orderBy) {
      items.sort((a, b) => {
        const aVal = (a as any)[options.orderBy!.column];
        const bVal = (b as any)[options.orderBy!.column];
        
        if (options.orderBy!.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Apply pagination
    if (options?.offset || options?.limit) {
      const offset = options.offset || 0;
      const limit = options.limit || items.length;
      items = items.slice(offset, offset + limit);
    }

    return items;
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    const items = await this.query<T>(table);
    const newItem = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as T;

    items.unshift(newItem);
    localStorage.setItem(this.getKey(table), JSON.stringify(items));
    return newItem;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const items = await this.query<T>(table);
    const index = items.findIndex(item => (item as any).id === id);
    
    if (index === -1) throw new Error(`Item with id ${id} not found`);

    const updatedItem = {
      ...items[index],
      ...data,
      updated_at: new Date().toISOString()
    } as T;

    items[index] = updatedItem;
    localStorage.setItem(this.getKey(table), JSON.stringify(items));
    return updatedItem;
  }

  async delete(table: string, id: string): Promise<void> {
    const items = await this.query<T>(table);
    const filteredItems = items.filter(item => (item as any).id !== id);
    localStorage.setItem(this.getKey(table), JSON.stringify(filteredItems));
  }

  async transaction<T>(operations: TransactionOperation[]): Promise<T[]> {
    const results: T[] = [];
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'create':
          results.push(await this.create(operation.table, operation.data));
          break;
        case 'update':
          results.push(await this.update(operation.table, operation.id!, operation.data));
          break;
        case 'delete':
          await this.delete(operation.table, operation.id!);
          break;
      }
    }

    return results;
  }

  async isConnected(): Promise<boolean> {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<DatabaseInfo> {
    const isConnected = await this.isConnected();
    return {
      type: 'local',
      isConnected,
      mode: 'development',
      tables: ['orders', 'products', 'customers', 'suppliers', 'categories']
    };
  }
}

// PostgreSQL Adapter (for Electron)
class PostgreSQLAdapter implements DatabaseAdapter {
  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    if (!(window as any).electronAPI?.database) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await (window as any).electronAPI.database.query(table, options);
      return result || [];
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    if (!(window as any).electronAPI?.database) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await (window as any).electronAPI.database.create(table, data);
      return result;
    } catch (error) {
      console.error('PostgreSQL create error:', error);
      throw error;
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    if (!(window as any).electronAPI?.database) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await (window as any).electronAPI.database.update(table, id, data);
      return result;
    } catch (error) {
      console.error('PostgreSQL update error:', error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    if (!(window as any).electronAPI?.database) {
      throw new Error('Electron API not available');
    }

    try {
      await (window as any).electronAPI.database.delete(table, id);
    } catch (error) {
      console.error('PostgreSQL delete error:', error);
      throw error;
    }
  }

  async transaction<T>(operations: TransactionOperation[]): Promise<T[]> {
    if (!(window as any).electronAPI?.database) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await (window as any).electronAPI.database.transaction(operations);
      return result;
    } catch (error) {
      console.error('PostgreSQL transaction error:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const info = await this.getInfo();
      return info.isConnected;
    } catch (error) {
      return false;
    }
  }

  async getInfo(): Promise<DatabaseInfo> {
    if (!(window as any).electronAPI?.database) {
      return { type: 'postgresql', isConnected: false, mode: 'production' };
    }

    try {
      const info = await (window as any).electronAPI.database.getInfo();
      return {
        type: 'postgresql',
        isConnected: info.connected,
        mode: 'production',
        version: info.currentTime
      };
    } catch (error) {
      return { type: 'postgresql', isConnected: false, mode: 'production' };
    }
  }
}

// Main Database Manager
export class DatabaseManager {
  private static instance: DatabaseManager;
  private config: DatabaseConfig | null = null;
  private adapter: DatabaseAdapter | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    
    switch (config.mode) {
      case 'development':
        await this.initializeDevelopment(config);
        break;
      case 'production':
        await this.initializeProduction(config);
        break;
    }
  }

  private async initializeDevelopment(config: DatabaseConfig): Promise<void> {
    // Development: Prioritaskan Local Storage untuk Electron, Supabase untuk web
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.app?.isDev !== undefined;
    
    if (isElectron) {
      // Electron: Gunakan Local Storage
      this.adapter = new LocalStorageAdapter();
      console.log('💾 Development (Electron): Using Local Storage');
      return;
    }
    
    // Web: Coba Supabase dulu, fallback ke Local Storage
    if (config.type === 'supabase' && config.connection?.url && config.connection?.key) {
      try {
        this.adapter = new SupabaseAdapter(config.connection.url, config.connection.key);
        const isConnected = await this.adapter.isConnected();
        
        if (isConnected) {
          console.log('🚀 Development (Web): Connected to Supabase');
          return;
        }
      } catch (error) {
        console.warn('⚠️ Supabase connection failed:', error);
      }
    }

    // Fallback ke Local Storage
    this.adapter = new LocalStorageAdapter();
    console.log('💾 Development: Using Local Storage');
  }

  private async initializeProduction(config: DatabaseConfig): Promise<void> {
    // Production: PostgreSQL via Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database) {
      try {
        this.adapter = new PostgreSQLAdapter();
        const isConnected = await this.adapter.isConnected();
        
        if (isConnected) {
          console.log('🏭 Production: Connected to PostgreSQL via Electron');
          return;
        }
      } catch (error) {
        console.warn('⚠️ PostgreSQL connection failed:', error);
      }
    }

    // Fallback ke Local Storage jika Electron API belum siap
    console.log('💾 Production: Falling back to Local Storage (Electron API not ready)');
    this.adapter = new LocalStorageAdapter();
  }

  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    if (!this.adapter) {
      throw new Error('Database not initialized');
    }
    return await this.adapter.query<T>(table, options);
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    if (!this.adapter) {
      throw new Error('Database not initialized');
    }
    return await this.adapter.create<T>(table, data);
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    if (!this.adapter) {
      throw new Error('Database not initialized');
    }
    return await this.adapter.update<T>(table, id, data);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.adapter) {
      throw new Error('Database not initialized');
    }
    return await this.adapter.delete(table, id);
  }

  async transaction<T>(operations: TransactionOperation[]): Promise<T[]> {
    if (!this.adapter) {
      throw new Error('Database not initialized');
    }
    return await this.adapter.transaction<T>(operations);
  }

  async isConnected(): Promise<boolean> {
    if (!this.adapter) return false;
    return await this.adapter.isConnected();
  }

  async getInfo(): Promise<DatabaseInfo> {
    if (!this.adapter) {
      return {
        type: 'local',
        isConnected: false,
        mode: 'development'
      };
    }
    return await this.adapter.getInfo();
  }

  getConfig(): DatabaseConfig | null {
    return this.config;
  }

  getAdapter(): DatabaseAdapter | null {
    return this.adapter;
  }
}

// Global database instance
export const databaseManager = DatabaseManager.getInstance();

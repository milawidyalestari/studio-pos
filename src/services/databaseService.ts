/**
 * Database Service - Universal Database Abstraction Layer
 * 
 * This service provides a unified interface for all database operations
 * regardless of the underlying database (PostgreSQL, SQLite, Supabase, or LocalStorage)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Database configuration interface
export interface DatabaseConfig {
  mode: 'development' | 'production';
  type: 'supabase' | 'postgresql' | 'sqlite' | 'local';
  connection?: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    url?: string; // for Supabase
    key?: string; // for Supabase
  };
}

// Query options interface
export interface QueryOptions {
  select?: string;
  where?: Record<string, any>;
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

// Database adapter interface
export interface DatabaseAdapter {
  query<T>(table: string, options?: QueryOptions): Promise<T[]>;
  create<T>(table: string, data: Omit<T, 'id'>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  isConnected(): Promise<boolean>;
  getInfo(): Promise<{ type: string; isConnected: boolean; mode: string }>;
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

  async isConnected(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('categories').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<{ type: string; isConnected: boolean; mode: string }> {
    const isConnected = await this.isConnected();
    return {
      type: 'supabase',
      isConnected,
      mode: 'production'
    };
  }
}

// LocalStorage Adapter (for demo mode)
class LocalStorageAdapter implements DatabaseAdapter {
  private getStorageKey(table: string): string {
    return `studio_pos_${table}`;
  }

  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    try {
      const data = JSON.parse(localStorage.getItem(this.getStorageKey(table)) || '[]');
      
      let filteredData = data;
      
      if (options?.where) {
        filteredData = data.filter((item: any) => {
          return Object.entries(options.where!).every(([key, value]) => {
            return item[key] === value;
          });
        });
      }

      if (options?.orderBy) {
        filteredData.sort((a: any, b: any) => {
          const aVal = a[options.orderBy!.column];
          const bVal = b[options.orderBy!.column];
          const direction = options.orderBy!.direction === 'asc' ? 1 : -1;
          return aVal > bVal ? direction : aVal < bVal ? -direction : 0;
        });
      }

      if (options?.limit) {
        filteredData = filteredData.slice(0, options.limit);
      }

      if (options?.offset) {
        filteredData = filteredData.slice(options.offset);
      }

      return filteredData;
    } catch (error) {
      console.error('LocalStorage query error:', error);
      return [];
    }
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    try {
      const items = await this.query<T>(table);
      const newItem = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as T;

      items.push(newItem);
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error('LocalStorage create error:', error);
      throw error;
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const items = await this.query<T>(table);
      const index = items.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }

      items[index] = {
        ...items[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(this.getStorageKey(table), JSON.stringify(items));
      return items[index];
    } catch (error) {
      console.error('LocalStorage update error:', error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      const items = await this.query<any>(table);
      const filteredItems = items.filter((item: any) => item.id !== id);
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(filteredItems));
    } catch (error) {
      console.error('LocalStorage delete error:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    return true; // LocalStorage is always available
  }

  async getInfo(): Promise<{ type: string; isConnected: boolean; mode: string }> {
    return {
      type: 'local',
      isConnected: true,
      mode: 'development'
    };
  }
}

// Main Database Service
export class DatabaseService {
  private static instance: DatabaseService;
  private adapter: DatabaseAdapter | null = null;
  private config: DatabaseConfig | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load configuration from localStorage
      const configStr = localStorage.getItem('database_config');
      if (!configStr) {
        console.log('💾 No database config found, using LocalStorage');
        this.adapter = new LocalStorageAdapter();
        return;
      }

      this.config = JSON.parse(configStr);
      
      // Check if running in Electron
      const isElectron = typeof window !== 'undefined' && 
        (window as any).electronAPI?.database?.query;

      if (isElectron) {
        // Use Electron IPC for native database (PostgreSQL/SQLite)
        this.adapter = new ElectronAdapter();
        console.log('🔧 Using Electron native database (PostgreSQL/SQLite)');
        return;
      }

      // Initialize based on config type
      switch (this.config.type) {
        case 'supabase':
          if (this.config.connection?.url && this.config.connection?.key) {
            this.adapter = new SupabaseAdapter(
              this.config.connection.url,
              this.config.connection.key
            );
            console.log('🚀 Using Supabase database');
          } else {
            throw new Error('Supabase configuration incomplete');
          }
          break;

        case 'postgresql':
        case 'sqlite':
          // For web version, fallback to LocalStorage
          this.adapter = new LocalStorageAdapter();
          console.log('💾 Using LocalStorage (PostgreSQL/SQLite not available in web)');
          break;

        case 'local':
        default:
          this.adapter = new LocalStorageAdapter();
          console.log('💾 Using LocalStorage');
          break;
      }

      // Test connection
      if (this.adapter) {
        const isConnected = await this.adapter.isConnected();
        console.log(`✅ Database connected: ${isConnected}`);
      }

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Fallback to LocalStorage
      this.adapter = new LocalStorageAdapter();
      console.log('💾 Fallback to LocalStorage');
    }
  }

  // Public API methods
  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    if (!this.adapter) {
      await this.initialize();
    }
    return this.adapter!.query<T>(table, options);
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    if (!this.adapter) {
      await this.initialize();
    }
    return this.adapter!.create<T>(table, data);
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    if (!this.adapter) {
      await this.initialize();
    }
    return this.adapter!.update<T>(table, id, data);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.adapter) {
      await this.initialize();
    }
    return this.adapter!.delete(table, id);
  }

  async isConnected(): Promise<boolean> {
    if (!this.adapter) {
      await this.initialize();
    }
    return this.adapter!.isConnected();
  }

  async getInfo(): Promise<{ type: string; isConnected: boolean; mode: string }> {
    if (!this.adapter) {
      await this.initialize();
    }
    return this.adapter!.getInfo();
  }
}

// Electron Adapter (for native database operations)
class ElectronAdapter implements DatabaseAdapter {
  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.query) {
      return await (window as any).electronAPI.database.query(table, options);
    }
    throw new Error('Electron API not available');
  }

  async create<T>(table: string, data: Omit<T, 'id'>): Promise<T> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.create) {
      return await (window as any).electronAPI.database.create(table, data);
    }
    throw new Error('Electron API not available');
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.update) {
      return await (window as any).electronAPI.database.update(table, id, data);
    }
    throw new Error('Electron API not available');
  }

  async delete(table: string, id: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.delete) {
      return await (window as any).electronAPI.database.delete(table, id);
    }
    throw new Error('Electron API not available');
  }

  async isConnected(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.isConnected) {
      return await (window as any).electronAPI.database.isConnected();
    }
    return false;
  }

  async getInfo(): Promise<{ type: string; isConnected: boolean; mode: string }> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.getInfo) {
      return await (window as any).electronAPI.database.getInfo();
    }
    return { type: 'electron', isConnected: false, mode: 'production' };
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

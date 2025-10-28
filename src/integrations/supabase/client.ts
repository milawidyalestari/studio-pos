// Dynamic Supabase Client - Only creates client when Supabase is configured
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Default Supabase configuration (development)
const DEFAULT_SUPABASE_URL = "https://oojmuyalhveuefjbwysj.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY";

let supabaseClient: any = null;

// Simple wrapper untuk backward compatibility
const createTempWrapper = () => ({
  from: (table: string) => {
    console.warn(`⚠️ Using temporary Supabase wrapper for table: ${table}`);
    console.warn('This should be replaced with databaseService calls');
    
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: (result: any) => void) => {
            try {
              const { databaseService } = await import('@/services/databaseService');
              await databaseService.initialize();
              const data = await databaseService.query(table, {
                select: columns,
                where: { [column]: value }
              });
              callback({ data, error: null });
            } catch (error) {
              console.error(`Error querying ${table}:`, error);
              callback({ data: null, error });
            }
          }
        }),
        is: (column: string, value: any) => ({
          then: async (callback: (result: any) => void) => {
            try {
              const { databaseService } = await import('@/services/databaseService');
              await databaseService.initialize();
              const data = await databaseService.query(table, {
                select: columns,
                where: { [column]: value }
              });
              callback({ data, error: null });
            } catch (error) {
              console.error(`Error querying ${table}:`, error);
              callback({ data: null, error });
            }
          }
        }),
        order: (column: string, options?: any) => ({
          then: async (callback: (result: any) => void) => {
            try {
              const { databaseService } = await import('@/services/databaseService');
              await databaseService.initialize();
              const data = await databaseService.query(table, {
                select: columns,
                orderBy: { column, direction: options?.ascending ? 'asc' : 'desc' }
              });
              callback({ data, error: null });
            } catch (error) {
              console.error(`Error querying ${table}:`, error);
              callback({ data: null, error });
            }
          }
        }),
        then: async (callback: (result: any) => void) => {
          try {
            const { databaseService } = await import('@/services/databaseService');
            await databaseService.initialize();
            const data = await databaseService.query(table, {
              select: columns
            });
            callback({ data, error: null });
          } catch (error) {
            console.error(`Error querying ${table}:`, error);
            callback({ data: null, error });
          }
        }
      }),
      insert: (data: any) => ({
        then: async (callback: (result: any) => void) => {
          try {
            const { databaseService } = await import('@/services/databaseService');
            await databaseService.initialize();
            const result = await databaseService.create(table, data[0] || data);
            callback({ data: [result], error: null });
          } catch (error) {
            console.error(`Error inserting into ${table}:`, error);
            callback({ data: null, error });
          }
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: (result: any) => void) => {
            try {
              const { databaseService } = await import('@/services/databaseService');
              await databaseService.initialize();
              const items = await databaseService.query(table, {
                where: { [column]: value },
                limit: 1
              });
              if (items.length > 0) {
                const result = await databaseService.update(table, items[0].id, data);
                callback({ data: [result], error: null });
              } else {
                callback({ data: null, error: new Error('Item not found') });
              }
            } catch (error) {
              console.error(`Error updating ${table}:`, error);
              callback({ data: null, error });
            }
          }
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (callback: (result: any) => void) => {
            try {
              const { databaseService } = await import('@/services/databaseService');
              await databaseService.initialize();
              const items = await databaseService.query(table, {
                where: { [column]: value },
                limit: 1
              });
              if (items.length > 0) {
                await databaseService.delete(table, items[0].id);
                callback({ data: null, error: null });
              } else {
                callback({ data: null, error: new Error('Item not found') });
              }
            } catch (error) {
              console.error(`Error deleting from ${table}:`, error);
              callback({ data: null, error });
            }
          }
        })
      })
    };
  },
  auth: {
    getUser: () => ({
      then: async (callback: (result: any) => void) => {
        try {
          const { authService } = await import('@/services/authService');
          const user = authService.getCurrentUser();
          callback({ data: { user }, error: null });
        } catch (error) {
          console.error('Error getting user:', error);
          callback({ data: { user: null }, error });
        }
      }
    })
  }
});

/**
 * Get Supabase client - creates client only when Supabase is configured
 */
export const getSupabaseClient = (): any => {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    // Check if Supabase is configured in localStorage
    const configStr = localStorage.getItem('database_config');
    if (configStr) {
      const config = JSON.parse(configStr);
      
      if (config.type === 'supabase' && config.connection?.url && config.connection?.key) {
        // Use configured Supabase credentials
        supabaseClient = createClient<Database>(config.connection.url, config.connection.key);
        console.log('🚀 Using configured Supabase client');
        return supabaseClient;
      }
    }

    // Check if we're in development mode and should use default Supabase
    const isDevelopment = process.env.NODE_ENV === 'development';
    const useDefaultSupabase = localStorage.getItem('use_default_supabase') === 'true';
    
    if (isDevelopment && useDefaultSupabase) {
      // Use default Supabase for development
      supabaseClient = createClient<Database>(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
      console.log('🚀 Using default Supabase client (development)');
      return supabaseClient;
    }

    // No Supabase configuration - return temporary wrapper
    console.log('💾 Supabase not configured, using temporary wrapper');
    return createTempWrapper();

  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Fallback to temporary wrapper
    return createTempWrapper();
  }
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use getSupabaseClient() instead
 */
export const supabase = getSupabaseClient();

/**
 * Check if Supabase is available and configured
 */
export const isSupabaseAvailable = (): boolean => {
  return getSupabaseClient() !== null;
};

/**
 * Reset Supabase client (useful when configuration changes)
 */
export const resetSupabaseClient = (): void => {
  supabaseClient = null;
  console.log('🔄 Supabase client reset');
};
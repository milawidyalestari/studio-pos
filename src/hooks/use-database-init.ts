import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { databaseManager, type DatabaseConfig } from '@/lib/database-manager';

export const useDatabaseInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get stored configuration
  const getStoredConfig = (): DatabaseConfig | null => {
    try {
      const storedConfig = localStorage.getItem('database_config');
      if (storedConfig) {
        return JSON.parse(storedConfig);
      }
    } catch (error) {
      console.error('Error reading stored config:', error);
    }
    return null;
  };

  // Get environment configuration
  const getEnvConfig = (): DatabaseConfig | null => {
    const getEnvVar = (key: string): string => {
      if (typeof window !== 'undefined') {
        return (import.meta as any)?.env?.[key] || (window as any)?.[key] || '';
      }
      return process?.env?.[key] || '';
    };

    const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
    const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
    const useSupabase = getEnvVar('VITE_USE_SUPABASE');

    if (useSupabase === 'true' && supabaseUrl && supabaseKey) {
      return {
        mode: 'development',
        type: 'supabase',
        connection: {
          url: supabaseUrl,
          key: supabaseKey
        }
      };
    }

    return null;
  };

  // Initialize database
  const initializeDatabase = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // Get configuration (stored config takes priority)
      const storedConfig = getStoredConfig();
      const envConfig = getEnvConfig();
      const config = storedConfig || envConfig;

      if (config) {
        console.log('🔧 Initializing database with config:', config);
        await databaseManager.initialize(config);
        setIsInitialized(true);
        console.log('✅ Database initialized successfully');
              } else {
          // Check if we're in Electron environment with retry
          let isElectron = false;
          let retryCount = 0;
          const maxRetries = 5;
          
          while (retryCount < maxRetries) {
            isElectron = typeof window !== 'undefined' && (window as any).electronAPI;
            if (isElectron) break;
            
            console.log(`🔄 Waiting for Electron API... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
          }
          
          if (isElectron) {
            // Use PostgreSQL/SQLite in Electron
            console.log('🖥️ Using PostgreSQL/SQLite configuration for Electron');
            await databaseManager.initialize({
              mode: 'production',
              type: 'postgresql'
            });
          } else {
            // Default to local storage for web development
            console.log('💾 Using default local storage configuration');
            await databaseManager.initialize({
              mode: 'development',
              type: 'local'
            });
          }
          setIsInitialized(true);
        }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Database initialization failed:', errorMessage);
      setError(errorMessage);
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Database info query
  const { data: dbInfo, refetch: refetchDbInfo } = useQuery({
    queryKey: ['database-info'],
    queryFn: async () => {
      return await databaseManager.getInfo();
    },
    enabled: isInitialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Don't auto-refetch
  });

  // Initialize on mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Re-initialize when configuration changes
  const reinitialize = async (config?: DatabaseConfig) => {
    if (config) {
      // Save new configuration
      localStorage.setItem('database_config', JSON.stringify(config));
    }
    
    await initializeDatabase();
    refetchDbInfo();
  };

  // Reset to default configuration
  const resetToDefault = async () => {
    localStorage.removeItem('database_config');
    await initializeDatabase();
    refetchDbInfo();
  };

  return {
    isInitialized,
    isInitializing,
    error,
    dbInfo,
    reinitialize,
    resetToDefault,
    refetchDbInfo
  };
};

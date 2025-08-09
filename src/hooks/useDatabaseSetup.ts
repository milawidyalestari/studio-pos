import { useState, useEffect } from 'react';

interface DatabaseConfig {
  useSupabase: boolean;
  url?: string;
  key?: string;
}

export const useDatabaseSetup = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<DatabaseConfig | null>(null);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = () => {
    try {
      // Check if setup has been completed
      const setupCompleted = localStorage.getItem('database_setup_completed');
      const savedConfig = localStorage.getItem('database_config');

      if (setupCompleted === 'true' && savedConfig) {
        const config = JSON.parse(savedConfig);
        setCurrentConfig(config);
        setIsSetupComplete(true);
        applyDatabaseConfig(config);
      } else {
        // Show setup wizard on first run
        setShowSetupWizard(true);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      // Show setup wizard if there's an error reading config
      setShowSetupWizard(true);
    }
  };

  const applyDatabaseConfig = (config: DatabaseConfig) => {
    try {
      // Apply configuration to window object (simulating environment variables)
      if (typeof window !== 'undefined') {
        if (config.useSupabase && config.url && config.key) {
          (window as any).VITE_USE_SUPABASE = 'true';
          (window as any).VITE_SUPABASE_URL = config.url;
          (window as any).VITE_SUPABASE_ANON_KEY = config.key;
          console.log('🚀 Applied Supabase configuration');
        } else {
          (window as any).VITE_USE_SUPABASE = 'false';
          console.log('💾 Applied Local Storage configuration');
        }
      }
    } catch (error) {
      console.error('Error applying database config:', error);
    }
  };

  const completeSetup = (config: DatabaseConfig) => {
    try {
      // Save configuration
      localStorage.setItem('database_config', JSON.stringify(config));
      localStorage.setItem('database_setup_completed', 'true');

      // Apply configuration
      applyDatabaseConfig(config);

      // Update state
      setCurrentConfig(config);
      setIsSetupComplete(true);
      setShowSetupWizard(false);

      // Force page reload to apply new database configuration
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error completing setup:', error);
    }
  };

  const resetSetup = () => {
    try {
      localStorage.removeItem('database_setup_completed');
      localStorage.removeItem('database_config');
      setIsSetupComplete(false);
      setCurrentConfig(null);
      setShowSetupWizard(true);
    } catch (error) {
      console.error('Error resetting setup:', error);
    }
  };

  const updateConfig = (config: DatabaseConfig) => {
    try {
      localStorage.setItem('database_config', JSON.stringify(config));
      applyDatabaseConfig(config);
      setCurrentConfig(config);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const isFirstRun = () => {
    try {
      const setupCompleted = localStorage.getItem('database_setup_completed');
      return setupCompleted !== 'true';
    } catch (error) {
      return true;
    }
  };

  return {
    isSetupComplete,
    showSetupWizard,
    currentConfig,
    completeSetup,
    resetSetup,
    updateConfig,
    isFirstRun: isFirstRun(),
    checkSetupStatus
  };
};
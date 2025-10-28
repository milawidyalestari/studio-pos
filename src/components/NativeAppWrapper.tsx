import React, { useState, useEffect } from 'react';
import { NativeDatabaseStatus } from './NativeDatabaseStatus';
import { NativeLogin } from './NativeLogin';
import { DatabaseRequiredSetup } from './DatabaseRequiredSetup';
import { DatabaseSetupWizard } from './DatabaseSetupWizard';
import { DatabaseMigrationStatus } from './DatabaseMigrationStatus';
import { Loader2 } from 'lucide-react';
import { DatabaseMigrationService, MigrationStatus } from '../services/DatabaseMigrationService';
import { useNativeApp } from '@/context/NativeAppContext';

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  full_name: string;
  is_active: boolean;
}

interface NativeAppWrapperProps {
  children: React.ReactNode;
}

type AppState = 'detecting' | 'database-required' | 'setup' | 'setup-wizard' | 'migration' | 'login' | 'ready';

export const NativeAppWrapper: React.FC<NativeAppWrapperProps> = ({ children }) => {
  const { appState, setAppState, currentUser, setCurrentUser } = useNativeApp();
  const [isLoading, setIsLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const migrationService = DatabaseMigrationService.getInstance();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is already logged in
      const storedUser = sessionStorage.getItem('current_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setAppState('ready');
        return;
      }

      // Check if database setup has already been completed
      const setupCompleted = localStorage.getItem('database_setup_completed');
      if (setupCompleted === 'true') {
        console.log('✅ Database setup already completed, proceeding to login');
        setAppState('login');
        return;
      }

      // For first-time installation, go directly to DatabaseSetupWizard
      console.log('🆕 First-time installation detected, starting Database Setup Wizard');
      setAppState('setup-wizard');
      
    } catch (error) {
      console.error('App initialization failed:', error);
      setAppState('setup-wizard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setAppState('login');
  };

  const handleMigrationComplete = (status: MigrationStatus) => {
    setMigrationStatus(status);
    setAppState('login');
  };

  const handleMigrationError = (error: string) => {
    console.error('Migration error:', error);
    // Fallback to setup wizard
    setAppState('setup-wizard');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState('ready');
  };

  const handleLogout = () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Step 1: Clear user data
      sessionStorage.removeItem('current_user');
      console.log('✅ User data cleared from sessionStorage');
      
      // Step 2: Clear any other auth-related data
      localStorage.removeItem('azuro_user');
      console.log('✅ User data cleared from localStorage');
      
      // Step 3: Reset app state
      setCurrentUser(null);
      setAppState('login');
      console.log('✅ App state reset to login');
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Fallback logout method
      try {
        sessionStorage.clear();
        localStorage.removeItem('azuro_user');
        setCurrentUser(null);
        setAppState('login');
      } catch (fallbackError) {
        console.error('❌ Fallback logout failed:', fallbackError);
        // Last resort - reload page
        window.location.reload();
      }
    }
  };

  // Function to reset database setup (for testing or re-setup)
  const resetDatabaseSetup = () => {
    localStorage.removeItem('database_setup_completed');
    localStorage.removeItem('database_setup_date');
    localStorage.removeItem('database_setup_skipped');
    localStorage.removeItem('database_config');
    setAppState('setup-wizard');
  };

  const handleSetupRequired = () => {
    setAppState('setup');
  };

  const handleDatabaseRequired = () => {
    setAppState('database-required');
  };

  const handleSkipDatabaseSetup = () => {
    // Save setup completion status for demo mode
    localStorage.setItem('database_setup_completed', 'true');
    localStorage.setItem('database_setup_date', new Date().toISOString());
    localStorage.setItem('database_setup_skipped', 'true');
    
    // Create default user for demo mode
    const defaultUser = {
      id: 'admin',
      username: 'admin',
      password: 'admin123',
      email: 'admin@studio-pos.com',
      role: 'Administrator',
      full_name: 'Administrator',
      is_active: true
    };
    
    sessionStorage.setItem('current_user', JSON.stringify(defaultUser));
    setCurrentUser(defaultUser);
    setAppState('ready');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Initializing Studio POS</h2>
          <p className="text-sm text-muted-foreground">Please wait while we set up your application...</p>
        </div>
      </div>
    );
  }

  // Show migration screen
  if (appState === 'migration') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <DatabaseMigrationStatus 
          onMigrationComplete={handleMigrationComplete}
          onMigrationError={handleMigrationError}
        />
      </div>
    );
  }

  // Show setup wizard
  if (appState === 'setup-wizard') {
    return (
      <DatabaseSetupWizard 
        onSetupComplete={handleSetupComplete}
        onSkipSetup={handleSkipDatabaseSetup}
      />
    );
  }

  // Show database required screen (fallback)
  if (appState === 'database-required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <DatabaseRequiredSetup 
          onSetupComplete={handleSetupComplete}
          onSkipSetup={handleSkipDatabaseSetup}
        />
      </div>
    );
  }

  // Show setup screen
  if (appState === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <NativeDatabaseStatus onSetupComplete={handleSetupComplete} />
      </div>
    );
  }

  // Show login screen
  if (appState === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <NativeLogin 
          onLoginSuccess={handleLoginSuccess}
          onSetupRequired={handleSetupRequired}
          onResetSetup={resetDatabaseSetup}
        />
      </div>
    );
  }

  // Show main application with user context
  if (appState === 'ready' && currentUser) {
    return (
      <div className="min-h-screen bg-transparent">
        {/* Main application content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Application Error</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Something went wrong. Please refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default NativeAppWrapper;

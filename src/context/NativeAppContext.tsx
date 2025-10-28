import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  full_name: string;
  is_active: boolean;
}

type AppState = 'detecting' | 'database-required' | 'setup' | 'setup-wizard' | 'migration' | 'login' | 'ready';

interface NativeAppContextType {
  appState: AppState;
  currentUser: User | null;
  setAppState: (state: AppState) => void;
  setCurrentUser: (user: User | null) => void;
}

const NativeAppContext = createContext<NativeAppContextType | undefined>(undefined);

interface NativeAppProviderProps {
  children: ReactNode;
}

export const NativeAppProvider: React.FC<NativeAppProviderProps> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>('detecting');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <NativeAppContext.Provider value={{
      appState,
      currentUser,
      setAppState,
      setCurrentUser
    }}>
      {children}
    </NativeAppContext.Provider>
  );
};

export const useNativeApp = () => {
  const context = useContext(NativeAppContext);
  if (context === undefined) {
    throw new Error('useNativeApp must be used within a NativeAppProvider');
  }
  return context;
};

export default NativeAppContext;






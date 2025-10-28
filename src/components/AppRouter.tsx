import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNativeApp } from '@/context/NativeAppContext';

interface AppRouterProps {
  children: React.ReactNode;
}

export const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appState, currentUser } = useNativeApp();

  // Handle navigation after login success
  useEffect(() => {
    if (appState === 'ready' && currentUser && location.pathname === '/') {
      console.log('🎯 User logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [appState, currentUser, location.pathname, navigate]);

  return <>{children}</>;
};

export default AppRouter;

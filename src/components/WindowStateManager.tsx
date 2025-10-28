import React, { createContext, useContext, useState, useEffect } from 'react';

interface WindowStateContextType {
  isMinimized: boolean;
  isMaximized: boolean;
  isVisible: boolean;
  isMinimizing: boolean;
  isRestoring: boolean;
  triggerAnimation: (type: 'minimize' | 'restore' | 'maximize') => void;
}

const WindowStateContext = createContext<WindowStateContextType | undefined>(undefined);

export const useWindowState = () => {
  const context = useContext(WindowStateContext);
  if (!context) {
    throw new Error('useWindowState must be used within WindowStateProvider');
  }
  return context;
};

interface WindowStateProviderProps {
  children: React.ReactNode;
}

export const WindowStateProvider: React.FC<WindowStateProviderProps> = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

  useEffect(() => {
    if (!isElectron) return;

    // Check initial window state
    const checkInitialState = async () => {
      try {
        const info = await (window as any).electronAPI.window.getWindowInfo();
        if (info.success) {
          setIsMaximized(info.info.isMaximized);
          setIsMinimized(info.info.isMinimized);
        }
      } catch (error) {
        console.error('Failed to get window info:', error);
      }
    };

    checkInitialState();

    // Listen for window events
    const handleWindowFocus = () => {
      setIsMinimized(false);
      setIsVisible(true);
      if (isRestoring) {
        setTimeout(() => setIsRestoring(false), 300);
      }
    };

    const handleWindowBlur = () => {
      // Window is losing focus but not necessarily minimized
    };

    const handleWindowShow = () => {
      setIsMinimized(false);
      setIsVisible(true);
      setIsRestoring(true);
      setTimeout(() => setIsRestoring(false), 500);
    };

    const handleWindowHide = () => {
      setIsMinimized(true);
      setIsVisible(false);
    };

    // Add event listeners
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('show', handleWindowShow);
    window.addEventListener('hide', handleWindowHide);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('show', handleWindowShow);
      window.removeEventListener('hide', handleWindowHide);
    };
  }, [isElectron, isRestoring]);

  const triggerAnimation = (type: 'minimize' | 'restore' | 'maximize') => {
    // Animation disabled - no action needed
  };

  return (
    <WindowStateContext.Provider value={{
      isMinimized,
      isMaximized,
      isVisible,
      isMinimizing,
      isRestoring,
      triggerAnimation
    }}>
      {children}
    </WindowStateContext.Provider>
  );
};

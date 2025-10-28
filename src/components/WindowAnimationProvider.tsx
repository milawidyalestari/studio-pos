import React, { createContext, useContext, useState, useEffect } from 'react';

interface WindowAnimationContextType {
  isAnimating: boolean;
  animationType: 'minimize' | 'maximize' | 'close' | null;
  startAnimation: (type: 'minimize' | 'maximize' | 'close') => void;
  stopAnimation: () => void;
}

const WindowAnimationContext = createContext<WindowAnimationContextType | undefined>(undefined);

export const useWindowAnimation = () => {
  const context = useContext(WindowAnimationContext);
  if (!context) {
    throw new Error('useWindowAnimation must be used within WindowAnimationProvider');
  }
  return context;
};

interface WindowAnimationProviderProps {
  children: React.ReactNode;
}

export const WindowAnimationProvider: React.FC<WindowAnimationProviderProps> = ({ children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'minimize' | 'maximize' | 'close' | null>(null);

  const startAnimation = (type: 'minimize' | 'maximize' | 'close') => {
    setAnimationType(type);
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setTimeout(() => setAnimationType(null), 300);
  };

  return (
    <WindowAnimationContext.Provider value={{
      isAnimating,
      animationType,
      startAnimation,
      stopAnimation
    }}>
      {children}
    </WindowAnimationContext.Provider>
  );
};

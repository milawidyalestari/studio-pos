import React from 'react';
import { useWindowState } from './WindowStateManager';

interface WindowTransitionEffectProps {
  children: React.ReactNode;
}

export const WindowTransitionEffect: React.FC<WindowTransitionEffectProps> = ({ children }) => {
  const { isMinimizing, isRestoring, isVisible, isMaximized } = useWindowState();
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

  // Don't render transition effects in web browser
  if (!isElectron) {
    return <>{children}</>;
  }

  // Determine if this is a maximize animation (restoring + maximized)
  const isMaximizeAnimation = isRestoring && isMaximized;

  return (
    <div 
      className={`
        transition-all duration-500 ease-in-out
        ${!isVisible ? 'opacity-0' : 'opacity-100'}
      `}
      style={{
        transform: 'scale(1) translateY(0)',
        transformOrigin: 'center center'
      }}
    >
      {children}
    </div>
  );
};

export default WindowTransitionEffect;

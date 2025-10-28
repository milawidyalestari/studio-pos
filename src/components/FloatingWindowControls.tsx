import React from 'react';
import { WindowControls } from './WindowControls';

interface FloatingWindowControlsProps {
  position?: 'top-right' | 'top-left';
  className?: string;
}

export const FloatingWindowControls: React.FC<FloatingWindowControlsProps> = ({ 
  position = 'top-right',
  className = ''
}) => {
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

  // Don't render in web browser
  if (!isElectron) {
    return null;
  }

  const positionClasses = position === 'top-right' 
    ? 'top-4 right-4' 
    : 'top-4 left-4';

  return (
    <div 
      className={`fixed ${positionClasses} z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg ${className}`}
    >
      <WindowControls />
    </div>
  );
};

export default FloatingWindowControls;

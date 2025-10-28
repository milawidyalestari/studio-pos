import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowState } from './WindowStateManager';

interface AnimatedWindowControlsProps {
  className?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const AnimatedWindowControls: React.FC<AnimatedWindowControlsProps> = ({ 
  className = '',
  onMinimize,
  onMaximize,
  onClose
}) => {
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;
  const { isMaximized, triggerAnimation } = useWindowState();
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isMaximizing, setIsMaximizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check initial window state
    if (isElectron) {
      checkWindowState();
    }
  }, [isElectron]);

  const checkWindowState = async () => {
    try {
      const info = await (window as any).electronAPI.window.getWindowInfo();
      if (info.success) {
        // Window state is managed by WindowStateManager
        // No need to set state here as it's already handled by the context
        console.log('Window state checked:', info.info);
      }
    } catch (error) {
      console.error('Failed to get window info:', error);
    }
  };

  const handleMinimize = async () => {
    if (isElectron && !isMinimizing) {
      try {
        setIsMinimizing(true);
        
        // Trigger animation callback
        if (onMinimize) {
          onMinimize();
        }
        
        await (window as any).electronAPI.window.minimize();
        
        // Reset animation state immediately
        setIsMinimizing(false);
      } catch (error) {
        console.error('Failed to minimize window:', error);
        setIsMinimizing(false);
      }
    }
  };

  const handleMaximize = async () => {
    if (isElectron && !isMaximizing) {
      try {
        setIsMaximizing(true);
        
        // Trigger animation callback
        if (onMaximize) {
          onMaximize();
        }
        
        await (window as any).electronAPI.window.maximize();
        
        // Reset animation state immediately
        setIsMaximizing(false);
      } catch (error) {
        console.error('Failed to maximize window:', error);
        setIsMaximizing(false);
      }
    }
  };

  const handleClose = async () => {
    if (isElectron && !isClosing) {
      try {
        setIsClosing(true);
        
        // Trigger animation callback
        if (onClose) {
          onClose();
        }
        
        // Add close animation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await (window as any).electronAPI.window.close();
      } catch (error) {
        console.error('Failed to close window:', error);
        setIsClosing(false);
      }
    }
  };

  // Don't render in web browser
  if (!isElectron) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Minimize Button */}
      <button
        onClick={handleMinimize}
        disabled={isMinimizing}
        className={`
          h-8 w-12 flex items-center justify-center transition-all duration-200 group relative overflow-hidden
          ${isMinimizing 
            ? 'bg-white/30 scale-95' 
            : 'hover:bg-white/20 hover:scale-105'
          }
          ${isMinimizing ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isMinimizing ? "Minimizing..." : "Minimize"}
      >
        <div className={`transition-all duration-200 ${isMinimizing ? 'animate-pulse' : ''}`}>
          <Minus className={`h-4 w-4 transition-all duration-200 ${
            isMinimizing 
              ? 'text-white/60' 
              : 'text-white/80 group-hover:text-white'
          }`} />
        </div>
        
        {/* Minimize Animation Effect */}
        {isMinimizing && (
          <div className="absolute inset-0 bg-white/10 animate-ping rounded-full" />
        )}
      </button>
      
      {/* Maximize Button */}
      <button
        onClick={handleMaximize}
        disabled={isMaximizing}
        className={`
          h-8 w-12 flex items-center justify-center transition-all duration-200 group relative overflow-hidden
          ${isMaximizing 
            ? 'bg-white/30 scale-95' 
            : 'hover:bg-white/20 hover:scale-105'
          }
          ${isMaximizing ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isMaximizing ? "Maximizing..." : isMaximized ? "Restore" : "Maximize"}
      >
        <div className={`transition-all duration-200 ${isMaximizing ? 'animate-pulse' : ''}`}>
          {isMaximized ? (
            <Minimize2 className={`h-4 w-4 transition-all duration-200 ${
              isMaximizing 
                ? 'text-white/60' 
                : 'text-white/80 group-hover:text-white'
            }`} />
          ) : (
            <Maximize2 className={`h-4 w-4 transition-all duration-200 ${
              isMaximizing 
                ? 'text-white/60' 
                : 'text-white/80 group-hover:text-white'
            }`} />
          )}
        </div>
        
        {/* Maximize Animation Effect */}
        {isMaximizing && (
          <div className="absolute inset-0 bg-white/10 animate-ping rounded-full" />
        )}
      </button>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        disabled={isClosing}
        className={`
          h-8 w-12 flex items-center justify-center transition-all duration-200 group relative overflow-hidden
          ${isClosing 
            ? 'bg-red-400 scale-95' 
            : 'hover:bg-red-500 hover:scale-105'
          }
          ${isClosing ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isClosing ? "Closing..." : "Close"}
      >
        <div className={`transition-all duration-200 ${isClosing ? 'animate-pulse' : ''}`}>
          <X className={`h-4 w-4 transition-all duration-200 ${
            isClosing 
              ? 'text-white/60' 
              : 'text-white/80 group-hover:text-white'
          }`} />
        </div>
        
        {/* Close Animation Effect */}
        {isClosing && (
          <div className="absolute inset-0 bg-red-400/20 animate-ping rounded-full" />
        )}
      </button>
    </div>
  );
};

export default AnimatedWindowControls;

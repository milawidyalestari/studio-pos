import React, { useState, useEffect } from 'react';
import { WindowControls } from './WindowControls';
import { AnimatedWindowControls } from './AnimatedWindowControls';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

interface TitleBarProps {
  title?: string;
  className?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  useAnimatedControls?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ 
  title = 'Studio POS', 
  className = '',
  showMenu = false,
  onMenuClick,
  useAnimatedControls = true
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

  useEffect(() => {
    // Listen for window state changes
    if (isElectron) {
      const checkWindowState = async () => {
        try {
          const info = await (window as any).electronAPI.window.getWindowInfo();
          if (info.success) {
            setIsMaximized(info.info.isMaximized);
          }
        } catch (error) {
          console.error('Failed to get window info:', error);
        }
      };

      // Check initial state
      checkWindowState();

      // Listen for maximize/restore events
      const handleMaximize = () => setIsMaximized(true);
      const handleRestore = () => setIsMaximized(false);

      // Note: These events would need to be implemented in the Electron main process
      // For now, we'll update state when user clicks maximize button
    }
  }, [isElectron]);

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  // Don't render in web browser
  if (!isElectron) {
    return null;
  }

  return (
    <div 
      className={`flex items-center justify-between h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white select-none shadow-lg ${className}`}
      style={{ 
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Left side - Title only */}
      <div className="flex items-center flex-1">
        <div className="flex items-center ml-3">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center mr-3">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-medium">
            {title}
          </span>
        </div>
      </div>

      {/* Right side - Window Controls */}
      <div style={{ WebkitAppRegion: 'no-drag' }}>
        {useAnimatedControls ? (
          <AnimatedWindowControls />
        ) : (
          <WindowControls />
        )}
      </div>
    </div>
  );
};

export default TitleBar;

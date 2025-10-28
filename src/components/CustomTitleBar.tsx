import React from 'react';
import { Button } from './ui/button';
import { Minimize2, Maximize2, X, Square } from 'lucide-react';

interface CustomTitleBarProps {
  title?: string;
  className?: string;
}

export const CustomTitleBar: React.FC<CustomTitleBarProps> = ({ 
  title = "Studio POS",
  className = ""
}) => {
  const handleMinimize = () => {
    if (window.electronAPI?.window?.minimize) {
      window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.window?.maximize) {
      window.electronAPI.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.window?.close) {
      window.electronAPI.window.close();
    }
  };

  // Only show in Electron app
  if (!window.electronAPI) {
    return null;
  }

  return (
    <div className={`custom-title-bar flex items-center justify-between px-4 py-2 ${className}`}>
      {/* Left side - Title */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </span>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="title-bar-button w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Minimize2 className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaximize}
          className="title-bar-button w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="title-bar-button w-8 h-8 p-0 hover:bg-red-500 hover:text-white"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// Alternative compact title bar
export const CompactTitleBar: React.FC<CustomTitleBarProps> = ({ 
  title = "Studio POS",
  className = ""
}) => {
  const handleClose = () => {
    if (window.electronAPI?.window?.close) {
      window.electronAPI.window.close();
    }
  };

  if (!window.electronAPI) {
    return null;
  }

  return (
    <div className={`custom-title-bar flex items-center justify-between px-3 py-1 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {title}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="title-bar-button w-6 h-6 p-0 hover:bg-red-500 hover:text-white"
      >
        <X className="w-2.5 h-2.5" />
      </Button>
    </div>
  );
};

// Floating title bar
export const FloatingTitleBar: React.FC<CustomTitleBarProps> = ({ 
  title = "Studio POS",
  className = ""
}) => {
  const handleClose = () => {
    if (window.electronAPI?.window?.close) {
      window.electronAPI.window.close();
    }
  };

  if (!window.electronAPI) {
    return null;
  }

  return (
    <div className={`fixed top-2 right-2 z-50 ${className}`}>
      <div className="glass-button rounded-lg px-3 py-2 flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {title}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="w-5 h-5 p-0 hover:bg-red-500 hover:text-white"
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </div>
    </div>
  );
};


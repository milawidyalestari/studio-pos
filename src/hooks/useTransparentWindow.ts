import { useState, useEffect, useCallback } from 'react';

interface WindowInfo {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isVisible: boolean;
  platform: string;
}

interface UseTransparentWindowReturn {
  windowInfo: WindowInfo | null;
  isTransparent: boolean;
  isFrameless: boolean;
  setTransparent: (transparent: boolean) => Promise<boolean>;
  setFrameless: (frameless: boolean) => Promise<boolean>;
  setTitleBarStyle: (style: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover') => Promise<boolean>;
  setVibrancy: (vibrancy: string) => Promise<boolean>;
  refreshWindowInfo: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useTransparentWindow = (): UseTransparentWindowReturn => {
  const [windowInfo, setWindowInfo] = useState<WindowInfo | null>(null);
  const [isTransparent, setIsTransparent] = useState(false);
  const [isFrameless, setIsFrameless] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWindowInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI?.window?.getWindowInfo) {
        const result = await window.electronAPI.window.getWindowInfo();
        if (result.success) {
          setWindowInfo(result.info);
        } else {
          setError(result.error || 'Failed to get window info');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const setTransparent = useCallback(async (transparent: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI?.window?.setTransparent) {
        const result = await window.electronAPI.window.setTransparent(transparent);
        if (result.success) {
          setIsTransparent(transparent);
          await refreshWindowInfo();
          return true;
        } else {
          setError(result.error || 'Failed to set transparency');
          return false;
        }
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshWindowInfo]);

  const setFrameless = useCallback(async (frameless: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI?.window?.setFrame) {
        const result = await window.electronAPI.window.setFrame(!frameless);
        if (result.success) {
          setIsFrameless(frameless);
          await refreshWindowInfo();
          return true;
        } else {
          setError(result.error || 'Failed to set frame');
          return false;
        }
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshWindowInfo]);

  const setTitleBarStyle = useCallback(async (style: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI?.window?.setTitleBarStyle) {
        const result = await window.electronAPI.window.setTitleBarStyle(style);
        if (result.success) {
          await refreshWindowInfo();
          return true;
        } else {
          setError(result.error || 'Failed to set title bar style');
          return false;
        }
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshWindowInfo]);

  const setVibrancy = useCallback(async (vibrancy: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.electronAPI?.window?.setVibrancy) {
        const result = await window.electronAPI.window.setVibrancy(vibrancy);
        if (result.success) {
          await refreshWindowInfo();
          return true;
        } else {
          setError(result.error || 'Failed to set vibrancy');
          return false;
        }
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshWindowInfo]);

  useEffect(() => {
    refreshWindowInfo();
  }, [refreshWindowInfo]);

  return {
    windowInfo,
    isTransparent,
    isFrameless,
    setTransparent,
    setFrameless,
    setTitleBarStyle,
    setVibrancy,
    refreshWindowInfo,
    loading,
    error,
  };
};


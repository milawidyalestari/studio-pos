import { useState, useCallback } from 'react';

interface CashDrawerOptions {
  port?: string;
  baudRate?: number;
  timeout?: number;
}

interface CashDrawerResult {
  success: boolean;
  message: string;
  portInfo?: any;
}

interface UseCashDrawerReturn {
  isOpening: boolean;
  isTesting: boolean;
  isLoading: boolean;
  error: string | null;
  availablePorts: any[];
  openCashDrawer: (options?: CashDrawerOptions) => Promise<CashDrawerResult>;
  testCashDrawer: (options?: CashDrawerOptions) => Promise<CashDrawerResult>;
  listAvailablePorts: () => Promise<void>;
  clearError: () => void;
}

export const useCashDrawer = (): UseCashDrawerReturn => {
  const [isOpening, setIsOpening] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePorts, setAvailablePorts] = useState<any[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const openCashDrawer = useCallback(async (options: CashDrawerOptions = {}): Promise<CashDrawerResult> => {
    if (!window.electronAPI?.cashdrawer) {
      const errorMsg = 'Cash drawer API not available. Make sure you are running in Electron.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsOpening(true);
    setError(null);

    try {
      const result = await window.electronAPI.cashdrawer.open(options);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to open cash drawer';
      setError(errorMsg);
      throw err;
    } finally {
      setIsOpening(false);
    }
  }, []);

  const testCashDrawer = useCallback(async (options: CashDrawerOptions = {}): Promise<CashDrawerResult> => {
    if (!window.electronAPI?.cashdrawer) {
      const errorMsg = 'Cash drawer API not available. Make sure you are running in Electron.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsTesting(true);
    setError(null);

    try {
      const result = await window.electronAPI.cashdrawer.test(options);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to test cash drawer';
      setError(errorMsg);
      throw err;
    } finally {
      setIsTesting(false);
    }
  }, []);

  const listAvailablePorts = useCallback(async (): Promise<void> => {
    if (!window.electronAPI?.cashdrawer) {
      const errorMsg = 'Cash drawer API not available. Make sure you are running in Electron.';
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.cashdrawer.listPorts();
      if (result.success) {
        setAvailablePorts(result.ports);
      } else {
        setError(result.error || 'Failed to list ports');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to list available ports';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isOpening,
    isTesting,
    isLoading,
    error,
    availablePorts,
    openCashDrawer,
    testCashDrawer,
    listAvailablePorts,
    clearError,
  };
};


import { useState, useCallback } from 'react';
import { notaPrintService, NotaPrintResult } from '../services/notaPrintService';

export interface UseNotaPrintStatusReturn {
  notaPrintStatus: boolean | null;
  isChecking: boolean;
  checkNotaPrintStatus: (orderNumber: string) => Promise<void>;
  markNotaAsPrinted: (orderNumber: string) => Promise<NotaPrintResult>;
  resetNotaPrintStatus: (orderNumber: string) => Promise<NotaPrintResult>;
  getAllNotaPrintStatuses: () => Promise<Array<{order_number: string, receipt_printed: boolean}>>;
}

export const useNotaPrintStatus = (): UseNotaPrintStatusReturn => {
  const [notaPrintStatus, setNotaPrintStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkNotaPrintStatus = useCallback(async (orderNumber: string) => {
    if (!orderNumber) return;
    
    setIsChecking(true);
    try {
      const status = await notaPrintService.getNotaPrintStatus(orderNumber);
      setNotaPrintStatus(status);
    } catch (error) {
      console.error('Error checking nota print status:', error);
      setNotaPrintStatus(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const markNotaAsPrinted = useCallback(async (orderNumber: string): Promise<NotaPrintResult> => {
    try {
      const result = await notaPrintService.markNotaAsPrinted(orderNumber);
      if (result.success) {
        setNotaPrintStatus(true);
      }
      return result;
    } catch (error) {
      console.error('Error marking nota as printed:', error);
      return {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        orderNumber
      };
    }
  }, []);

  const resetNotaPrintStatus = useCallback(async (orderNumber: string): Promise<NotaPrintResult> => {
    try {
      const result = await notaPrintService.resetNotaPrintStatus(orderNumber);
      if (result.success) {
        setNotaPrintStatus(false);
      }
      return result;
    } catch (error) {
      console.error('Error resetting nota print status:', error);
      return {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        orderNumber
      };
    }
  }, []);

  const getAllNotaPrintStatuses = useCallback(async (): Promise<Array<{order_number: string, receipt_printed: boolean}>> => {
    try {
      return await notaPrintService.getAllNotaPrintStatuses();
    } catch (error) {
      console.error('Error getting all nota print statuses:', error);
      return [];
    }
  }, []);

  return {
    notaPrintStatus,
    isChecking,
    checkNotaPrintStatus,
    markNotaAsPrinted,
    resetNotaPrintStatus,
    getAllNotaPrintStatuses
  };
};

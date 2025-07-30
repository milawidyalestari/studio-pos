import { useState, useCallback } from 'react';
import { toast } from '../hooks/use-toast';

export interface PrintData {
  orderList?: Array<{
    id: string;
    item: string; // Product name (not code)
    quantity: number;
    subTotal: number;
    ukuran?: {
      panjang?: string;
      lebar?: string;
    };
    [key: string]: any;
  }>;
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number;
    [key: string]: any;
  };
  previewContent?: React.ReactNode;
}

export type PrintType = 'spk' | 'receipt' | 'nota' | 'pelunasan' | 'other';

export const usePrintOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [printType, setPrintType] = useState<PrintType>('other');
  const [printData, setPrintData] = useState<PrintData>({});

  const openPrintOverlay = useCallback((type: PrintType, data: PrintData = {}) => {
    setPrintType(type);
    setPrintData(data);
    setIsOpen(true);
  }, []);

  const closePrintOverlay = useCallback(() => {
    setIsOpen(false);
    setPrintData({});
    setPrintType('other');
  }, []);

  const handlePrint = useCallback(async () => {
    try {
      // Simulate print process
      console.log(`Printing ${printType} with data:`, printData);
      
      // Here you would implement the actual print logic
      // For now, we'll just show a success message
      // Hapus toast sukses
      // if (printType === 'receipt' && printData.orderData?.orderNumber) {
      //   // Update receipt_printed status in database if needed
      //   console.log('Updating receipt printed status for order:', printData.orderData.orderNumber);
      // }
      
      closePrintOverlay();
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: 'Print Error',
        description: 'Failed to print. Please try again.',
        variant: 'destructive',
      });
    }
  }, [printType, printData, closePrintOverlay]);

  // Convenience functions for different print types
  const printSPK = useCallback((data: PrintData) => {
    openPrintOverlay('spk', data);
  }, [openPrintOverlay]);

  const printReceipt = useCallback((data: PrintData) => {
    openPrintOverlay('receipt', data);
  }, [openPrintOverlay]);

  const printNota = useCallback((data: PrintData) => {
    openPrintOverlay('nota', data);
  }, [openPrintOverlay]);

  const printPelunasan = useCallback((data: PrintData) => {
    openPrintOverlay('pelunasan', data);
  }, [openPrintOverlay]);

  return {
    isOpen,
    printType,
    printData,
    openPrintOverlay,
    closePrintOverlay,
    handlePrint,
    printSPK,
    printReceipt,
    printNota,
    printPelunasan,
  };
}; 
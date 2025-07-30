import { useState, useCallback } from 'react';
import { printService, PrintSettings, PrintJob } from '../services/printService';

export interface UsePrintServiceReturn {
  isPrinting: boolean;
  availablePrinters: any[];
  systemPrinters: any[];
  printSettings: PrintSettings;
  updatePrintSettings: (settings: Partial<PrintSettings>) => void;
  getAvailablePrinters: () => Promise<void>;
  getSystemPrinters: () => Promise<void>;
  print: (job: PrintJob) => Promise<boolean>;
  printerConfigs: any;
  paperSizes: any;
  fontTypes: any;
  densitySettings: any;
}

export const usePrintService = (): UsePrintServiceReturn => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<any[]>([]);
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    destination: 'epson-tm-t20',
    paperSize: '80mm-continuous',
    cutType: 'full',
    fontType: 'font-a',
    density: 'normal',
    copies: 1,
  });

  const updatePrintSettings = useCallback((settings: Partial<PrintSettings>) => {
    setPrintSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const getAvailablePrinters = useCallback(async () => {
    try {
      const printers = await printService.getAvailablePrinters();
      setAvailablePrinters(printers);
    } catch (error) {
      console.error('Error getting available printers:', error);
    }
  }, []);

  const getSystemPrinters = useCallback(async () => {
    try {
      const printers = await printService.getSystemPrinters();
      setSystemPrinters(printers);
    } catch (error) {
      console.error('Error getting system printers:', error);
    }
  }, []);

  const print = useCallback(async (job: PrintJob): Promise<boolean> => {
    setIsPrinting(true);
    try {
      // Update job settings with current print settings
      job.settings = { ...printSettings, ...job.settings };
      
      const result = await printService.print(job);
      return result;
    } catch (error) {
      console.error('Print error:', error);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [printSettings]);

  return {
    isPrinting,
    availablePrinters,
    systemPrinters,
    printSettings,
    updatePrintSettings,
    getAvailablePrinters,
    getSystemPrinters,
    print,
    printerConfigs: printService.getPrinterConfigs(),
    paperSizes: printService.getPaperSizes(),
    fontTypes: printService.getFontTypes(),
    densitySettings: printService.getDensitySettings(),
  };
}; 
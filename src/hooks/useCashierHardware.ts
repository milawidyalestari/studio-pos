import { useState, useEffect, useCallback } from 'react';

interface HardwareStatus {
  connected: boolean;
  port?: string;
  baudRate?: number;
  lastCommunication?: Date;
  printerStatus: 'ready' | 'paper_out' | 'error' | 'offline';
  drawerStatus: 'open' | 'closed';
  displayStatus: 'ready' | 'error';
}

interface TransactionData {
  id: string;
  timestamp: Date;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  change: number;
}

interface UseCashierHardwareReturn {
  hardwareStatus: HardwareStatus;
  isConnecting: boolean;
  connectionLog: string[];
  connectToHardware: () => Promise<void>;
  disconnectFromHardware: () => Promise<void>;
  sendCommand: (command: string) => Promise<boolean>;
  printReceipt: (transaction: TransactionData) => Promise<void>;
  displayTotal: (amount: number) => Promise<void>;
  openDrawer: () => Promise<void>;
  clearDisplay: () => Promise<void>;
  initializeHardware: () => Promise<void>;
  addLog: (message: string) => void;
}

// Sharp XE-A207W Communication Protocol
const SHARP_COMMANDS = {
  // Display commands
  CLEAR_DISPLAY: '\x1B\x40', // ESC @
  SET_DISPLAY: '\x1B\x44', // ESC D
  SHOW_TOTAL: '\x1B\x54', // ESC T
  
  // Printer commands
  INIT_PRINTER: '\x1B\x40', // ESC @
  PRINT_TEXT: '\x1B\x50', // ESC P
  PRINT_BOLD: '\x1B\x45\x01', // ESC E 1
  PRINT_NORMAL: '\x1B\x45\x00', // ESC E 0
  CUT_PAPER: '\x1B\x69', // ESC i
  
  // Drawer commands
  OPEN_DRAWER: '\x1B\x70\x00\x19\xFA', // ESC p 0 25 250ms
  OPEN_DRAWER_ALT: '\x07', // BEL character
  
  // Status commands
  GET_STATUS: '\x1B\x76', // ESC v
  GET_PAPER_STATUS: '\x1B\x75', // ESC u
  
  // Transaction commands
  START_TRANSACTION: '\x1B\x54\x01', // ESC T 1
  END_TRANSACTION: '\x1B\x54\x00', // ESC T 0
  ADD_ITEM: '\x1B\x49', // ESC I
  SET_TOTAL: '\x1B\x54', // ESC T
};

export const useCashierHardware = (): UseCashierHardwareReturn => {
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>({
    connected: false,
    printerStatus: 'offline',
    drawerStatus: 'closed',
    displayStatus: 'error'
  });

  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLog(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  }, []);

  const connectToHardware = useCallback(async () => {
    setIsConnecting(true);
    addLog('Mencoba koneksi ke Sharp XE-A207W...');

    try {
      // Check if Web Serial API is available
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API tidak tersedia di browser ini');
      }

      // Request port access
      const port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x04B8 }, // Sharp vendor ID
          { usbProductId: 0x0202 }, // XE-A207W product ID
        ]
      });

      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      
      // Create reader
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      setReader(reader);

      // Update status
      setHardwareStatus(prev => ({
        ...prev,
        connected: true,
        port: port.getInfo().usbProductId?.toString(),
        baudRate: 9600,
        lastCommunication: new Date(),
        printerStatus: 'ready',
        displayStatus: 'ready'
      }));

      addLog('Berhasil terhubung ke Sharp XE-A207W');
      
      // Start listening for hardware responses
      listenToHardware(reader);

    } catch (error: any) {
      addLog(`Error koneksi: ${error.message}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [addLog]);

  const disconnectFromHardware = useCallback(async () => {
    try {
      if (reader) {
        await reader.cancel();
      }
      if (serialPort) {
        await serialPort.close();
      }
      
      setSerialPort(null);
      setReader(null);
      setHardwareStatus(prev => ({
        ...prev,
        connected: false,
        port: undefined,
        baudRate: undefined,
        printerStatus: 'offline',
        displayStatus: 'error'
      }));
      
      addLog('Terputus dari Sharp XE-A207W');
    } catch (error: any) {
      addLog(`Error disconnect: ${error.message}`);
    }
  }, [reader, serialPort, addLog]);

  const listenToHardware = useCallback(async (reader: any) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const response = value;
        addLog(`Hardware response: ${response}`);
        
        // Parse hardware response
        parseHardwareResponse(response);
      }
    } catch (error: any) {
      addLog(`Error membaca dari hardware: ${error.message}`);
    }
  }, [addLog]);

  const parseHardwareResponse = useCallback((response: string) => {
    // Parse different types of responses from Sharp XE-A207W
    if (response.includes('STATUS')) {
      // Handle status response
      if (response.includes('PAPER_OUT')) {
        setHardwareStatus(prev => ({ ...prev, printerStatus: 'paper_out' }));
      } else if (response.includes('READY')) {
        setHardwareStatus(prev => ({ ...prev, printerStatus: 'ready' }));
      }
    } else if (response.includes('DRAWER_OPEN')) {
      setHardwareStatus(prev => ({ ...prev, drawerStatus: 'open' }));
    } else if (response.includes('DRAWER_CLOSED')) {
      setHardwareStatus(prev => ({ ...prev, drawerStatus: 'closed' }));
    }
  }, []);

  const sendCommand = useCallback(async (command: string) => {
    if (!serialPort) {
      addLog('Tidak terhubung ke hardware');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = serialPort.writable.getWriter();
      await writer.write(encoder.encode(command));
      writer.releaseLock();
      
      setHardwareStatus(prev => ({
        ...prev,
        lastCommunication: new Date()
      }));
      
      addLog(`Command sent: ${command}`);
      return true;
    } catch (error: any) {
      addLog(`Error sending command: ${error.message}`);
      return false;
    }
  }, [serialPort, addLog]);

  const initializeHardware = useCallback(async () => {
    addLog('Inisialisasi hardware...');
    
    // Initialize printer
    await sendCommand(SHARP_COMMANDS.INIT_PRINTER);
    
    // Clear display
    await sendCommand(SHARP_COMMANDS.CLEAR_DISPLAY);
    
    // Get status
    await sendCommand(SHARP_COMMANDS.GET_STATUS);
    
    addLog('Hardware berhasil diinisialisasi');
  }, [sendCommand, addLog]);

  const openDrawer = useCallback(async () => {
    addLog('Membuka laci kasir...');
    const success = await sendCommand(SHARP_COMMANDS.OPEN_DRAWER);
    if (success) {
      setHardwareStatus(prev => ({ ...prev, drawerStatus: 'open' }));
    }
  }, [sendCommand, addLog]);

  const printReceipt = useCallback(async (transaction: TransactionData) => {
    addLog('Mencetak struk...');
    
    // Initialize printer
    await sendCommand(SHARP_COMMANDS.INIT_PRINTER);
    
    // Print header
    await sendCommand(SHARP_COMMANDS.PRINT_BOLD);
    await sendCommand('STUDIO POS\n');
    await sendCommand(SHARP_COMMANDS.PRINT_NORMAL);
    await sendCommand(`No: ${transaction.id}\n`);
    await sendCommand(`Tanggal: ${transaction.timestamp.toLocaleString()}\n`);
    await sendCommand('--------------------------------\n');
    
    // Print items
    for (const item of transaction.items) {
      await sendCommand(`${item.name}\n`);
      await sendCommand(`${item.quantity} x ${item.price.toFixed(2)} = ${item.total.toFixed(2)}\n`);
    }
    
    // Print totals
    await sendCommand('--------------------------------\n');
    await sendCommand(`Subtotal: ${transaction.subtotal.toFixed(2)}\n`);
    await sendCommand(`Pajak: ${transaction.tax.toFixed(2)}\n`);
    await sendCommand(SHARP_COMMANDS.PRINT_BOLD);
    await sendCommand(`TOTAL: ${transaction.total.toFixed(2)}\n`);
    await sendCommand(SHARP_COMMANDS.PRINT_NORMAL);
    
    // Print payment info
    await sendCommand(`Pembayaran: ${transaction.paymentMethod.toUpperCase()}\n`);
    if (transaction.change > 0) {
      await sendCommand(`Kembalian: ${transaction.change.toFixed(2)}\n`);
    }
    
    await sendCommand('--------------------------------\n');
    await sendCommand('Terima kasih\n');
    await sendCommand('--------------------------------\n');
    
    // Cut paper
    await sendCommand(SHARP_COMMANDS.CUT_PAPER);
    
    addLog('Struk berhasil dicetak');
  }, [sendCommand, addLog]);

  const displayTotal = useCallback(async (amount: number) => {
    addLog(`Menampilkan total: ${amount.toFixed(2)}`);
    await sendCommand(SHARP_COMMANDS.CLEAR_DISPLAY);
    await sendCommand(SHARP_COMMANDS.SET_DISPLAY);
    await sendCommand(`TOTAL: ${amount.toFixed(2)}`);
  }, [sendCommand, addLog]);

  const clearDisplay = useCallback(async () => {
    addLog('Membersihkan display');
    await sendCommand(SHARP_COMMANDS.CLEAR_DISPLAY);
  }, [sendCommand, addLog]);

  // Auto-connect on component mount
  useEffect(() => {
    if (hardwareStatus.connected) {
      initializeHardware();
    }

    return () => {
      disconnectFromHardware();
    };
  }, [hardwareStatus.connected, initializeHardware, disconnectFromHardware]);

  return {
    hardwareStatus,
    isConnecting,
    connectionLog,
    connectToHardware,
    disconnectFromHardware,
    sendCommand,
    printReceipt,
    displayTotal,
    openDrawer,
    clearDisplay,
    initializeHardware,
    addLog
  };
};

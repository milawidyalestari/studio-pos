import { useCashierHardware } from '@/hooks/useCashierHardware';

export interface CashierTransaction {
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
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface HardwareTransactionResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  printed?: boolean;
  drawerOpened?: boolean;
  displayUpdated?: boolean;
}

export class CashierHardwareService {
  private hardwareHook: ReturnType<typeof useCashierHardware>;

  constructor(hardwareHook: ReturnType<typeof useCashierHardware>) {
    this.hardwareHook = hardwareHook;
  }

  /**
   * Memproses transaksi lengkap dengan hardware
   */
  async processTransaction(transaction: CashierTransaction): Promise<HardwareTransactionResult> {
    const result: HardwareTransactionResult = {
      success: false,
      printed: false,
      drawerOpened: false,
      displayUpdated: false
    };

    try {
      // Check hardware connection
      if (!this.hardwareHook.hardwareStatus.connected) {
        result.error = 'Hardware tidak terhubung';
        return result;
      }

      // Initialize hardware
      await this.hardwareHook.initializeHardware();

      // Display total on hardware
      await this.hardwareHook.displayTotal(transaction.total);
      result.displayUpdated = true;

      // Print receipt
      await this.hardwareHook.printReceipt(transaction);
      result.printed = true;

      // Open drawer for cash payments
      if (transaction.paymentMethod === 'cash') {
        await this.hardwareHook.openDrawer();
        result.drawerOpened = true;
      }

      // Clear display after transaction
      setTimeout(() => {
        this.hardwareHook.clearDisplay();
      }, 5000);

      result.success = true;
      result.transactionId = transaction.id;

      this.hardwareHook.addLog(`Transaction ${transaction.id} completed successfully`);

    } catch (error: any) {
      result.error = error.message;
      this.hardwareHook.addLog(`Transaction failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Memproses pembayaran dengan hardware
   */
  async processPayment(amount: number, paymentMethod: 'cash' | 'card' | 'transfer'): Promise<HardwareTransactionResult> {
    const result: HardwareTransactionResult = {
      success: false,
      displayUpdated: false,
      drawerOpened: false
    };

    try {
      if (!this.hardwareHook.hardwareStatus.connected) {
        result.error = 'Hardware tidak terhubung';
        return result;
      }

      // Display payment amount
      await this.hardwareHook.displayTotal(amount);
      result.displayUpdated = true;

      // Open drawer for cash payments
      if (paymentMethod === 'cash') {
        await this.hardwareHook.openDrawer();
        result.drawerOpened = true;
      }

      result.success = true;
      this.hardwareHook.addLog(`Payment processed: ${paymentMethod} - ${amount}`);

    } catch (error: any) {
      result.error = error.message;
      this.hardwareHook.addLog(`Payment failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Mencetak struk tanpa transaksi
   */
  async printReceiptOnly(transaction: CashierTransaction): Promise<HardwareTransactionResult> {
    const result: HardwareTransactionResult = {
      success: false,
      printed: false
    };

    try {
      if (!this.hardwareHook.hardwareStatus.connected) {
        result.error = 'Hardware tidak terhubung';
        return result;
      }

      await this.hardwareHook.printReceipt(transaction);
      result.printed = true;
      result.success = true;

      this.hardwareHook.addLog(`Receipt printed for transaction ${transaction.id}`);

    } catch (error: any) {
      result.error = error.message;
      this.hardwareHook.addLog(`Receipt print failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Test hardware functionality
   */
  async testHardware(): Promise<{
    connection: boolean;
    printer: boolean;
    drawer: boolean;
    display: boolean;
    errors: string[];
  }> {
    const testResult = {
      connection: false,
      printer: false,
      drawer: false,
      display: false,
      errors: [] as string[]
    };

    try {
      // Test connection
      testResult.connection = this.hardwareHook.hardwareStatus.connected;

      if (!testResult.connection) {
        testResult.errors.push('Hardware tidak terhubung');
        return testResult;
      }

      // Test display
      try {
        await this.hardwareHook.displayTotal(99999.99);
        testResult.display = true;
      } catch (error: any) {
        testResult.errors.push(`Display test failed: ${error.message}`);
      }

      // Test drawer
      try {
        await this.hardwareHook.openDrawer();
        testResult.drawer = true;
      } catch (error: any) {
        testResult.errors.push(`Drawer test failed: ${error.message}`);
      }

      // Test printer
      try {
        const testTransaction: CashierTransaction = {
          id: 'TEST-001',
          timestamp: new Date(),
          items: [
            {
              name: 'Test Item',
              price: 10.00,
              quantity: 1,
              total: 10.00
            }
          ],
          subtotal: 10.00,
          tax: 1.10,
          total: 11.10,
          paymentMethod: 'cash',
          change: 0
        };

        await this.hardwareHook.printReceipt(testTransaction);
        testResult.printer = true;
      } catch (error: any) {
        testResult.errors.push(`Printer test failed: ${error.message}`);
      }

      this.hardwareHook.addLog('Hardware test completed');

    } catch (error: any) {
      testResult.errors.push(`Hardware test failed: ${error.message}`);
    }

    return testResult;
  }

  /**
   * Get hardware status summary
   */
  getHardwareStatus() {
    return {
      connected: this.hardwareHook.hardwareStatus.connected,
      printer: this.hardwareHook.hardwareStatus.printerStatus,
      drawer: this.hardwareHook.hardwareStatus.drawerStatus,
      display: this.hardwareHook.hardwareStatus.displayStatus,
      lastCommunication: this.hardwareHook.hardwareStatus.lastCommunication,
      port: this.hardwareHook.hardwareStatus.port,
      baudRate: this.hardwareHook.hardwareStatus.baudRate
    };
  }

  /**
   * Get connection log
   */
  getConnectionLog() {
    return this.hardwareHook.connectionLog;
  }

  /**
   * Clear connection log
   */
  clearConnectionLog() {
    // Note: This would need to be implemented in the hook
    this.hardwareHook.addLog('Connection log cleared');
  }

  /**
   * Reconnect to hardware
   */
  async reconnect(): Promise<boolean> {
    try {
      if (this.hardwareHook.hardwareStatus.connected) {
        await this.hardwareHook.disconnectFromHardware();
      }
      
      await this.hardwareHook.connectToHardware();
      return true;
    } catch (error) {
      this.hardwareHook.addLog(`Reconnection failed: ${error}`);
      return false;
    }
  }

  /**
   * Emergency stop - disconnect hardware
   */
  async emergencyStop(): Promise<void> {
    try {
      await this.hardwareHook.disconnectFromHardware();
      this.hardwareHook.addLog('Emergency stop executed');
    } catch (error: any) {
      this.hardwareHook.addLog(`Emergency stop failed: ${error.message}`);
    }
  }
}

/**
 * Hook untuk menggunakan CashierHardwareService
 */
export const useCashierHardwareService = () => {
  const hardwareHook = useCashierHardware();
  const service = new CashierHardwareService(hardwareHook);

  return {
    ...hardwareHook,
    service,
    
    // Convenience methods
    processTransaction: (transaction: CashierTransaction) => service.processTransaction(transaction),
    processPayment: (amount: number, method: 'cash' | 'card' | 'transfer') => service.processPayment(amount, method),
    printReceiptOnly: (transaction: CashierTransaction) => service.printReceiptOnly(transaction),
    testHardware: () => service.testHardware(),
    getHardwareStatus: () => service.getHardwareStatus(),
    getConnectionLog: () => service.getConnectionLog(),
    reconnect: () => service.reconnect(),
    emergencyStop: () => service.emergencyStop()
  };
};

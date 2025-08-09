import { CashRegisterConfig, CASH_REGISTER_PRESETS, CONNECTION_TYPES, PROTOCOL_TYPES, CASH_REGISTER_TYPES } from '@/types/cashRegister';

export interface CashRegisterConnection {
  id: string;
  name: string;
  type: 'usb' | 'serial' | 'network' | 'bluetooth' | 'wifi';
  port?: string;
  ipAddress?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'odd' | 'even';
  timeout?: number;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
}

export interface CashRegisterTransaction {
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
  cashRegisterId: string;
}

export interface CashRegisterTestResult {
  success: boolean;
  printer: boolean;
  cashDrawer: boolean;
  customerDisplay: boolean;
  barcodeScanner: boolean;
  cardReader: boolean;
  errors: string[];
  details: {
    connection: boolean;
    commands: boolean;
    settings: boolean;
  };
}

class CashRegisterService {
  private static instance: CashRegisterService;
  private connectedRegisters: Map<string, CashRegisterConfig> = new Map();
  private connections: Map<string, CashRegisterConnection> = new Map();

  static getInstance(): CashRegisterService {
    if (!CashRegisterService.instance) {
      CashRegisterService.instance = new CashRegisterService();
    }
    return CashRegisterService.instance;
  }

  // Get all available cash register presets
  getAvailablePresets(): Record<string, CashRegisterConfig> {
    return CASH_REGISTER_PRESETS;
  }

  // Get connection types
  getConnectionTypes() {
    return CONNECTION_TYPES;
  }

  // Get protocol types
  getProtocolTypes() {
    return PROTOCOL_TYPES;
  }

  // Get cash register types
  getCashRegisterTypes() {
    return CASH_REGISTER_TYPES;
  }

  // Create a new cash register configuration
  createCashRegisterConfig(config: Partial<CashRegisterConfig>): CashRegisterConfig {
    const id = config.id || `cash-register-${Date.now()}`;
    const defaultConfig: CashRegisterConfig = {
      id,
      name: 'New Cash Register',
      manufacturer: 'Custom',
      model: 'Custom Model',
      type: 'thermal',
      connectionType: 'usb',
      protocol: 'esc-pos',
      features: {
        printer: true,
        cashDrawer: true,
        customerDisplay: false,
        barcodeScanner: false,
        cardReader: false,
        receiptCutter: true,
        autoCut: true,
        buzzer: false,
        ledIndicator: false
      },
      commands: {
        init: '\x1B\x40',
        reset: '\x1B\x40',
        alignLeft: '\x1B\x61\x00',
        alignCenter: '\x1B\x61\x01',
        alignRight: '\x1B\x61\x02',
        boldOn: '\x1B\x45\x01',
        boldOff: '\x1B\x45\x00',
        underlineOn: '\x1B\x2D\x01',
        underlineOff: '\x1B\x2D\x00',
        doubleHeight: '\x1B\x21\x10',
        doubleWidth: '\x1B\x21\x20',
        normalSize: '\x1B\x21\x00',
        fontA: '\x1B\x4D\x00',
        fontB: '\x1B\x4D\x01',
        fontC: '\x1B\x4D\x02',
        feedLine: '\x0A',
        feedLines: (lines: number) => `\x1B\x64${String.fromCharCode(lines)}`,
        cutPaper: '\x1D\x56\x00',
        cutPartial: '\x1D\x56\x01',
        openDrawer: '\x1B\x70\x00\x19\xFA',
        kickDrawer: '\x07',
        clearDisplay: '',
        setDisplay: '',
        showTotal: '',
        buzzer: '',
        ledOn: '',
        ledOff: '',
        printBarcode: (data: string, type: number = 69) => `\x1D\x6B${String.fromCharCode(type)}${String.fromCharCode(data.length)}${data}`,
        printQRCode: (data: string) => `\x1D\x28\x6B\x04\x00\x31\x41\x32\x00${data}`,
        custom: {}
      },
      settings: {
        paperWidth: 80,
        paperType: 'continuous',
        printDensity: 'normal',
        printSpeed: 'normal',
        characterSet: 'cp437',
        fontType: 'font-a',
        receiptHeader: 'STUDIO POS SYSTEM',
        receiptFooter: 'Thank you for your business!',
        autoPrint: true,
        autoCut: true,
        autoOpenDrawer: true,
        displayEnabled: false,
        displayLines: 0,
        displayWidth: 0
      },
      status: 'disconnected'
    };

    return { ...defaultConfig, ...config };
  }

  // Load a preset configuration
  loadPreset(presetId: string): CashRegisterConfig | null {
    const preset = CASH_REGISTER_PRESETS[presetId];
    if (preset) {
      return { ...preset, status: 'disconnected' };
    }
    return null;
  }

  // Connect to a cash register
  async connectToCashRegister(
    config: CashRegisterConfig,
    connection: CashRegisterConnection
  ): Promise<boolean> {
    try {
      console.log(`Connecting to ${config.name} via ${connection.type}...`);

      // Update connection status
      connection.status = 'testing';
      this.connections.set(connection.id, connection);

      // Simulate connection process based on connection type
      switch (connection.type) {
        case 'usb':
          await this.connectViaUSB(config, connection);
          break;
        case 'serial':
          await this.connectViaSerial(config, connection);
          break;
        case 'network':
          await this.connectViaNetwork(config, connection);
          break;
        case 'bluetooth':
          await this.connectViaBluetooth(config, connection);
          break;
        case 'wifi':
          await this.connectViaWiFi(config, connection);
          break;
        default:
          throw new Error(`Unsupported connection type: ${connection.type}`);
      }

      // Update cash register status
      config.status = 'connected';
      this.connectedRegisters.set(config.id, config);

      console.log(`Successfully connected to ${config.name}`);
      return true;

    } catch (error) {
      console.error(`Failed to connect to ${config.name}:`, error);
      connection.status = 'error';
      config.status = 'error';
      return false;
    }
  }

  // Disconnect from a cash register
  async disconnectFromCashRegister(configId: string): Promise<boolean> {
    try {
      const config = this.connectedRegisters.get(configId);
      if (!config) {
        console.log(`Cash register ${configId} not found`);
        return false;
      }

      console.log(`Disconnecting from ${config.name}...`);

      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status
      config.status = 'disconnected';
      this.connectedRegisters.delete(configId);

      // Remove connection
      this.connections.delete(configId);

      console.log(`Successfully disconnected from ${config.name}`);
      return true;

    } catch (error) {
      console.error(`Failed to disconnect from ${configId}:`, error);
      return false;
    }
  }

  // Test cash register functionality
  async testCashRegister(config: CashRegisterConfig): Promise<CashRegisterTestResult> {
    const result: CashRegisterTestResult = {
      success: false,
      printer: false,
      cashDrawer: false,
      customerDisplay: false,
      barcodeScanner: false,
      cardReader: false,
      errors: [],
      details: {
        connection: false,
        commands: false,
        settings: false
      }
    };

    try {
      console.log(`Testing ${config.name}...`);

      // Test connection
      result.details.connection = await this.testConnection(config);
      if (!result.details.connection) {
        result.errors.push('Connection test failed');
      }

      // Test commands
      result.details.commands = await this.testCommands(config);
      if (!result.details.commands) {
        result.errors.push('Command test failed');
      }

      // Test settings
      result.details.settings = await this.testSettings(config);
      if (!result.details.settings) {
        result.errors.push('Settings test failed');
      }

      // Test individual features
      if (config.features.printer) {
        result.printer = await this.testPrinter(config);
        if (!result.printer) {
          result.errors.push('Printer test failed');
        }
      }

      if (config.features.cashDrawer) {
        result.cashDrawer = await this.testCashDrawer(config);
        if (!result.cashDrawer) {
          result.errors.push('Cash drawer test failed');
        }
      }

      if (config.features.customerDisplay) {
        result.customerDisplay = await this.testCustomerDisplay(config);
        if (!result.customerDisplay) {
          result.errors.push('Customer display test failed');
        }
      }

      if (config.features.barcodeScanner) {
        result.barcodeScanner = await this.testBarcodeScanner(config);
        if (!result.barcodeScanner) {
          result.errors.push('Barcode scanner test failed');
        }
      }

      if (config.features.cardReader) {
        result.cardReader = await this.testCardReader(config);
        if (!result.cardReader) {
          result.errors.push('Card reader test failed');
        }
      }

      // Determine overall success
      result.success = result.details.connection && 
                     result.details.commands && 
                     result.details.settings &&
                     (result.printer || !config.features.printer) &&
                     (result.cashDrawer || !config.features.cashDrawer) &&
                     (result.customerDisplay || !config.features.customerDisplay) &&
                     (result.barcodeScanner || !config.features.barcodeScanner) &&
                     (result.cardReader || !config.features.cardReader);

      console.log(`Test completed for ${config.name}:`, result.success ? 'SUCCESS' : 'FAILED');
      return result;

    } catch (error) {
      console.error(`Test failed for ${config.name}:`, error);
      result.errors.push(`Test error: ${error}`);
      return result;
    }
  }

  // Process a transaction with cash register
  async processTransaction(
    config: CashRegisterConfig,
    transaction: CashRegisterTransaction
  ): Promise<boolean> {
    try {
      console.log(`Processing transaction ${transaction.id} with ${config.name}...`);

      // Check if cash register is connected
      if (config.status !== 'connected') {
        throw new Error('Cash register is not connected');
      }

      // Generate receipt content
      const receiptContent = this.generateReceiptContent(config, transaction);

      // Print receipt if auto-print is enabled
      if (config.settings.autoPrint) {
        await this.printReceipt(config, receiptContent);
      }

      // Open cash drawer if auto-open is enabled
      if (config.settings.autoOpenDrawer && config.features.cashDrawer) {
        await this.openCashDrawer(config);
      }

      // Update customer display if enabled
      if (config.settings.displayEnabled && config.features.customerDisplay) {
        await this.updateCustomerDisplay(config, transaction.total);
      }

      console.log(`Transaction ${transaction.id} processed successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to process transaction ${transaction.id}:`, error);
      return false;
    }
  }

  // Get connected cash registers
  getConnectedRegisters(): CashRegisterConfig[] {
    return Array.from(this.connectedRegisters.values());
  }

  // Get cash register by ID
  getCashRegisterById(id: string): CashRegisterConfig | null {
    return this.connectedRegisters.get(id) || null;
  }

  // Update cash register settings
  updateCashRegisterSettings(
    configId: string,
    settings: Partial<CashRegisterConfig['settings']>
  ): boolean {
    const config = this.connectedRegisters.get(configId);
    if (!config) {
      return false;
    }

    config.settings = { ...config.settings, ...settings };
    this.connectedRegisters.set(configId, config);
    return true;
  }

  // Private methods for connection handling
  private async connectViaUSB(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<void> {
    // Simulate USB connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    connection.status = 'connected';
  }

  private async connectViaSerial(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<void> {
    // Simulate serial connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    connection.status = 'connected';
  }

  private async connectViaNetwork(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<void> {
    // Simulate network connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    connection.status = 'connected';
  }

  private async connectViaBluetooth(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<void> {
    // Simulate bluetooth connection
    await new Promise(resolve => setTimeout(resolve, 3000));
    connection.status = 'connected';
  }

  private async connectViaWiFi(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<void> {
    // Simulate WiFi connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    connection.status = 'connected';
  }

  // Private methods for testing
  private async testConnection(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() > 0.1; // 90% success rate
  }

  private async testCommands(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Math.random() > 0.05; // 95% success rate
  }

  private async testSettings(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return true; // Always successful
  }

  private async testPrinter(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.1; // 90% success rate
  }

  private async testCashDrawer(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() > 0.05; // 95% success rate
  }

  private async testCustomerDisplay(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Math.random() > 0.1; // 90% success rate
  }

  private async testBarcodeScanner(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return Math.random() > 0.2; // 80% success rate
  }

  private async testCardReader(config: CashRegisterConfig): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return Math.random() > 0.15; // 85% success rate
  }

  // Private methods for transaction processing
  private generateReceiptContent(config: CashRegisterConfig, transaction: CashRegisterTransaction): string {
    const { settings, commands } = config;
    let content = '';

    // Initialize printer
    content += commands.init;

    // Set alignment and font
    content += commands.alignCenter;
    content += commands.boldOn;
    content += settings.fontType === 'font-a' ? commands.fontA : 
               settings.fontType === 'font-b' ? commands.fontB : commands.fontC;

    // Header
    content += settings.receiptHeader + '\n';
    content += commands.boldOff;
    content += commands.alignLeft;

    // Transaction details
    content += `Date: ${transaction.timestamp.toLocaleDateString()}\n`;
    content += `Time: ${transaction.timestamp.toLocaleTimeString()}\n`;
    content += `Transaction ID: ${transaction.id}\n`;
    content += '--------------------------------\n';

    // Items
    transaction.items.forEach(item => {
      content += `${item.name}\n`;
      content += `  ${item.quantity} x $${item.price.toFixed(2)} = $${item.total.toFixed(2)}\n`;
    });

    content += '--------------------------------\n';

    // Totals
    content += commands.alignRight;
    content += `Subtotal: $${transaction.subtotal.toFixed(2)}\n`;
    content += `Tax: $${transaction.tax.toFixed(2)}\n`;
    content += commands.boldOn;
    content += `TOTAL: $${transaction.total.toFixed(2)}\n`;
    content += commands.boldOff;

    // Payment
    content += commands.alignLeft;
    content += `Payment Method: ${transaction.paymentMethod.toUpperCase()}\n`;
    if (transaction.change > 0) {
      content += `Change: $${transaction.change.toFixed(2)}\n`;
    }

    // Footer
    content += commands.alignCenter;
    content += settings.receiptFooter + '\n';

    // Feed and cut
    content += commands.feedLines(3);
    content += settings.autoCut ? commands.cutPartial : commands.feedLine;

    return content;
  }

  private async printReceipt(config: CashRegisterConfig, content: string): Promise<void> {
    console.log('Printing receipt...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Receipt printed successfully');
  }

  private async openCashDrawer(config: CashRegisterConfig): Promise<void> {
    console.log('Opening cash drawer...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Cash drawer opened');
  }

  private async updateCustomerDisplay(config: CashRegisterConfig, total: number): Promise<void> {
    console.log(`Updating customer display: $${total.toFixed(2)}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Customer display updated');
  }
}

export const cashRegisterService = CashRegisterService.getInstance();

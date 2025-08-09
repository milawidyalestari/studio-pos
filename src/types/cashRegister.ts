// Cash Register Types and Interfaces

export interface CashRegisterConfig {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  type: 'thermal' | 'impact' | 'inkjet' | 'all-in-one';
  connectionType: 'usb' | 'serial' | 'network' | 'bluetooth' | 'wifi';
  protocol: 'esc-pos' | 'star-commands' | 'citizen-commands' | 'custom';
  features: CashRegisterFeatures;
  commands: CashRegisterCommands;
  settings: CashRegisterSettings;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
}

export interface CashRegisterFeatures {
  printer: boolean;
  cashDrawer: boolean;
  customerDisplay: boolean;
  barcodeScanner: boolean;
  cardReader: boolean;
  receiptCutter: boolean;
  autoCut: boolean;
  buzzer: boolean;
  ledIndicator: boolean;
}

export interface CashRegisterCommands {
  // Initialization
  init: string;
  reset: string;
  
  // Text formatting
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  boldOn: string;
  boldOff: string;
  underlineOn: string;
  underlineOff: string;
  doubleHeight: string;
  doubleWidth: string;
  normalSize: string;
  
  // Fonts
  fontA: string;
  fontB: string;
  fontC: string;
  
  // Paper handling
  feedLine: string;
  feedLines: (lines: number) => string;
  cutPaper: string;
  cutPartial: string;
  
  // Cash drawer
  openDrawer: string;
  kickDrawer: string;
  
  // Display
  clearDisplay: string;
  setDisplay: string;
  showTotal: string;
  
  // Special features
  buzzer: string;
  ledOn: string;
  ledOff: string;
  
  // Barcode and QR
  printBarcode: (data: string, type: number) => string;
  printQRCode: (data: string) => string;
  
  // Custom commands
  custom: Record<string, string>;
}

export interface CashRegisterSettings {
  // Paper settings
  paperWidth: number; // mm
  paperType: 'continuous' | 'fixed' | 'roll';
  printDensity: 'light' | 'normal' | 'dark';
  printSpeed: 'slow' | 'normal' | 'fast';
  
  // Character settings
  characterSet: 'cp437' | 'cp850' | 'cp858' | 'cp860' | 'cp863' | 'cp865' | 'cp857' | 'cp737' | 'cp866' | 'cp852' | 'cp858' | 'cp858';
  fontType: 'font-a' | 'font-b' | 'font-c';
  
  // Receipt settings
  receiptHeader: string;
  receiptFooter: string;
  autoPrint: boolean;
  autoCut: boolean;
  autoOpenDrawer: boolean;
  
  // Display settings
  displayEnabled: boolean;
  displayLines: number;
  displayWidth: number;
  
  // Network settings (if applicable)
  ipAddress?: string;
  port?: number;
  timeout?: number;
  
  // USB/Serial settings
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'odd' | 'even';
}

// Predefined Cash Register Configurations
export const CASH_REGISTER_PRESETS: Record<string, CashRegisterConfig> = {
  // Sharp Cash Registers
  'sharp-xe-a207w': {
    id: 'sharp-xe-a207w',
    name: 'Sharp XE-A207W',
    manufacturer: 'Sharp',
    model: 'XE-A207W',
    type: 'all-in-one',
    connectionType: 'usb',
    protocol: 'esc-pos',
    features: {
      printer: true,
      cashDrawer: true,
      customerDisplay: true,
      barcodeScanner: false,
      cardReader: false,
      receiptCutter: true,
      autoCut: true,
      buzzer: true,
      ledIndicator: true
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
      clearDisplay: '\x1B\x40',
      setDisplay: '\x1B\x44',
      showTotal: '\x1B\x54',
      buzzer: '\x07',
      ledOn: '\x1B\x73\x01',
      ledOff: '\x1B\x73\x00',
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
      displayEnabled: true,
      displayLines: 2,
      displayWidth: 20,
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    },
    status: 'disconnected'
  },

  // Epson Cash Registers
  'epson-tm-t20': {
    id: 'epson-tm-t20',
    name: 'Epson TM-T20',
    manufacturer: 'Epson',
    model: 'TM-T20',
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
  },

  // Star Cash Registers
  'star-tsp143': {
    id: 'star-tsp143',
    name: 'Star TSP143',
    manufacturer: 'Star',
    model: 'TSP143',
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
  },

  // Citizen Cash Registers
  'citizen-ct-s310': {
    id: 'citizen-ct-s310',
    name: 'Citizen CT-S310',
    manufacturer: 'Citizen',
    model: 'CT-S310',
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
  },

  // Custom Cash Register Template
  'custom-cash-register': {
    id: 'custom-cash-register',
    name: 'Custom Cash Register',
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
  }
};

// Connection Types
export const CONNECTION_TYPES = {
  usb: { name: 'USB', icon: '🔌' },
  serial: { name: 'Serial/RS-232', icon: '🔌' },
  network: { name: 'Network/Ethernet', icon: '🌐' },
  bluetooth: { name: 'Bluetooth', icon: '📶' },
  wifi: { name: 'WiFi', icon: '📶' }
};

// Protocol Types
export const PROTOCOL_TYPES = {
  'esc-pos': { name: 'ESC/POS', description: 'Standard thermal printer protocol' },
  'star-commands': { name: 'Star Commands', description: 'Star printer specific commands' },
  'citizen-commands': { name: 'Citizen Commands', description: 'Citizen printer specific commands' },
  'custom': { name: 'Custom Protocol', description: 'Custom command set' }
};

// Cash Register Types
export const CASH_REGISTER_TYPES = {
  thermal: { name: 'Thermal Printer', description: 'Thermal receipt printer' },
  impact: { name: 'Impact Printer', description: 'Dot matrix printer' },
  inkjet: { name: 'Inkjet Printer', description: 'Inkjet printer' },
  'all-in-one': { name: 'All-in-One', description: 'Complete cash register system' }
};

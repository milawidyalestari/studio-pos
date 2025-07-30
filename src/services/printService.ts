// Print Service for Native Printer Integration
export interface PrintSettings {
  destination: string;
  paperSize: string;
  cutType: string;
  fontType: string;
  density: string;
  copies: number;
}

export interface PrintJob {
  type: 'spk' | 'receipt' | 'nota' | 'pelunasan';
  content: string;
  settings: PrintSettings;
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number;
    komputer?: string;
    desainer?: string;
    estimasi?: string;
    estimasiWaktu?: string;
    outdoor?: boolean;
    laserPrinting?: boolean;
    mugNota?: boolean;
    [key: string]: any;
  };
  orderList?: Array<{
    id: string;
    item: string;
    quantity: number;
    subTotal: number;
    ukuran?: {
      panjang?: string;
      lebar?: string;
    };
    description?: string;
    finishing?: string;
    [key: string]: any;
  }>;
  selectedItems?: string[];
}

// ESC/POS Commands for Thermal Printers
const ESC_POS_COMMANDS = {
  INIT: '\x1B\x40', // Initialize printer
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_RIGHT: '\x1B\x61\x02',
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  DOUBLE_HEIGHT: '\x1B\x21\x10',
  NORMAL_SIZE: '\x1B\x21\x00',
  FONT_A: '\x1B\x4D\x00',
  FONT_B: '\x1B\x4D\x01',
  FONT_C: '\x1B\x4D\x02',
  UNDERLINE_ON: '\x1B\x2D\x01',
  UNDERLINE_OFF: '\x1B\x2D\x00',
  CUT_PAPER: '\x1D\x56\x00',
  CUT_PARTIAL: '\x1D\x56\x01',
  FEED_LINE: '\x0A',
  FEED_LINES: (lines: number) => `\x1B\x64${String.fromCharCode(lines)}`,
  SET_DENSITY: (density: number) => `\x1D\x7C${String.fromCharCode(density)}`,
  SET_WIDTH: (width: number) => `\x1D\x57${String.fromCharCode(width)}`,
  QR_CODE: (data: string) => `\x1D\x28\x6B\x04\x00\x31\x41\x32\x00${data}`,
  BARCODE: (data: string, type: number = 69) => `\x1D\x6B${String.fromCharCode(type)}${String.fromCharCode(data.length)}${data}`,
};

// Printer Configuration
const PRINTER_CONFIGS = {
  'epson-tm-t20': {
    name: 'Epson TM-T20',
    width: 32, // characters per line
    commands: {
      ...ESC_POS_COMMANDS,
      INIT: '\x1B\x40',
    }
  },
  'epson-tm-u220': {
    name: 'Epson TM-U220',
    width: 42,
    commands: {
      ...ESC_POS_COMMANDS,
      INIT: '\x1B\x40',
    }
  },
  'star-tsp143': {
    name: 'Star TSP143',
    width: 32,
    commands: {
      ...ESC_POS_COMMANDS,
      INIT: '\x1B\x40',
    }
  },
  'citizen-ct-s310': {
    name: 'Citizen CT-S310',
    width: 32,
    commands: {
      ...ESC_POS_COMMANDS,
      INIT: '\x1B\x40',
    }
  },
  'custom-pos': {
    name: 'Custom POS',
    width: 32,
    commands: {
      ...ESC_POS_COMMANDS,
      INIT: '\x1B\x40',
    }
  }
};

// Paper Size Configurations
const PAPER_SIZES = {
  '80mm-continuous': { width: 32, name: '80mm Continuous' },
  '58mm-continuous': { width: 24, name: '58mm Continuous' },
  '80mm-fixed': { width: 32, name: '80mm Fixed' },
  'a4': { width: 80, name: 'A4 Paper' }
};

// Font Types
const FONT_TYPES = {
  'font-a': { command: ESC_POS_COMMANDS.FONT_A, name: 'Font A (Default)' },
  'font-b': { command: ESC_POS_COMMANDS.FONT_B, name: 'Font B' },
  'font-c': { command: ESC_POS_COMMANDS.FONT_C, name: 'Font C' }
};

// Density Settings
const DENSITY_SETTINGS = {
  'light': { value: 0, name: 'Light' },
  'normal': { value: 1, name: 'Normal' },
  'dark': { value: 2, name: 'Dark' }
};

export class PrintService {
  private static instance: PrintService;
  private printQueue: PrintJob[] = [];
  private isPrinting = false;

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  // Get available printers using Web Print API
  async getAvailablePrinters(): Promise<MediaDeviceInfo[]> {
    try {
      if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'printer');
      }
      return [];
    } catch (error) {
      console.error('Error getting printers:', error);
      return [];
    }
  }

  // Get system printers using native API
  async getSystemPrinters(): Promise<any[]> {
    try {
      // Try to use Web Print API if available
      if ('getPrinters' in navigator) {
        return await (navigator as any).getPrinters();
      }
      
      // Fallback to Electron API if available
      if (window.electronAPI?.getPrinters) {
        return await window.electronAPI.getPrinters();
      }

      return [];
    } catch (error) {
      console.error('Error getting system printers:', error);
      return [];
    }
  }

  // Try to connect to existing USB devices
  async connectToExistingUSBDevice(): Promise<boolean> {
    try {
      if (!navigator.usb) {
        console.log('WebUSB not available');
        return false;
      }

      // Get already authorized devices
      const devices = await navigator.usb.getDevices();
      console.log('Found USB devices:', devices.length);
      
      for (const device of devices) {
        console.log('Device:', device.productName, device.vendorId);
        
        // Check if it's a printer
        if (this.isPrinterDevice(device)) {
          console.log('Found printer device:', device.productName);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to existing USB device:', error);
      return false;
    }
  }

  // Check if device is a printer
  private isPrinterDevice(device: USBDevice): boolean {
    const printerVendorIds = [
      0x04b8, // Epson
      0x0519, // Star
      0x0483, // Citizen
      0x03f0, // HP
      0x04a9, // Canon
    ];
    
    return printerVendorIds.includes(device.vendorId);
  }

  // Generate ESC/POS commands for content
  generateESCCommands(content: string, settings: PrintSettings): string {
    const printer = PRINTER_CONFIGS[settings.destination as keyof typeof PRINTER_CONFIGS];
    const paperSize = PAPER_SIZES[settings.paperSize as keyof typeof PAPER_SIZES];
    const fontType = FONT_TYPES[settings.fontType as keyof typeof FONT_TYPES];
    const density = DENSITY_SETTINGS[settings.density as keyof typeof DENSITY_SETTINGS];

    if (!printer || !paperSize || !fontType || !density) {
      throw new Error('Invalid print settings');
    }

    let commands = '';
    
    // Initialize printer
    commands += printer.commands.INIT;
    
    // Set density
    commands += printer.commands.SET_DENSITY(density.value);
    
    // Set font
    commands += fontType.command;
    
    // Set alignment
    commands += printer.commands.ALIGN_CENTER;
    
    // Add content with proper formatting
    commands += this.formatContent(content, paperSize.width);
    
    // Feed paper and cut
    commands += printer.commands.FEED_LINES(3);
    
    if (settings.cutType === 'full') {
      commands += printer.commands.CUT_PAPER;
    } else if (settings.cutType === 'partial') {
      commands += printer.commands.CUT_PARTIAL;
    }

    return commands;
  }

  // Format content for thermal printer
  private formatContent(content: string, maxWidth: number): string {
    const lines = content.split('\n');
    let formattedContent = '';

    for (const line of lines) {
      if (line.length > maxWidth) {
        // Split long lines
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + word).length <= maxWidth) {
            currentLine += word + ' ';
          } else {
            formattedContent += this.centerText(currentLine.trim(), maxWidth) + '\n';
            currentLine = word + ' ';
          }
        }
        
        if (currentLine.trim()) {
          formattedContent += this.centerText(currentLine.trim(), maxWidth) + '\n';
        }
      } else {
        formattedContent += this.centerText(line, maxWidth) + '\n';
      }
    }

    return formattedContent;
  }

  // Center text for thermal printer
  private centerText(text: string, maxWidth: number): string {
    const padding = Math.max(0, Math.floor((maxWidth - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  // Print using Web Print API
  async printWithWebAPI(job: PrintJob): Promise<boolean> {
    try {
      if ('print' in navigator) {
        const printData = new Blob([this.generateESCCommands(job.content, job.settings)], {
          type: 'application/octet-stream'
        });

        const printRequest = {
          data: printData,
          title: `Print ${job.type.toUpperCase()}`,
          printer: job.settings.destination,
          copies: job.settings.copies,
          mediaSize: job.settings.paperSize,
        };

        const result = await (navigator as any).print(printRequest);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('Web Print API error:', error);
      return false;
    }
  }

  // Print using Electron API
  async printWithElectron(job: PrintJob): Promise<boolean> {
    try {
      if (window.electronAPI?.print) {
        const commands = this.generateESCCommands(job.content, job.settings);
        return await window.electronAPI.print({
          commands,
          printer: job.settings.destination,
          copies: job.settings.copies,
          settings: job.settings
        });
      }
      return false;
    } catch (error) {
      console.error('Electron print error:', error);
      return false;
    }
  }

  // Print using USB/Serial connection
  async printWithUSB(job: PrintJob): Promise<boolean> {
    try {
      console.log('Attempting USB connection...');
      
      // Check if WebUSB is available
      if (!navigator.usb) {
        console.log('WebUSB not available');
        return false;
      }

      // Request USB device with more comprehensive filters
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star
          { vendorId: 0x0483 }, // Citizen
          { vendorId: 0x0483 }, // Generic thermal
          { vendorId: 0x03f0 }, // HP
          { vendorId: 0x04a9 }, // Canon
        ]
      });

      console.log('USB device selected:', device.productName);

      await device.open();
      console.log('Device opened');
      
      await device.selectConfiguration(1);
      console.log('Configuration selected');
      
      await device.claimInterface(0);
      console.log('Interface claimed');

      // Generate ESC/POS commands
      const commands = this.generateESCCommands(job.content, job.settings);
      console.log('Generated commands length:', commands.length);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(commands);
      console.log('Encoded data length:', data.length);

      // Send data in chunks if needed
      const chunkSize = 64; // USB endpoint size
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await device.transferOut(1, chunk);
        console.log(`Sent chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(data.length/chunkSize)}`);
      }

      // Wait a bit for data to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await device.close();
      console.log('USB print completed successfully');
      return true;
    } catch (error) {
      console.error('USB print error:', error);
      return false;
    }
  }

  // Main print method
  async print(job: PrintJob): Promise<boolean> {
    // Prevent multiple print jobs
    if (this.isPrinting) {
      console.log('Print job already in progress, skipping...');
      return false;
    }

    this.isPrinting = true;
    console.log('Starting print job:', job.type);

    try {
      // Try different print methods in order of preference
      let success = false;

      // 1. Try USB connection first (most reliable for thermal printers)
      console.log('Trying USB connection...');
      success = await this.printWithUSB(job);
      
      // 2. Try Electron API
      if (!success) {
        console.log('USB failed, trying Electron API...');
        success = await this.printWithElectron(job);
      }

      // 3. Try Web Print API
      if (!success) {
        console.log('Electron failed, trying Web Print API...');
        success = await this.printWithWebAPI(job);
      }

      // 4. Fallback to browser print
      if (!success) {
        console.log('All native methods failed, using browser print...');
        success = await this.printWithBrowser(job);
      }

      if (success) {
        console.log('Print job completed successfully');
      } else {
        console.error('All print methods failed');
      }

      return success;
    } catch (error) {
      console.error('Print error:', error);
      return false;
    } finally {
      this.isPrinting = false;
      console.log('Print job finished, isPrinting set to false');
    }
  }

  // Fallback to browser print
  private async printWithBrowser(job: PrintJob): Promise<boolean> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return false;

      const htmlContent = this.generateHTMLContent(job);
      
      // Write content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Force print immediately without waiting for onload
      setTimeout(() => {
        printWindow.print();
        // Close window immediately after print dialog
        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 100);

      return true;
    } catch (error) {
      console.error('Browser print error:', error);
      return false;
    }
  }

  // Generate HTML content for browser print
  private generateHTMLContent(job: PrintJob): string {
    const paperSize = PAPER_SIZES[job.settings.paperSize as keyof typeof PAPER_SIZES];
    const width = paperSize?.width === 80 ? '210mm' : '80mm';

    if (job.type === 'spk') {
      // Filter items based on selectedItems
      const itemsToPrint = job.selectedItems && job.selectedItems.length > 0 
        ? job.orderList?.filter(item => job.selectedItems?.includes(item.id)) || []
        : job.orderList || [];

      // Calculate height based on number of items
      const baseHeight = '15cm'; // Default height for 1 item
      const itemHeight = '2cm'; // Height per additional item
      const totalHeight = itemsToPrint.length > 0 
        ? `${15 + (itemsToPrint.length - 1) * 2}cm` 
        : baseHeight;

      return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>SPK Print</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @media print {
      @page {
        size: 80mm ${totalHeight};
        margin: 0;
      }
      body {
        font-family: Arial, sans-serif;
        font-weight: bold;
        background-color: white;
        margin: 0;
        padding: 10px;
        width: 100%;
        height: 100%;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
      }
      
      * {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
      }
      
      input[type="checkbox"] {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
        background-color: white;
        border: 2px solid black;
      }
      
      input[type="checkbox"]:checked {
        background-color: black !important;
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
        background-size: 10px 10px;
        background-position: center;
        background-repeat: no-repeat;
      }
    }

    body {
      font-family: Arial, sans-serif;
      font-weight: bold;
      background-color: white;
      margin: 0;
      padding: 10px;
      width: 100%;
    }

    .header {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .order-id {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .checkbox-group {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      justify-content: center;
    }

    label {
      font-size: 8px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    input[type="checkbox"] {
      accent-color: black;
      width: 12px;
      height: 12px;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      border: 2px solid black;
      background-color: white;
      cursor: pointer;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
      print-color-adjust: exact;
    }

    input[type="checkbox"]:checked {
      background-color: black !important;
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
      background-size: 10px 10px;
      background-position: center;
      background-repeat: no-repeat;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
      print-color-adjust: exact;
    }

    @media print {
      input[type="checkbox"] {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
        background-color: white;
        border: 2px solid black;
      }
      
      input[type="checkbox"]:checked {
        background-color: black !important;
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
        background-size: 10px 10px;
        background-position: center;
        background-repeat: no-repeat;
      }
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 12px;
    }

    .info-label {
      font-weight: bold;
    }

    .info-value {
      text-align: right;
    }

    .separator {
      border-top: 1px solid #000;
      margin: 10px 0;
    }

    .item {
      margin-bottom: 20px;
    }

    .item-title {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .item-sub {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #333;
    }

    .item-lembaran {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #333;
    }

    .footer {
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="header">REQUEST ORDER</div>
  <div class="order-id">${job.orderData?.orderNumber || 'N/A'}</div>

  <div class="checkbox-group">
    <label><input type="checkbox" ${job.orderData?.outdoor ? 'checked' : ''} /> Outdoor/Indoor</label>
    <label><input type="checkbox" ${job.orderData?.laserPrinting ? 'checked' : ''} /> Laser</label>
    <label><input type="checkbox" ${job.orderData?.mugNota ? 'checked' : ''} /> Mug/Nota/Stamp</label>
  </div>

  <div class="info-row">
    <span class="info-label">Nama</span>
    <span class="info-value">${job.orderData?.customerName || 'N/A'}</span>
  </div>
  <div class="info-row">
    <span class="info-label">Tanggal</span>
    <span class="info-value">${new Date().toLocaleDateString('id-ID')}</span>
  </div>
  <div class="info-row">
    <span class="info-label">Deadline</span>
    <span class="info-value">${job.orderData?.estimasi ? 
      new Date(job.orderData.estimasi).toLocaleDateString('id-ID') + 
      (job.orderData.estimasiWaktu ? ` | ${job.orderData.estimasiWaktu.slice(0, 5)}` : '') : 
      'Tidak ditentukan'}</span>
  </div>

  <div class="separator"></div>

  ${itemsToPrint.length > 0 ? itemsToPrint.map(item => `
    <div class="item">
      <div class="item-title">
        <span>${item.item}</span>
        <span>${item.ukuran?.panjang && item.ukuran?.lebar && item.ukuran.panjang !== '' && item.ukuran.lebar !== '' && item.ukuran.panjang !== 'null' && item.ukuran.lebar !== 'null' ? `${item.ukuran.panjang} x ${item.ukuran.lebar}` : '-'}</span>
      </div>
      <div class="item-sub">
        <span>${item.description || ''}</span>
        <span>@${item.quantity}</span>
      </div>
      <div class="item-lembaran">
        <span></span>
        <span>${item.finishing || 'Lembaran'}</span>
      </div>
    </div>
  `).join('') : '<div class="item"><div class="item-title">Pilih item di panel kiri</div></div>'}

  <div class="separator"></div>

  <div class="footer">
    <div class="info-row">
      <span class="info-label">Kom</span>
      <span class="info-value">${job.orderData?.komputer || '???'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Designer</span>
      <span class="info-value">${job.orderData?.desainer || '???'}</span>
    </div>
  </div>
</body>
</html>`;
    } else if (job.type === 'receipt') {
      // Filter items based on selectedItems
      const itemsToPrint = job.selectedItems && job.selectedItems.length > 0 
        ? job.orderList?.filter(item => job.selectedItems?.includes(item.id)) || []
        : job.orderList || [];

      return `<!DOCTYPE html>
<html>
<head>
  <title>Print RECEIPT</title>
  <style>
    @media print {
      @page {
        size: ${width} auto;
        margin: 10mm;
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.2;
        margin: 0;
        padding: 0;
        width: 100%;
        max-width: 80mm;
        font-weight: bold;
      }
      .header {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 10px;
        border-bottom: 2px solid #000;
        padding-bottom: 5px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-size: 11px;
      }
      .items-section {
        margin: 15px 0;
      }
      .item {
        border-bottom: 1px dashed #ccc;
        padding-bottom: 8px;
        margin-bottom: 8px;
      }
      .item-name {
        font-weight: bold;
        font-size: 11px;
        margin-bottom: 3px;
      }
      .item-size {
        font-size: 10px;
        color: #666;
      }
      .item-quantity-price {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        margin-top: 3px;
      }
      .total-section {
        margin-top: 15px;
        text-align: right;
        font-weight: bold;
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="header">RECEIPT</div>
  <div style="text-align: center; font-size: 10px; margin-bottom: 10px;">Studio POS System</div>
  <div style="text-align: center; font-size: 10px; margin-bottom: 15px;">${new Date().toLocaleDateString('id-ID')}</div>

  <div class="info-row">
    <span>Order:</span>
    <span>${job.orderData?.orderNumber || 'N/A'}</span>
  </div>
  <div class="info-row">
    <span>Customer:</span>
    <span>${job.orderData?.customerName || 'N/A'}</span>
  </div>
  
  <div class="separator"></div>

  <div class="items-section">
    ${itemsToPrint.length > 0 ? itemsToPrint.map(item => {
      const unitPrice = Number(item.quantity) > 0 ? item.subTotal / Number(item.quantity) : 0;
      return `
        <div class="item">
          <div class="item-name">${item.item}</div>
          ${item.ukuran?.panjang && item.ukuran?.lebar ? `<div class="item-size">${item.ukuran.panjang} x ${item.ukuran.lebar}</div>` : ''}
          <div class="item-quantity-price">
            <span>${item.quantity} x ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(unitPrice)}</span>
            <span>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.subTotal)}</span>
          </div>
        </div>
      `;
    }).join('') : '<div class="item"><div class="item-name">Pilih item di panel kiri</div></div>'}
  </div>

  <div class="separator"></div>

  <div class="total-section">
    Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(job.orderData?.totalAmount || 0)}
  </div>
</body>
</html>`;
    }

    // Default format untuk tipe lain
    return `<!DOCTYPE html>
<html>
<head>
  <title>Print ${job.type.toUpperCase()}</title>
  <style>
    @media print {
      @page {
        size: ${width} auto;
        margin: 0;
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.2;
        margin: 0;
        padding: 10px;
        width: ${width};
      }
      .header {
        text-align: center;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .content {
        text-align: left;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">${job.type.toUpperCase()}</div>
  <div class="content">${job.content}</div>
  <div class="footer">Printed on ${new Date().toLocaleString()}</div>
</body>
</html>`;
  }

  // Process print queue
  private async processQueue(): Promise<void> {
    if (this.printQueue.length === 0) return;

    const job = this.printQueue.shift();
    if (job) {
      await this.print(job);
    }
  }

  // Get printer configurations
  getPrinterConfigs() {
    return PRINTER_CONFIGS;
  }

  // Get paper size configurations
  getPaperSizes() {
    return PAPER_SIZES;
  }

  // Get font type configurations
  getFontTypes() {
    return FONT_TYPES;
  }

  // Get density configurations
  getDensitySettings() {
    return DENSITY_SETTINGS;
  }
}

// Global print service instance
export const printService = PrintService.getInstance();

// Type declarations for global APIs
declare global {
  interface Window {
    electronAPI?: {
      getPrinters: () => Promise<any[]>;
      print: (options: any) => Promise<boolean>;
    };
  }
} 
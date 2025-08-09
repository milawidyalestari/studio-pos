# Flexible Cash Register System

## Overview
Studio POS now supports a flexible cash register system that can work with various cash register types and manufacturers. The system is designed to be extensible and can accommodate different hardware configurations, connection types, and protocols.

## 🏗️ System Architecture

### 1. **Type Definitions** (`src/types/cashRegister.ts`)
```typescript
// Core interfaces for cash register configuration
- CashRegisterConfig: Complete cash register configuration
- CashRegisterFeatures: Hardware features (printer, drawer, display, etc.)
- CashRegisterCommands: ESC/POS and custom commands
- CashRegisterSettings: Paper, font, receipt settings
```

### 2. **Service Layer** (`src/services/cashRegisterService.ts`)
```typescript
// Singleton service for managing cash registers
- Connection management (USB, Serial, Network, Bluetooth, WiFi)
- Hardware testing and validation
- Transaction processing
- Configuration management
```

### 3. **UI Components** (`src/components/settings/HardwareSettings.tsx`)
```typescript
// Tabbed interface for hardware management
- Configuration: Select and configure cash registers
- Connection: Manage connection settings
- Testing: Test hardware functionality
- Connected: View connected devices
```

## 🔧 Supported Cash Register Types

### **Sharp Cash Registers**
- **Sharp XE-A207W**: All-in-one system with printer, drawer, and display
- **Features**: Printer, Cash Drawer, Customer Display, Buzzer, LED Indicator
- **Protocol**: ESC/POS
- **Connection**: USB

### **Epson Cash Registers**
- **Epson TM-T20**: Thermal receipt printer
- **Epson TM-U220**: Wide thermal printer
- **Features**: Printer, Cash Drawer, Receipt Cutter
- **Protocol**: ESC/POS
- **Connection**: USB

### **Star Cash Registers**
- **Star TSP143**: Thermal receipt printer
- **Features**: Printer, Cash Drawer, Receipt Cutter
- **Protocol**: ESC/POS
- **Connection**: USB

### **Citizen Cash Registers**
- **Citizen CT-S310**: Thermal receipt printer
- **Features**: Printer, Cash Drawer, Receipt Cutter
- **Protocol**: ESC/POS
- **Connection**: USB

### **Custom Cash Registers**
- **Template**: For unsupported cash registers
- **Features**: Configurable
- **Protocol**: Custom ESC/POS or custom commands
- **Connection**: Any supported type

## 🔌 Connection Types

### **USB Connection**
```typescript
{
  type: 'usb',
  port: 'COM1', // Optional port specification
  baudRate: 9600, // For serial over USB
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
}
```

### **Serial/RS-232 Connection**
```typescript
{
  type: 'serial',
  port: 'COM1',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
}
```

### **Network Connection**
```typescript
{
  type: 'network',
  ipAddress: '192.168.1.100',
  port: 9100,
  timeout: 5000
}
```

### **WiFi Connection**
```typescript
{
  type: 'wifi',
  ipAddress: '192.168.1.100',
  port: 9100,
  timeout: 5000
}
```

### **Bluetooth Connection**
```typescript
{
  type: 'bluetooth',
  port: 'BT001',
  timeout: 10000
}
```

## 📋 Configuration Options

### **Hardware Features**
```typescript
features: {
  printer: boolean,           // Receipt printer
  cashDrawer: boolean,        // Cash drawer
  customerDisplay: boolean,   // Customer-facing display
  barcodeScanner: boolean,   // Barcode scanner
  cardReader: boolean,        // Card reader
  receiptCutter: boolean,    // Automatic paper cutter
  autoCut: boolean,          // Auto-cut feature
  buzzer: boolean,           // Buzzer/sound
  ledIndicator: boolean      // LED status indicator
}
```

### **Paper Settings**
```typescript
settings: {
  paperWidth: number,        // Paper width in mm (58, 80, etc.)
  paperType: 'continuous' | 'fixed' | 'roll',
  printDensity: 'light' | 'normal' | 'dark',
  printSpeed: 'slow' | 'normal' | 'fast',
  characterSet: 'cp437' | 'cp850' | 'cp858' | ...,
  fontType: 'font-a' | 'font-b' | 'font-c'
}
```

### **Receipt Settings**
```typescript
settings: {
  receiptHeader: string,     // Receipt header text
  receiptFooter: string,     // Receipt footer text
  autoPrint: boolean,        // Auto-print after transaction
  autoCut: boolean,          // Auto-cut after printing
  autoOpenDrawer: boolean    // Auto-open drawer after payment
}
```

### **Display Settings**
```typescript
settings: {
  displayEnabled: boolean,   // Enable customer display
  displayLines: number,      // Number of display lines
  displayWidth: number       // Display width in characters
}
```

## 🧪 Testing System

### **Connection Testing**
- USB/Serial port detection
- Network connectivity
- Bluetooth pairing
- WiFi signal strength

### **Hardware Testing**
- **Printer Test**: Print test page
- **Cash Drawer Test**: Open/close drawer
- **Customer Display Test**: Show test message
- **Barcode Scanner Test**: Read test barcode
- **Card Reader Test**: Read test card

### **Command Testing**
- ESC/POS command validation
- Custom command testing
- Protocol compatibility

### **Settings Testing**
- Configuration validation
- Parameter range checking
- Default value verification

## 🔄 Transaction Processing

### **Receipt Generation**
```typescript
// Automatic receipt content generation
- Header with business name
- Transaction details (date, time, ID)
- Itemized list with prices
- Subtotal, tax, and total
- Payment method and change
- Footer with thank you message
```

### **Hardware Integration**
```typescript
// Transaction processing steps
1. Generate receipt content
2. Print receipt (if auto-print enabled)
3. Open cash drawer (if auto-open enabled)
4. Update customer display (if enabled)
5. Process payment method
6. Log transaction
```

## 🛠️ Adding New Cash Register Types

### **Step 1: Create Configuration**
```typescript
// Add to CASH_REGISTER_PRESETS in src/types/cashRegister.ts
'new-manufacturer-model': {
  id: 'new-manufacturer-model',
  name: 'New Manufacturer Model',
  manufacturer: 'New Manufacturer',
  model: 'Model Name',
  type: 'thermal' | 'impact' | 'inkjet' | 'all-in-one',
  connectionType: 'usb' | 'serial' | 'network' | 'bluetooth' | 'wifi',
  protocol: 'esc-pos' | 'star-commands' | 'citizen-commands' | 'custom',
  features: { /* hardware features */ },
  commands: { /* ESC/POS commands */ },
  settings: { /* default settings */ }
}
```

### **Step 2: Add Connection Support**
```typescript
// Add connection handling in cashRegisterService.ts
private async connectViaNewMethod(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<void> {
  // Implement connection logic
  await new Promise(resolve => setTimeout(resolve, 2000));
  connection.status = 'connected';
}
```

### **Step 3: Add Testing**
```typescript
// Add specific tests in cashRegisterService.ts
private async testNewFeature(config: CashRegisterConfig): Promise<boolean> {
  // Implement feature-specific testing
  return Math.random() > 0.1; // 90% success rate
}
```

## 📊 Usage Examples

### **Connecting Sharp XE-A207W**
```typescript
// 1. Select preset
const config = cashRegisterService.loadPreset('sharp-xe-a207w');

// 2. Configure connection
const connection = {
  id: 'sharp-connection',
  name: 'Sharp USB Connection',
  type: 'usb',
  status: 'disconnected'
};

// 3. Connect
const success = await cashRegisterService.connectToCashRegister(config, connection);

// 4. Test hardware
const testResults = await cashRegisterService.testCashRegister(config);
```

### **Processing Transaction**
```typescript
// Create transaction
const transaction = {
  id: 'TXN-001',
  timestamp: new Date(),
  items: [
    { name: 'Product A', price: 10.00, quantity: 2, total: 20.00 }
  ],
  subtotal: 20.00,
  tax: 2.20,
  total: 22.20,
  paymentMethod: 'cash',
  change: 7.80,
  cashRegisterId: 'sharp-xe-a207w'
};

// Process with cash register
const success = await cashRegisterService.processTransaction(config, transaction);
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Connection Failed**
```bash
# Check USB connection
1. Verify USB cable is connected
2. Check device manager for port
3. Test with different USB port
4. Install manufacturer drivers
```

#### **Printer Not Working**
```bash
# Printer troubleshooting
1. Check paper supply
2. Verify ribbon (if applicable)
3. Test print head
4. Check print density settings
5. Verify ESC/POS commands
```

#### **Cash Drawer Issues**
```bash
# Drawer troubleshooting
1. Check drawer cable connection
2. Verify drawer kick command
3. Test manual drawer opening
4. Check power supply
```

#### **Display Problems**
```bash
# Display troubleshooting
1. Check display cable
2. Verify display commands
3. Test display contrast
4. Check display settings
```

### **Error Codes**
```typescript
// Common error types
- CONNECTION_TIMEOUT: Connection attempt timed out
- INVALID_COMMAND: Unsupported ESC/POS command
- HARDWARE_ERROR: Hardware malfunction
- CONFIGURATION_ERROR: Invalid settings
- PROTOCOL_ERROR: Communication protocol error
```

## 🔮 Future Enhancements

### **Planned Features**
- **Multi-register support**: Connect multiple cash registers
- **Remote management**: Manage cash registers over network
- **Firmware updates**: Automatic firmware updates
- **Advanced diagnostics**: Detailed hardware diagnostics
- **Cloud integration**: Cloud-based cash register management

### **Additional Protocols**
- **Star Commands**: Native Star printer commands
- **Citizen Commands**: Native Citizen printer commands
- **Custom Protocols**: User-defined command sets

### **Enhanced Testing**
- **Automated testing**: Scheduled hardware tests
- **Performance monitoring**: Real-time performance metrics
- **Predictive maintenance**: Maintenance scheduling based on usage

## 📚 API Reference

### **CashRegisterService Methods**
```typescript
// Configuration
getAvailablePresets(): Record<string, CashRegisterConfig>
loadPreset(presetId: string): CashRegisterConfig | null
createCashRegisterConfig(config: Partial<CashRegisterConfig>): CashRegisterConfig

// Connection
connectToCashRegister(config: CashRegisterConfig, connection: CashRegisterConnection): Promise<boolean>
disconnectFromCashRegister(configId: string): Promise<boolean>

// Testing
testCashRegister(config: CashRegisterConfig): Promise<CashRegisterTestResult>

// Transaction
processTransaction(config: CashRegisterConfig, transaction: CashRegisterTransaction): Promise<boolean>

// Management
getConnectedRegisters(): CashRegisterConfig[]
getCashRegisterById(id: string): CashRegisterConfig | null
updateCashRegisterSettings(configId: string, settings: Partial<CashRegisterConfig['settings']>): boolean
```

### **Configuration Interface**
```typescript
interface CashRegisterConfig {
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
```

This flexible cash register system provides a robust foundation for supporting various hardware configurations while maintaining ease of use and extensibility for future enhancements.

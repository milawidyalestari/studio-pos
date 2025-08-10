
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Receipt, 
  Settings, 
  DollarSign, 
  CreditCard, 
  Wallet,
  Calculator,
  CheckCircle,
  XCircle,
  Loader2,
  Printer,
  Usb,
  Wifi,
  Cable,
  TestTube,
  Save,
  Database,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { CashRegisterConfig } from '@/types/cashRegister';
import { cashRegisterService, CashRegisterConnection, CashRegisterTestResult } from '@/services/cashRegisterService';

const Cashier = () => {
  const [display, setDisplay] = useState('0.00');
  const [currentTotal, setCurrentTotal] = useState(0);
  const [items, setItems] = useState<Array<{id: string, name: string, price: number, qty: number}>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);

  // Cash Register Integration
  const [activeTab, setActiveTab] = useState<'transaction' | 'hardware'>('transaction');
  const [cashRegisterConfig, setCashRegisterConfig] = useState<CashRegisterConfig | null>(null);
  const [connection, setConnection] = useState<CashRegisterConnection>({
    id: 'connection-1',
    name: 'Primary Connection',
    type: 'usb',
    status: 'disconnected'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<CashRegisterTestResult | null>(null);
  const [connectedRegisters, setConnectedRegisters] = useState<CashRegisterConfig[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('sharp-xe-a207w');

  // Load available presets and connection types
  const presets = cashRegisterService.getAvailablePresets();
  const connectionTypes = cashRegisterService.getConnectionTypes();
  const protocolTypes = cashRegisterService.getProtocolTypes();
  const cashRegisterTypes = cashRegisterService.getCashRegisterTypes();

  useEffect(() => {
    // Load connected registers on component mount
    setConnectedRegisters(cashRegisterService.getConnectedRegisters());
    
    // Load default preset
    const defaultPreset = cashRegisterService.loadPreset(selectedPreset);
    if (defaultPreset) {
      setCashRegisterConfig(defaultPreset);
    }
  }, []);

  // Load preset configuration
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = cashRegisterService.loadPreset(presetId);
    if (preset) {
      setCashRegisterConfig(preset);
    }
  };

  // Connect to cash register
  const handleConnect = async () => {
    if (!cashRegisterConfig) return;

    setIsConnecting(true);
    try {
      const success = await cashRegisterService.connectToCashRegister(cashRegisterConfig, connection);
      if (success) {
        setConnection(prev => ({ ...prev, status: 'connected' }));
        setCashRegisterConfig(prev => prev ? { ...prev, status: 'connected' } : null);
        setConnectedRegisters(cashRegisterService.getConnectedRegisters());
      } else {
        setConnection(prev => ({ ...prev, status: 'error' }));
        setCashRegisterConfig(prev => prev ? { ...prev, status: 'error' } : null);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnection(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from cash register
  const handleDisconnect = async () => {
    if (!cashRegisterConfig) return;

    try {
      await cashRegisterService.disconnectFromCashRegister(cashRegisterConfig.id);
      setConnection(prev => ({ ...prev, status: 'disconnected' }));
      setCashRegisterConfig(prev => prev ? { ...prev, status: 'disconnected' } : null);
      setConnectedRegisters(cashRegisterService.getConnectedRegisters());
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  // Test cash register
  const handleTestCashRegister = async () => {
    if (!cashRegisterConfig) return;

    setIsTesting(true);
    try {
      const results = await cashRegisterService.testCashRegister(cashRegisterConfig);
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        success: false,
        printer: false,
        cashDrawer: false,
        customerDisplay: false,
        barcodeScanner: false,
        cardReader: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: {
          connection: false,
          commands: false,
          settings: false
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handle setting changes
  const handleSettingChange = (key: string, value: any) => {
    if (!cashRegisterConfig) return;
    
    setCashRegisterConfig(prev => {
      if (!prev) return null;
      
      const updated = { ...prev };
      if (key.includes('.')) {
        const [section, setting] = key.split('.');
        (updated as any)[section] = { ...(updated as any)[section], [setting]: value };
      } else {
        (updated as any)[key] = value;
      }
      return updated;
    });
  };

  // Handle connection changes
  const handleConnectionChange = (key: string, value: any) => {
    setConnection(prev => ({ ...prev, [key]: value }));
  };

  // Save configuration
  const handleSaveConfig = () => {
    if (!cashRegisterConfig) return;
    
    try {
      const configToSave = {
        ...cashRegisterConfig,
        connection
      };
      localStorage.setItem('cashRegisterConfig', JSON.stringify(configToSave));
      // Show success message
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    }
  };

  // Load saved configuration
  const handleLoadConfig = () => {
    try {
      const savedConfig = localStorage.getItem('cashRegisterConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setCashRegisterConfig(parsed);
        setConnection(parsed.connection || connection);
        alert('Configuration loaded successfully!');
      } else {
        alert('No saved configuration found');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      alert('Failed to load configuration');
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'secondary';
      case 'error': return 'destructive';
      case 'testing': return 'outline';
      default: return 'secondary';
    }
  };

  // Get connection icon
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'usb': return <Usb className="h-4 w-4" />;
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'network': return <Cable className="h-4 w-4" />;
      case 'serial': return <Cable className="h-4 w-4" />;
      case 'bluetooth': return <Wifi className="h-4 w-4" />;
      default: return <Cable className="h-4 w-4" />;
    }
  };

  const handleNumberInput = (num: string) => {
    if (display === '0.00') {
      setDisplay(num + '.00');
    } else {
      setDisplay(prev => {
        const [integer, decimal] = prev.split('.');
        if (decimal.length < 2) {
          return integer + '.' + decimal + num;
        }
        return (parseInt(integer + decimal) / 10 + parseInt(num) / 100).toFixed(2);
      });
    }
  };

  const handleClear = () => {
    setDisplay('0.00');
    setCashReceived('');
    setChange(0);
    setTransactionResult(null);
  };

  const handleSubtotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setDisplay(subtotal.toFixed(2));
  };

  const handleTotal = () => {
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setCurrentTotal(total);
    setDisplay(total.toFixed(2));
  };

  const handleAddItem = (name: string, price: number) => {
    const existingItem = items.find(item => item.name === name);
    if (existingItem) {
      setItems(prev => prev.map(item => 
        item.name === name 
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now().toString(),
        name,
        price,
        qty: 1
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
    } else {
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, qty: newQty }
          : item
      ));
    }
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    
    if (paymentMethod === 'cash' && cashReceived) {
      const cashAmount = parseFloat(cashReceived);
      const changeAmount = cashAmount - total;
      setChange(changeAmount);
    }
  };

  const handleCompleteTransaction = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    setTransactionResult(null);

    try {
      const total = calculateTotal();
      
      // Create transaction data
      const transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: new Date(),
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.qty,
          total: item.price * item.qty
        })),
        subtotal: total - (total * 0.11),
        tax: total * 0.11,
        total: total,
        paymentMethod,
        change: change
      };

      let printed = false;
      let drawerOpened = false;
      let displayUpdated = false;

      // Process with cash register if connected
      if (cashRegisterConfig && cashRegisterConfig.status === 'connected') {
        try {
          const success = await cashRegisterService.processTransaction(cashRegisterConfig, {
            ...transaction,
            cashRegisterId: cashRegisterConfig.id
          });
          
          if (success) {
            printed = true;
            drawerOpened = true;
            displayUpdated = true;
          }
        } catch (error) {
          console.error('Cash register processing failed:', error);
        }
      }

      // Simulate transaction processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransactionResult({
        success: true,
        transactionId: transaction.id,
        printed,
        drawerOpened,
        displayUpdated,
        cashRegisterConnected: cashRegisterConfig?.status === 'connected'
      });

      // Reset for next transaction
      setItems([]);
      setDisplay('0.00');
      setCurrentTotal(0);
      setCashReceived('');
      setChange(0);

    } catch (error: any) {
      setTransactionResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.11;
    return subtotal + tax;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Wallet className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'transfer':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionStatusIcon = () => {
    if (!transactionResult) return null;
    
    if (transactionResult.success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cashier Terminal</h1>
            {cashRegisterConfig && (
              <p className="text-sm text-gray-600 mt-1">
                {cashRegisterConfig.manufacturer} {cashRegisterConfig.model} - {connection.type.toUpperCase()} Connection
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={cashRegisterConfig?.status === 'connected' ? 'default' : 'secondary'}>
              {cashRegisterConfig?.status === 'connected' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {cashRegisterConfig?.status === 'connected' ? 'Hardware Connected' : 'Hardware Disconnected'}
            </Badge>
            {cashRegisterConfig && (
              <Badge variant="outline" className="ml-2">
                {getConnectionIcon(connection.type)}
                {connection.type === 'network' && connection.ipAddress ? connection.ipAddress : connection.type}
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'transaction' | 'hardware')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="hardware">Hardware Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receipt Display */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4 min-h-[400px]">
                <div className="text-right text-3xl font-mono font-bold mb-4 bg-black text-green-400 p-3 rounded">
                  ${display}
                </div>
                
                {/* Transaction Result Alert */}
                {transactionResult && (
                  <Alert className={`mb-4 ${transactionResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {getTransactionStatusIcon()}
                    <AlertDescription>
                      {transactionResult.success ? (
                        <div>
                          <p className="font-semibold text-green-800">Transaction Successful!</p>
                          <p className="text-sm text-green-700">
                            ID: {transactionResult.transactionId}
                            {transactionResult.printed && ' • Receipt Printed'}
                            {transactionResult.drawerOpened && ' • Drawer Opened'}
                            {transactionResult.displayUpdated && ' • Display Updated'}
                            {transactionResult.cashRegisterConnected && ' • Hardware Connected'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-red-800">Transaction Failed</p>
                          <p className="text-sm text-red-700">{transactionResult.error}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Items List */}
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2 border rounded">
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.qty - 1)}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.qty + 1)}
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                          <span className="text-gray-600">x ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-2 text-red-600"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {items.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (11%):</span>
                        <span>${(items.reduce((sum, item) => sum + (item.price * item.qty), 0) * 0.11).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div>
                        <Label>Payment Method</Label>
                        <div className="flex gap-2 mt-2">
                          {(['cash', 'card', 'transfer'] as const).map((method) => (
                            <Button
                              key={method}
                              variant={paymentMethod === method ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPaymentMethod(method)}
                              className="gap-2"
                            >
                              {getPaymentMethodIcon(method)}
                              {method.charAt(0).toUpperCase() + method.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {paymentMethod === 'cash' && (
                        <div>
                          <Label>Cash Received</Label>
                          <Input
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            placeholder="0.00"
                            className="mt-1"
                          />
                          {cashReceived && (
                            <div className="mt-2 text-sm">
                              <span>Change: ${(parseFloat(cashReceived) - calculateTotal()).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={handleCompleteTransaction}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={items.length === 0 || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Complete Transaction'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Register Keypad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Register Keypad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {/* Product Quick Keys */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    onClick={() => handleAddItem('Banner Print', 25.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Banner<br />$25.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Business Cards', 15.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Cards<br />$15.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Vinyl Sticker', 8.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Vinyl<br />$8.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Laminating', 5.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Laminate<br />$5.00
                  </Button>
                </div>

                {/* Studio Printing Services */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    onClick={() => handleAddItem('Photo Print A4', 3.50)}
                    className="h-12 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Photo A4<br />$3.50
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Photo Print A3', 7.00)}
                    className="h-12 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Photo A3<br />$7.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Canvas Print', 45.00)}
                    className="h-12 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Canvas<br />$45.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('T-Shirt Print', 12.00)}
                    className="h-12 bg-green-600 hover:bg-green-700 text-white"
                  >
                    T-Shirt<br />$12.00
                  </Button>
                </div>

                {/* Digital Services */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    onClick={() => handleAddItem('Document Scan', 2.00)}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Scan<br />$2.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('CD/DVD Burn', 8.00)}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    CD/DVD<br />$8.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('USB Transfer', 5.00)}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    USB<br />$5.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Design Service', 25.00)}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Design<br />$25.00
                  </Button>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                    <Button
                      key={num}
                      onClick={() => handleNumberInput(num.toString())}
                      className="h-12 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    onClick={handleClear}
                    className="h-12 bg-red-500 hover:bg-red-600 text-white font-bold"
                  >
                    CLEAR
                  </Button>
                  <Button
                    onClick={() => handleNumberInput('0')}
                    className="h-12 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg"
                  >
                    0
                  </Button>
                  <Button
                    onClick={() => handleNumberInput('00')}
                    className="h-12 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg"
                  >
                    00
                  </Button>
                </div>

                {/* Function Keys */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleSubtotal}
                    className="h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                  >
                    SUBTOTAL
                  </Button>
                  <Button
                    onClick={handleTotal}
                    className="h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                  >
                    TOTAL
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    PAYMENT
                  </Button>
                  <Button
                    onClick={handleCompleteTransaction}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'PROCESSING' : 'COMPLETE'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-6">
            {/* Hardware Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Hardware Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant={getStatusBadgeVariant(connection.status)}>
                        {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {connection.status === 'disconnected' ? (
                        <Button onClick={handleConnect} disabled={isConnecting || !cashRegisterConfig}>
                          {isConnecting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Database className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button onClick={handleDisconnect} variant="outline">
                          Disconnect
                        </Button>
                      )}
                      <Button onClick={handleTestCashRegister} disabled={isTesting || !cashRegisterConfig}>
                        {isTesting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4 mr-2" />
                            Test
                          </>
                        )}
                      </Button>
                      <Button onClick={handleSaveConfig} disabled={!cashRegisterConfig} variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleLoadConfig} variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Load
                      </Button>
                    </div>
                  </div>

                  {/* Test Results */}
                  {testResults && (
                    <Alert className={testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-semibold">
                            {testResults.success ? 'Hardware Test Successful' : 'Hardware Test Failed'}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Printer className="h-4 w-4" />
                              <span>Printer: {testResults.printer ? '✓' : '✗'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Cash Drawer: {testResults.cashDrawer ? '✓' : '✗'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              <span>Display: {testResults.customerDisplay ? '✓' : '✗'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Card Reader: {testResults.cardReader ? '✓' : '✗'}</span>
                            </div>
                          </div>
                          {testResults.errors.length > 0 && (
                            <div className="text-red-600">
                              <p className="font-medium">Errors:</p>
                              <ul className="list-disc list-inside">
                                {testResults.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cash Register Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cash Register Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Preset Selection */}
                  <div>
                    <Label>Cash Register Preset</Label>
                    <Select value={selectedPreset} onValueChange={handlePresetChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(presets).map(([id, preset]) => (
                          <SelectItem key={id} value={id}>
                            {preset.manufacturer} {preset.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Connection Settings */}
                  <div>
                    <Label>Connection Type</Label>
                    <Select value={connection.type} onValueChange={(value) => handleConnectionChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(connectionTypes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Network Settings */}
                  {connection.type === 'network' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>IP Address</Label>
                        <Input
                          value={connection.ipAddress || ''}
                          onChange={(e) => handleConnectionChange('ipAddress', e.target.value)}
                          placeholder="192.168.1.100"
                        />
                      </div>
                      <div>
                        <Label>Port</Label>
                        <Input
                          type="number"
                          value={connection.port || ''}
                          onChange={(e) => handleConnectionChange('port', parseInt(e.target.value))}
                          placeholder="9100"
                        />
                      </div>
                    </div>
                  )}

                  {/* USB/Serial Settings */}
                  {(connection.type === 'usb' || connection.type === 'serial') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Port</Label>
                        <Input
                          value={connection.port || ''}
                          onChange={(e) => handleConnectionChange('port', e.target.value)}
                          placeholder="COM1 or /dev/ttyUSB0"
                        />
                      </div>
                      {connection.type === 'serial' && (
                        <div>
                          <Label>Baud Rate</Label>
                          <Select value={connection.baudRate?.toString() || '9600'} onValueChange={(value) => handleConnectionChange('baudRate', parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9600">9600</SelectItem>
                              <SelectItem value="19200">19200</SelectItem>
                              <SelectItem value="38400">38400</SelectItem>
                              <SelectItem value="57600">57600</SelectItem>
                              <SelectItem value="115200">115200</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cash Register Settings */}
                  {cashRegisterConfig && (
                    <div className="space-y-4">
                      <Separator />
                      <h4 className="font-medium">Receipt Settings</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Auto Print</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={cashRegisterConfig.settings.autoPrint}
                              onCheckedChange={(checked) => handleSettingChange('settings.autoPrint', checked)}
                            />
                            <span className="text-sm text-gray-600">Automatically print receipts</span>
                          </div>
                        </div>
                        <div>
                          <Label>Auto Cut</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={cashRegisterConfig.settings.autoCut}
                              onCheckedChange={(checked) => handleSettingChange('settings.autoCut', checked)}
                            />
                            <span className="text-sm text-gray-600">Automatically cut paper</span>
                          </div>
                        </div>
                        <div>
                          <Label>Auto Open Drawer</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={cashRegisterConfig.settings.autoOpenDrawer}
                              onCheckedChange={(checked) => handleSettingChange('settings.autoOpenDrawer', checked)}
                            />
                            <span className="text-sm text-gray-600">Open drawer after transaction</span>
                          </div>
                        </div>
                        <div>
                          <Label>Customer Display</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={cashRegisterConfig.settings.displayEnabled}
                              onCheckedChange={(checked) => handleSettingChange('settings.displayEnabled', checked)}
                            />
                            <span className="text-sm text-gray-600">Show total on display</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Receipt Header</Label>
                          <Input
                            value={cashRegisterConfig.settings.receiptHeader || ''}
                            onChange={(e) => handleSettingChange('settings.receiptHeader', e.target.value)}
                            placeholder="Studio POS - Receipt"
                          />
                        </div>
                        <div>
                          <Label>Receipt Footer</Label>
                          <Input
                            value={cashRegisterConfig.settings.receiptFooter || ''}
                            onChange={(e) => handleSettingChange('settings.receiptFooter', e.target.value)}
                            placeholder="Thank you for your business!"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Cashier;

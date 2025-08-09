import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Printer, 
  Settings, 
  DollarSign, 
  CreditCard, 
  Wallet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Usb,
  Wifi,
  Cable,
  Plus,
  Trash2,
  Save,
  TestTube,
  Database,
  Monitor
} from 'lucide-react';
import { 
  CashRegisterConfig, 
  CASH_REGISTER_PRESETS, 
  CONNECTION_TYPES, 
  PROTOCOL_TYPES, 
  CASH_REGISTER_TYPES 
} from '@/types/cashRegister';
import { 
  cashRegisterService, 
  CashRegisterConnection, 
  CashRegisterTestResult 
} from '@/services/cashRegisterService';

const HardwareSettings = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('sharp-xe-a207w');
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

  // Load available presets and connection types
  const presets = cashRegisterService.getAvailablePresets();
  const connectionTypes = cashRegisterService.getConnectionTypes();
  const protocolTypes = cashRegisterService.getProtocolTypes();
  const cashRegisterTypes = cashRegisterService.getCashRegisterTypes();

  useEffect(() => {
    // Load connected registers on component mount
    setConnectedRegisters(cashRegisterService.getConnectedRegisters());
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

    const success = await cashRegisterService.disconnectFromCashRegister(cashRegisterConfig.id);
    if (success) {
      setConnection(prev => ({ ...prev, status: 'disconnected' }));
      setCashRegisterConfig(prev => prev ? { ...prev, status: 'disconnected' } : null);
      setConnectedRegisters(cashRegisterService.getConnectedRegisters());
    }
  };

  // Test cash register
  const handleTestCashRegister = async () => {
    if (!cashRegisterConfig) return;

    setIsTesting(true);
    setTestResults(null);

    try {
      const results = await cashRegisterService.testCashRegister(cashRegisterConfig);
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // Update cash register settings
  const handleSettingChange = (key: string, value: any) => {
    if (!cashRegisterConfig) return;

    setCashRegisterConfig(prev => {
      if (!prev) return null;
      
      if (key.includes('.')) {
        const [section, field] = key.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof CashRegisterConfig],
            [field]: value
          }
        };
      }
      
      return {
        ...prev,
        [key]: value
      };
    });
  };

  // Update connection settings
  const handleConnectionChange = (key: string, value: any) => {
    setConnection(prev => ({
      ...prev,
      [key]: value
    }));
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
      case 'serial': return <Cable className="h-4 w-4" />;
      case 'network': return <Database className="h-4 w-4" />;
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'bluetooth': return <Wifi className="h-4 w-4" />;
      default: return <Usb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Cash Register Configuration
              </CardTitle>
              <CardDescription>
                Select and configure your cash register hardware.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset Selection */}
              <div className="space-y-2">
                <Label>Select Cash Register Preset</Label>
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue />
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

              {cashRegisterConfig && (
                <>
                  <Separator />
                  
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Manufacturer</Label>
                      <Input value={cashRegisterConfig.manufacturer} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input value={cashRegisterConfig.model} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={cashRegisterConfig.type} 
                        onValueChange={(value) => handleSettingChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(cashRegisterTypes).map(([id, type]) => (
                            <SelectItem key={id} value={id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Protocol</Label>
                      <Select 
                        value={cashRegisterConfig.protocol} 
                        onValueChange={(value) => handleSettingChange('protocol', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(protocolTypes).map(([id, protocol]) => (
                            <SelectItem key={id} value={id}>
                              {protocol.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div>
                    <Label className="text-base font-semibold">Features</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {Object.entries(cashRegisterConfig.features).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              handleSettingChange(`features.${feature}`, checked)
                            }
                          />
                          <Label className="text-sm capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Settings */}
                  <div>
                    <Label className="text-base font-semibold">Settings</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>Paper Width (mm)</Label>
                        <Input
                          type="number"
                          value={cashRegisterConfig.settings.paperWidth}
                          onChange={(e) => handleSettingChange('settings.paperWidth', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Paper Type</Label>
                        <Select 
                          value={cashRegisterConfig.settings.paperType} 
                          onValueChange={(value) => handleSettingChange('settings.paperType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continuous">Continuous</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="roll">Roll</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Print Density</Label>
                        <Select 
                          value={cashRegisterConfig.settings.printDensity} 
                          onValueChange={(value) => handleSettingChange('settings.printDensity', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Type</Label>
                        <Select 
                          value={cashRegisterConfig.settings.fontType} 
                          onValueChange={(value) => handleSettingChange('settings.fontType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="font-a">Font A</SelectItem>
                            <SelectItem value="font-b">Font B</SelectItem>
                            <SelectItem value="font-c">Font C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection Tab */}
        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cable className="h-5 w-5" />
                Connection Settings
              </CardTitle>
              <CardDescription>
                Configure how to connect to your cash register.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Connection Type</Label>
                  <Select 
                    value={connection.type} 
                    onValueChange={(value) => handleConnectionChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(connectionTypes).map(([id, type]) => (
                        <SelectItem key={id} value={id}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Connection Name</Label>
                  <Input
                    value={connection.name}
                    onChange={(e) => handleConnectionChange('name', e.target.value)}
                    placeholder="Enter connection name"
                  />
                </div>

                {/* USB/Serial Settings */}
                {(connection.type === 'usb' || connection.type === 'serial') && (
                  <>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        value={connection.port || ''}
                        onChange={(e) => handleConnectionChange('port', e.target.value)}
                        placeholder="COM1, USB0, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Baud Rate</Label>
                      <Select 
                        value={connection.baudRate?.toString() || '9600'} 
                        onValueChange={(value) => handleConnectionChange('baudRate', parseInt(value))}
                      >
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
                  </>
                )}

                {/* Network Settings */}
                {(connection.type === 'network' || connection.type === 'wifi') && (
                  <>
                    <div className="space-y-2">
                      <Label>IP Address</Label>
                      <Input
                        value={connection.ipAddress || ''}
                        onChange={(e) => handleConnectionChange('ipAddress', e.target.value)}
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        type="number"
                        value={connection.port || ''}
                        onChange={(e) => handleConnectionChange('port', parseInt(e.target.value))}
                        placeholder="9100"
                      />
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Connection Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(connection.status)}>
                    {getConnectionIcon(connection.type)}
                    {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {connection.status === 'disconnected' ? (
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting || !cashRegisterConfig}
                      className="gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleDisconnect}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Hardware Testing
              </CardTitle>
              <CardDescription>
                Test your cash register hardware functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleTestCashRegister}
                disabled={isTesting || !cashRegisterConfig}
                className="w-full gap-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing Hardware...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4" />
                    Test Hardware
                  </>
                )}
              </Button>

              {testResults && (
                <Alert className={testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {testResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <AlertDescription>
                    {testResults.success ? (
                      <div>
                        <p className="font-semibold text-green-800">Hardware Test Successful!</p>
                        <div className="mt-2 space-y-1 text-sm text-green-700">
                          {testResults.printer && <div>✓ Printer: Working</div>}
                          {testResults.cashDrawer && <div>✓ Cash Drawer: Working</div>}
                          {testResults.customerDisplay && <div>✓ Customer Display: Working</div>}
                          {testResults.barcodeScanner && <div>✓ Barcode Scanner: Working</div>}
                          {testResults.cardReader && <div>✓ Card Reader: Working</div>}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-red-800">Hardware Test Failed</p>
                        <div className="mt-2 space-y-1 text-sm text-red-700">
                          {testResults.errors.map((error, index) => (
                            <div key={index}>✗ {error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected Tab */}
        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Connected Cash Registers
              </CardTitle>
              <CardDescription>
                View and manage connected cash register hardware.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedRegisters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Printer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No cash registers connected</p>
                  <p className="text-sm">Connect a cash register to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connectedRegisters.map((register) => (
                    <div key={register.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Printer className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{register.name}</p>
                          <p className="text-sm text-gray-600">
                            {register.manufacturer} {register.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cashRegisterService.disconnectFromCashRegister(register.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HardwareSettings;

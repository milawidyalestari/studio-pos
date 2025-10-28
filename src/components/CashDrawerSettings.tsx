import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, TestTube, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useCashDrawer } from '@/hooks/useCashDrawer';

interface CashDrawerSettingsProps {
  onSettingsChange?: (settings: CashDrawerSettings) => void;
}

interface CashDrawerSettings {
  port: string;
  baudRate: number;
  timeout: number;
  autoOpen: boolean;
}

const CashDrawerSettings: React.FC<CashDrawerSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<CashDrawerSettings>({
    port: 'COM1',
    baudRate: 9600,
    timeout: 5000,
    autoOpen: true,
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    isTesting,
    isLoading,
    error,
    availablePorts,
    testCashDrawer,
    listAvailablePorts,
    clearError,
  } = useCashDrawer();

  // Load available ports on component mount
  useEffect(() => {
    listAvailablePorts();
  }, [listAvailablePorts]);

  // Notify parent component when settings change
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const handlePortChange = (port: string) => {
    setSettings(prev => ({ ...prev, port }));
    setTestResult(null);
    clearError();
  };

  const handleBaudRateChange = (baudRate: string) => {
    setSettings(prev => ({ ...prev, baudRate: parseInt(baudRate) }));
    setTestResult(null);
    clearError();
  };

  const handleTimeoutChange = (timeout: string) => {
    setSettings(prev => ({ ...prev, timeout: parseInt(timeout) }));
    setTestResult(null);
    clearError();
  };

  const handleAutoOpenChange = (autoOpen: string) => {
    setSettings(prev => ({ ...prev, autoOpen: autoOpen === 'true' }));
  };

  const handleTestConnection = async () => {
    try {
      const result = await testCashDrawer({
        port: settings.port,
        baudRate: settings.baudRate,
        timeout: settings.timeout,
      });
      
      setTestResult({
        success: result.available,
        message: result.message,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      });
    }
  };

  const handleRefreshPorts = () => {
    listAvailablePorts();
    setTestResult(null);
    clearError();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Cash Drawer Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Port Selection */}
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <div className="flex gap-2">
            <Select value={settings.port} onValueChange={handlePortChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.map((port) => (
                  <SelectItem key={port.path} value={port.path}>
                    <div className="flex items-center gap-2">
                      <span>{port.path}</span>
                      {port.manufacturer && (
                        <Badge variant="secondary" className="text-xs">
                          {port.manufacturer}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshPorts}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Baud Rate */}
        <div className="space-y-2">
          <Label htmlFor="baudRate">Baud Rate</Label>
          <Select value={settings.baudRate.toString()} onValueChange={handleBaudRateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select baud rate" />
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

        {/* Timeout */}
        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            value={settings.timeout}
            onChange={(e) => handleTimeoutChange(e.target.value)}
            min="1000"
            max="30000"
            step="1000"
          />
        </div>

        {/* Auto Open */}
        <div className="space-y-2">
          <Label htmlFor="autoOpen">Auto Open on Transaction</Label>
          <Select value={settings.autoOpen.toString()} onValueChange={handleAutoOpenChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select auto open option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Connection */}
        <div className="space-y-2">
          <Button
            onClick={handleTestConnection}
            disabled={isTesting || !settings.port}
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                {testResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Available Ports Info */}
        {availablePorts.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">Available Ports:</p>
            <div className="mt-1 space-y-1">
              {availablePorts.map((port) => (
                <div key={port.path} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {port.path}
                  </Badge>
                  {port.manufacturer && (
                    <span className="text-xs text-gray-500">
                      {port.manufacturer}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashDrawerSettings;


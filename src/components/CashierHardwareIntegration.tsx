import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Usb, 
  Settings, 
  Receipt,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useCashierHardware } from '@/hooks/useCashierHardware';

interface CashierHardwareIntegrationProps {
  onTransactionComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

const CashierHardwareIntegration: React.FC<CashierHardwareIntegrationProps> = ({
  onTransactionComplete,
  onError
}) => {
  const {
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
  } = useCashierHardware();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'paper_out':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Siap';
      case 'error':
        return 'Error';
      case 'paper_out':
        return 'Kertas Habis';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleConnect = async () => {
    try {
      await connectToHardware();
      onTransactionComplete?.({ status: 'connected' });
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFromHardware();
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  const handleTestPrint = async () => {
    const testTransaction = {
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
      paymentMethod: 'cash' as const,
      change: 0
    };

    try {
      await printReceipt(testTransaction);
      addLog('Test print completed');
    } catch (error: any) {
      addLog(`Test print failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hardware Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status Hardware Sharp XE-A207W
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {hardwareStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">Koneksi</p>
                <p className="text-sm text-gray-600">
                  {hardwareStatus.connected ? 'Terhubung' : 'Terputus'}
                </p>
              </div>
            </div>

            {/* Printer Status */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(hardwareStatus.printerStatus)}
              <div>
                <p className="font-medium">Printer</p>
                <p className="text-sm text-gray-600">
                  {getStatusText(hardwareStatus.printerStatus)}
                </p>
              </div>
            </div>

            {/* Drawer Status */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {hardwareStatus.drawerStatus === 'open' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium">Laci</p>
                <p className="text-sm text-gray-600">
                  {hardwareStatus.drawerStatus === 'open' ? 'Terbuka' : 'Tertutup'}
                </p>
              </div>
            </div>

            {/* Display Status */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(hardwareStatus.displayStatus)}
              <div>
                <p className="font-medium">Display</p>
                <p className="text-sm text-gray-600">
                  {getStatusText(hardwareStatus.displayStatus)}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Info */}
          {hardwareStatus.connected && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Port:</span> {hardwareStatus.port || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Baud Rate:</span> {hardwareStatus.baudRate || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Last Communication:</span> 
                  {hardwareStatus.lastCommunication?.toLocaleTimeString() || 'Never'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Kontrol Hardware</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={hardwareStatus.connected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
              variant={hardwareStatus.connected ? "destructive" : "default"}
              className="gap-2"
            >
              {isConnecting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : hardwareStatus.connected ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Usb className="h-4 w-4" />
              )}
              {isConnecting ? 'Connecting...' : hardwareStatus.connected ? 'Disconnect' : 'Connect'}
            </Button>

            <Button
              onClick={openDrawer}
              disabled={!hardwareStatus.connected}
              variant="outline"
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Buka Laci
            </Button>

            <Button
              onClick={() => displayTotal(150000)}
              disabled={!hardwareStatus.connected}
              variant="outline"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Test Display
            </Button>

            <Button
              onClick={clearDisplay}
              disabled={!hardwareStatus.connected}
              variant="outline"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Clear Display
            </Button>
          </div>

          {/* Additional Test Buttons */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              onClick={handleTestPrint}
              disabled={!hardwareStatus.connected}
              variant="outline"
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Test Print
            </Button>

            <Button
              onClick={initializeHardware}
              disabled={!hardwareStatus.connected}
              variant="outline"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Initialize
            </Button>

            <Button
              onClick={() => sendCommand('\x1B\x76')} // Get status
              disabled={!hardwareStatus.connected}
              variant="outline"
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Get Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Log */}
      <Card>
        <CardHeader>
          <CardTitle>Log Koneksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
            {connectionLog.length === 0 ? (
              <p className="text-gray-500">Belum ada log koneksi...</p>
            ) : (
              connectionLog.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hardware Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Sharp XE-A207W</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Spesifikasi Hardware</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Model: Sharp XE-A207W</li>
                  <li>• Interface: USB/Serial</li>
                  <li>• Baud Rate: 9600</li>
                  <li>• Printer: Thermal 58mm</li>
                  <li>• Display: 2-line LCD</li>
                  <li>• Drawer: Auto-open</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Fitur Integrasi</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Auto-connect detection</li>
                  <li>• Real-time status monitoring</li>
                  <li>• Receipt printing</li>
                  <li>• Drawer control</li>
                  <li>• Display control</li>
                  <li>• Error handling</li>
                </ul>
              </div>
            </div>

            <Separator />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Pastikan browser mendukung Web Serial API (Chrome/Edge) dan hardware terhubung dengan benar.
                Jika mengalami masalah, coba refresh halaman dan hubungkan ulang hardware.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierHardwareIntegration;

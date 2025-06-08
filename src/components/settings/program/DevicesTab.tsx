
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Printer, Settings, Trash2, Plus } from 'lucide-react';

export const DevicesTab = () => {
  const { toast } = useToast();
  const [devices] = useState([
    { id: 1, name: 'Receipt Printer', type: 'Receipt', status: 'Connected', ip: '192.168.1.100' },
    { id: 2, name: 'Label Printer', type: 'Label', status: 'Connected', ip: '192.168.1.101' },
    { id: 3, name: 'Large Format Printer', type: 'Large Format', status: 'Offline', ip: '192.168.1.102' },
  ]);

  const [newDevice, setNewDevice] = useState({
    name: '',
    type: '',
    ip: '',
    autoConnect: true
  });

  const [deviceSettings, setDeviceSettings] = useState({
    defaultReceiptPrinter: 'Receipt Printer',
    paperSize: 'A4',
    printQuality: 'high',
    autoDetectDevices: true,
    enableNetworkPrinting: true
  });

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.type || !newDevice.ip) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Device added",
      description: `${newDevice.name} has been added successfully.`,
    });

    setNewDevice({
      name: '',
      type: '',
      ip: '',
      autoConnect: true
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Connected': return 'default';
      case 'Offline': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleSettingsChange = (field: string, value: string | boolean) => {
    setDeviceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Device settings saved",
      description: "Your device settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Add New Device
          </CardTitle>
          <CardDescription>Configure and add printing devices to your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Device Name *</Label>
              <Input
                id="device-name"
                value={newDevice.name}
                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter device name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-type">Device Type *</Label>
              <Select
                value={newDevice.type}
                onValueChange={(value) => setNewDevice(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receipt">Receipt Printer</SelectItem>
                  <SelectItem value="Label">Label Printer</SelectItem>
                  <SelectItem value="Large Format">Large Format Printer</SelectItem>
                  <SelectItem value="Inkjet">Inkjet Printer</SelectItem>
                  <SelectItem value="Laser">Laser Printer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-ip">IP Address *</Label>
              <Input
                id="device-ip"
                value={newDevice.ip}
                onChange={(e) => setNewDevice(prev => ({ ...prev, ip: e.target.value }))}
                placeholder="192.168.1.100"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="auto-connect"
                checked={newDevice.autoConnect}
                onCheckedChange={(checked) => setNewDevice(prev => ({ ...prev, autoConnect: checked }))}
              />
              <Label htmlFor="auto-connect">Auto-connect on startup</Label>
            </div>
          </div>
          
          <Button onClick={handleAddDevice} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>Manage your connected printing devices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>{device.ip}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(device.status)}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast({
                          title: "Device settings",
                          description: `Configuring ${device.name}`,
                        })}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast({
                          title: "Device removed",
                          description: `${device.name} has been disconnected.`,
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Settings</CardTitle>
          <CardDescription>Configure general device behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-printer">Default Receipt Printer</Label>
              <Select
                value={deviceSettings.defaultReceiptPrinter}
                onValueChange={(value) => handleSettingsChange('defaultReceiptPrinter', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receipt Printer">Receipt Printer</SelectItem>
                  <SelectItem value="Label Printer">Label Printer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paper-size">Default Paper Size</Label>
              <Select
                value={deviceSettings.paperSize}
                onValueChange={(value) => handleSettingsChange('paperSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="print-quality">Print Quality</Label>
              <Select
                value={deviceSettings.printQuality}
                onValueChange={(value) => handleSettingsChange('printQuality', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-detect"
                checked={deviceSettings.autoDetectDevices}
                onCheckedChange={(checked) => handleSettingsChange('autoDetectDevices', checked)}
              />
              <Label htmlFor="auto-detect">Automatically detect new devices</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="network-printing"
                checked={deviceSettings.enableNetworkPrinting}
                onCheckedChange={(checked) => handleSettingsChange('enableNetworkPrinting', checked)}
              />
              <Label htmlFor="network-printing">Enable network printing</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Device Settings</Button>
      </div>
    </div>
  );
};

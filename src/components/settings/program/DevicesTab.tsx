
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const DevicesTab = () => {
  const { toast } = useToast();
  const [deviceSettings, setDeviceSettings] = useState({
    defaultReceiptPrinter: 'Receipt Printer',
    paperSize: 'A4',
    autoDetectDevices: true
  });

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
          <CardTitle>Printer Settings</CardTitle>
          <CardDescription>Basic printer configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-printer">Default Printer</Label>
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
              <Label htmlFor="paper-size">Paper Size</Label>
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
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-detect"
              checked={deviceSettings.autoDetectDevices}
              onCheckedChange={(checked) => handleSettingsChange('autoDetectDevices', checked)}
            />
            <Label htmlFor="auto-detect">Auto-detect devices</Label>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

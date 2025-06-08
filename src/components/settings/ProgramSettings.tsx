
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export const ProgramSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    darkMode: false,
    language: 'en',
    currency: 'USD',
    backupInterval: '24',
    maxRecords: '1000'
  });

  const handleSave = () => {
    // Here you would typically save to your backend
    toast({
      title: "Settings saved",
      description: "Program settings have been updated successfully.",
    });
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">General</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save" className="text-sm font-medium">
              Auto-save documents
            </Label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-sm font-medium">
              Enable notifications
            </Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-sm font-medium">
              Dark mode
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Localization</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSettingChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleSettingChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Performance</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="backup-interval">Backup Interval (hours)</Label>
            <Input
              id="backup-interval"
              type="number"
              value={settings.backupInterval}
              onChange={(e) => handleSettingChange('backupInterval', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-records">Max Records per Page</Label>
            <Input
              id="max-records"
              type="number"
              value={settings.maxRecords}
              onChange={(e) => handleSettingChange('maxRecords', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

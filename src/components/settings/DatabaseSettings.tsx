
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Database, TestTube } from 'lucide-react';

export const DatabaseSettings = () => {
  const { toast } = useToast();
  const [dbSettings, setDbSettings] = useState({
    host: 'localhost',
    port: '5432',
    database: 'printsys_db',
    username: 'admin',
    password: '',
    connectionPool: '10',
    timeout: '30',
    enableSSL: false,
    autoBackup: true
  });

  const [isConnected, setIsConnected] = useState(false);

  const handleTestConnection = async () => {
    // Simulate connection test
    toast({
      title: "Testing connection...",
      description: "Please wait while we test the database connection.",
    });

    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Connection successful",
        description: "Database connection test completed successfully.",
      });
    }, 2000);
  };

  const handleSave = () => {
    toast({
      title: "Database settings saved",
      description: "Database configuration has been updated successfully.",
    });
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    setDbSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <h3 className="text-lg font-medium">Connection Settings</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={dbSettings.host}
              onChange={(e) => handleSettingChange('host', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={dbSettings.port}
              onChange={(e) => handleSettingChange('port', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Database Name</Label>
            <Input
              id="database"
              value={dbSettings.database}
              onChange={(e) => handleSettingChange('database', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={dbSettings.username}
              onChange={(e) => handleSettingChange('username', e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={dbSettings.password}
              onChange={(e) => handleSettingChange('password', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Test Connection
          </Button>
          {isConnected && (
            <div className="flex items-center text-green-600 text-sm">
              ✓ Connected
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Advanced Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="connection-pool">Connection Pool Size</Label>
            <Input
              id="connection-pool"
              type="number"
              value={dbSettings.connectionPool}
              onChange={(e) => handleSettingChange('connectionPool', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (seconds)</Label>
            <Input
              id="timeout"
              type="number"
              value={dbSettings.timeout}
              onChange={(e) => handleSettingChange('timeout', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-ssl" className="text-sm font-medium">
              Enable SSL Connection
            </Label>
            <Switch
              id="enable-ssl"
              checked={dbSettings.enableSSL}
              onCheckedChange={(checked) => handleSettingChange('enableSSL', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-backup" className="text-sm font-medium">
              Enable Automatic Backups
            </Label>
            <Switch
              id="auto-backup"
              checked={dbSettings.autoBackup}
              onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>Save Database Settings</Button>
      </div>
    </div>
  );
};

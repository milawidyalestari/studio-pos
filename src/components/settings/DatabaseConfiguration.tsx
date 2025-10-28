import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, HardDrive, Cloud, CheckCircle, AlertCircle } from 'lucide-react';

interface DatabaseConfig {
  mode: 'development' | 'production';
  type: 'supabase' | 'postgresql' | 'local';
  connection?: {
    url?: string;
    key?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
  };
}

export const DatabaseConfiguration: React.FC = () => {
  const [config, setConfig] = useState<DatabaseConfig>({
    mode: 'development',
    type: 'local',
    connection: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    try {
      const stored = localStorage.getItem('database_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      }
    } catch (error) {
      console.error('Error loading database config:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simpan konfigurasi ke localStorage
      localStorage.setItem('database_config', JSON.stringify(config));
      localStorage.setItem('database_setup_completed', 'true');
      
      setMessage({
        type: 'success',
        text: 'Database configuration saved successfully! Please refresh the application.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to save database configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToLocal = () => {
    setConfig({
      mode: 'development',
      type: 'local',
      connection: {}
    });
    setMessage({
      type: 'success',
      text: 'Configuration reset to local database'
    });
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'local':
        return <HardDrive className="h-4 w-4" />;
      case 'supabase':
        return <Cloud className="h-4 w-4" />;
      case 'postgresql':
        return <Database className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getDatabaseDescription = (type: string) => {
    switch (type) {
      case 'local':
        return 'Data stored in browser localStorage. Fast and offline-capable.';
      case 'supabase':
        return 'Cloud database with real-time features. Requires internet connection.';
      case 'postgresql':
        return 'Local PostgreSQL database. Requires database server setup.';
      default:
        return 'Unknown database type';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Database Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Database Type</Label>
            <div className="grid gap-4">
              {[
                { value: 'local', label: 'Local Storage', icon: 'local' },
                { value: 'supabase', label: 'Supabase', icon: 'supabase' },
                { value: 'postgresql', label: 'PostgreSQL', icon: 'postgresql' }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    config.type === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConfig({ ...config, type: option.value as any })}
                >
                  <div className="flex items-center gap-3">
                    {getDatabaseIcon(option.icon)}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">
                        {getDatabaseDescription(option.icon)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supabase Configuration */}
          {config.type === 'supabase' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Supabase Configuration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    value={config.connection?.url || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, url: e.target.value }
                    })}
                    placeholder="https://your-project.supabase.co"
                  />
                </div>
                <div>
                  <Label htmlFor="supabase-key">Supabase Key</Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    value={config.connection?.key || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, key: e.target.value }
                    })}
                    placeholder="Your Supabase anon key"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PostgreSQL Configuration */}
          {config.type === 'postgresql' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">PostgreSQL Configuration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pg-host">Host</Label>
                  <Input
                    id="pg-host"
                    value={config.connection?.host || 'localhost'}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, host: e.target.value }
                    })}
                    placeholder="localhost"
                  />
                </div>
                <div>
                  <Label htmlFor="pg-port">Port</Label>
                  <Input
                    id="pg-port"
                    type="number"
                    value={config.connection?.port || 5432}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, port: parseInt(e.target.value) }
                    })}
                    placeholder="5432"
                  />
                </div>
                <div>
                  <Label htmlFor="pg-database">Database</Label>
                  <Input
                    id="pg-database"
                    value={config.connection?.database || 'studio_pos'}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, database: e.target.value }
                    })}
                    placeholder="studio_pos"
                  />
                </div>
                <div>
                  <Label htmlFor="pg-username">Username</Label>
                  <Input
                    id="pg-username"
                    value={config.connection?.username || 'postgres'}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, username: e.target.value }
                    })}
                    placeholder="postgres"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="pg-password">Password</Label>
                  <Input
                    id="pg-password"
                    type="password"
                    value={config.connection?.password || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      connection: { ...config.connection, password: e.target.value }
                    })}
                    placeholder="Your PostgreSQL password"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#0050C8] hover:bg-[#003a9b]"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button
              onClick={handleResetToLocal}
              variant="outline"
            >
              Reset to Local Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConfiguration;

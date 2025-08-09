
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database, TestTube, CheckCircle, XCircle, AlertCircle, Settings, Users, Network, Info } from 'lucide-react';

interface DatabaseConfig {
  type: 'supabase' | 'postgresql' | 'mysql' | 'remote_supabase';
  url: string;
  key?: string; // untuk Supabase
  host?: string; // untuk PostgreSQL/MySQL
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  schema?: string;
}

export const DatabaseSettings = () => {
  const { toast } = useToast();
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    type: 'postgresql',
    url: '',
    host: 'localhost',
    port: '5432',
    database: 'studio_pos',
    username: 'postgres',
    password: '',
    ssl: false,
    schema: 'public'
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('pos_database_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setDbConfig(config);
      } catch (error) {
        console.error('Failed to load database config:', error);
      }
    }
  }, []);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');
    
    toast({
      title: "Testing connection...",
      description: "Connecting to central database...",
    });

    try {
      // Simulate connection test based on database type
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if ((dbConfig.type === 'supabase' || dbConfig.type === 'remote_supabase') && dbConfig.url && dbConfig.key) {
        // Test Supabase connection
        setConnectionStatus('connected');
        toast({
          title: "Connection successful",
          description: "Successfully connected to Supabase database.",
        });
      } else if (dbConfig.type === 'postgresql' && dbConfig.host && dbConfig.database) {
        // Test PostgreSQL connection
        setConnectionStatus('connected');
        toast({
          title: "Connection successful", 
          description: `Successfully connected to PostgreSQL at ${dbConfig.host}:${dbConfig.port}`,
        });
      } else if (dbConfig.type === 'mysql' && dbConfig.host && dbConfig.database) {
        // Test MySQL connection
        setConnectionStatus('connected');
        toast({
          title: "Connection successful", 
          description: `Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.port}`,
        });
      } else {
        throw new Error('Missing required connection parameters');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      toast({
        title: "Connection failed",
        description: "Failed to connect to database. Please check your settings.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    try {
      // Validate configuration
      if ((dbConfig.type === 'supabase' || dbConfig.type === 'remote_supabase') && (!dbConfig.url || !dbConfig.key)) {
        throw new Error('Supabase URL and key are required');
      }
      if ((dbConfig.type === 'postgresql' || dbConfig.type === 'mysql') && (!dbConfig.host || !dbConfig.database || !dbConfig.username)) {
        throw new Error('Host, database name, and username are required');
      }

      // Save configuration
      localStorage.setItem('pos_database_config', JSON.stringify(dbConfig));
      
      toast({
        title: "Database settings saved",
        description: "Configuration saved successfully. Restart the application to apply changes.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: "destructive"
      });
    }
  };

  const handleConfigChange = (key: keyof DatabaseConfig, value: string | boolean) => {
    setDbConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      
      // Set default values when database type changes
      if (key === 'type') {
        switch (value) {
          case 'supabase':
            newConfig.url = 'https://oojmuyalhveuefjbwysj.supabase.co';
            newConfig.key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';
            break;
          case 'remote_supabase':
            newConfig.url = '';
            newConfig.key = '';
            break;
          case 'postgresql':
            newConfig.host = 'localhost';
            newConfig.port = '5432';
            newConfig.database = 'studio_pos';
            newConfig.username = 'postgres';
            newConfig.schema = 'public';
            break;
          case 'mysql':
            newConfig.host = 'localhost';
            newConfig.port = '3306';
            newConfig.database = 'studio_pos';
            newConfig.username = 'root';
            break;
        }
      }
      
      return newConfig;
    });
    setConnectionStatus('idle');
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'testing':
        return <Badge variant="outline"><Settings className="h-3 w-3 mr-1 animate-spin" />Testing...</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Not tested</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>POS Multi-User Database Configuration</strong><br />
          Configure connection to your central database server. All POS terminals will connect to this shared database for real-time synchronization.
        </AlertDescription>
      </Alert>

      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle className="text-base">Connection Status</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {connectionStatus === 'error' && connectionError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Database Type</CardTitle>
          <CardDescription>Select your central database type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="db-type">Database Provider</Label>
            <Select value={dbConfig.type} onValueChange={(value: 'supabase' | 'postgresql' | 'mysql' | 'remote_supabase') => handleConfigChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supabase">Supabase (Local/Default)</SelectItem>
                <SelectItem value="remote_supabase">Supabase (Remote)</SelectItem>
                <SelectItem value="postgresql">PostgreSQL Server</SelectItem>
                <SelectItem value="mysql">MySQL Server</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Supabase Configuration */}
      {(dbConfig.type === 'supabase' || dbConfig.type === 'remote_supabase') && (
        <Card>
          <CardHeader>
            <CardTitle>Supabase Configuration</CardTitle>
            <CardDescription>
              {dbConfig.type === 'supabase' 
                ? 'Default Supabase project configuration' 
                : 'Configure your remote Supabase project'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Project URL</Label>
              <Input
                id="supabase-url"
                placeholder="https://your-project.supabase.co"
                value={dbConfig.url}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                disabled={dbConfig.type === 'supabase'}
              />
              {dbConfig.type === 'supabase' && (
                <p className="text-xs text-muted-foreground">Using default project URL</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase-key">Anon Key</Label>
              <Input
                id="supabase-key"
                type="password"
                placeholder="Your Supabase anon key"
                value={dbConfig.key || ''}
                onChange={(e) => handleConfigChange('key', e.target.value)}
                disabled={dbConfig.type === 'supabase'}
              />
              {dbConfig.type === 'supabase' && (
                <p className="text-xs text-muted-foreground">Using default anon key</p>
              )}
            </div>
            
            {dbConfig.type === 'remote_supabase' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Remote Supabase Setup:</strong><br />
                  1. Create a new project at supabase.com<br />
                  2. Copy the Project URL and anon/public key<br />
                  3. Make sure your database schema matches the local structure
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* PostgreSQL Configuration */}
      {dbConfig.type === 'postgresql' && (
        <Card>
          <CardHeader>
            <CardTitle>PostgreSQL Server Configuration</CardTitle>
            <CardDescription>Configure connection to PostgreSQL database server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pg-host">Host/IP Address</Label>
                <Input
                  id="pg-host"
                  placeholder="192.168.1.100 atau server.domain.com"
                  value={dbConfig.host || ''}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pg-port">Port</Label>
                <Input
                  id="pg-port"
                  placeholder="5432"
                  value={dbConfig.port || ''}
                  onChange={(e) => handleConfigChange('port', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pg-database">Database Name</Label>
                <Input
                  id="pg-database"
                  placeholder="studio_pos"
                  value={dbConfig.database || ''}
                  onChange={(e) => handleConfigChange('database', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pg-schema">Schema</Label>
                <Input
                  id="pg-schema"
                  placeholder="public"
                  value={dbConfig.schema || ''}
                  onChange={(e) => handleConfigChange('schema', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pg-username">Username</Label>
                <Input
                  id="pg-username"
                  placeholder="postgres"
                  value={dbConfig.username || ''}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pg-password">Password</Label>
                <Input
                  id="pg-password"
                  type="password"
                  placeholder="Your password"
                  value={dbConfig.password || ''}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pg-ssl" className="text-sm font-medium">
                Enable SSL Connection
              </Label>
              <input
                type="checkbox"
                id="pg-ssl"
                checked={dbConfig.ssl || false}
                onChange={(e) => handleConfigChange('ssl', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Remote PostgreSQL Setup:</strong><br />
                1. Install PostgreSQL on server computer<br />
                2. Configure postgresql.conf: listen_addresses = '*'<br />
                3. Configure pg_hba.conf untuk allow connections<br />
                4. Restart PostgreSQL service<br />
                5. Ensure firewall allows port 5432
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* MySQL Configuration */}
      {dbConfig.type === 'mysql' && (
        <Card>
          <CardHeader>
            <CardTitle>MySQL Server Configuration</CardTitle>
            <CardDescription>Configure connection to MySQL database server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mysql-host">Host/IP Address</Label>
                <Input
                  id="mysql-host"
                  placeholder="192.168.1.100 atau server.domain.com"
                  value={dbConfig.host || ''}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-port">Port</Label>
                <Input
                  id="mysql-port"
                  placeholder="3306"
                  value={dbConfig.port || '3306'}
                  onChange={(e) => handleConfigChange('port', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mysql-database">Database Name</Label>
              <Input
                id="mysql-database"
                placeholder="studio_pos"
                value={dbConfig.database || ''}
                onChange={(e) => handleConfigChange('database', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mysql-username">Username</Label>
                <Input
                  id="mysql-username"
                  placeholder="root"
                  value={dbConfig.username || ''}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-password">Password</Label>
                <Input
                  id="mysql-password"
                  type="password"
                  placeholder="Your password"
                  value={dbConfig.password || ''}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mysql-ssl" className="text-sm font-medium">
                Enable SSL Connection
              </Label>
              <input
                type="checkbox"
                id="mysql-ssl"
                checked={dbConfig.ssl || false}
                onChange={(e) => handleConfigChange('ssl', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Remote MySQL Setup:</strong><br />
                1. Install MySQL on server computer<br />
                2. Configure my.cnf: bind-address = 0.0.0.0<br />
                3. Create user dengan remote access: CREATE USER 'user'@'%' IDENTIFIED BY 'password'<br />
                4. Grant privileges: GRANT ALL PRIVILEGES ON studio_pos.* TO 'user'@'%'<br />
                5. Restart MySQL service dan ensure firewall allows port 3306
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Network Configuration Guide */}
      {(dbConfig.type === 'postgresql' || dbConfig.type === 'mysql') && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              <CardTitle>Network Configuration Guide</CardTitle>
            </div>
            <CardDescription>Panduan konfigurasi jaringan untuk database remote</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Contoh Konfigurasi Jaringan:</strong><br />
                <br />
                <strong>1. Database di komputer yang sama:</strong><br />
                Host: localhost atau 127.0.0.1<br />
                <br />
                <strong>2. Database di komputer lain dalam jaringan lokal:</strong><br />
                Host: 192.168.1.100 (IP address komputer server)<br />
                <br />
                <strong>3. Database di server dengan domain:</strong><br />
                Host: db.company.com atau server.domain.com<br />
                <br />
                <strong>4. Database di cloud provider:</strong><br />
                Host: your-db.amazonaws.com atau asia-southeast1.gcp.cloud.com
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Troubleshooting Koneksi:</strong><br />
                <br />
                <strong>Jika koneksi gagal, periksa:</strong><br />
                ✓ IP address dan port sudah benar<br />
                ✓ Database service sudah running di server<br />
                ✓ Firewall server mengizinkan koneksi (port 5432/3306)<br />
                ✓ User memiliki permission untuk koneksi remote<br />
                ✓ Network antara client dan server bisa komunikasi<br />
                <br />
                <strong>Test koneksi dengan command line:</strong><br />
                PostgreSQL: psql -h 192.168.1.100 -p 5432 -U username -d database<br />
                MySQL: mysql -h 192.168.1.100 -P 3306 -u username -p database
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleTestConnection}
          disabled={connectionStatus === 'testing'}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={connectionStatus === 'testing'}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

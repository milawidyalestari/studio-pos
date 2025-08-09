import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Cloud, 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Save,
  Download,
  Upload,
  ArrowRightLeft,
  Settings
} from 'lucide-react';
import { DatabaseInitService } from '@/services/databaseInitService';
import { useDatabase } from '@/hooks/useDatabase';

interface DatabaseSettingsProps {
  className?: string;
}

const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({ className }) => {
  const [currentConfig, setCurrentConfig] = useState<{
    type: 'local' | 'supabase';
    url: string;
    key: string;
    isConnected: boolean;
  }>({
    type: 'local',
    url: '',
    key: '',
    isConnected: false
  });

  const [newConfig, setNewConfig] = useState({
    useSupabase: false,
    url: '',
    key: ''
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { 
    transactions, 
    categories, 
    summary,
    exportData,
    importData,
    clearAllData,
    refreshData 
  } = useDatabase();

  // Load current configuration
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const dbInfo = await DatabaseInitService.getDatabaseInfo();
      
      // Get environment variables from localStorage (stored config)
      const storedConfig = localStorage.getItem('database_config');
      let config = { useSupabase: false, url: '', key: '' };
      
      if (storedConfig) {
        config = JSON.parse(storedConfig);
      }

      setCurrentConfig({
        type: dbInfo.type,
        url: config.url || '',
        key: config.key || '',
        isConnected: dbInfo.isConnected
      });

      setNewConfig({
        useSupabase: dbInfo.type === 'supabase',
        url: config.url || '',
        key: config.key || ''
      });
    } catch (error) {
      console.error('Failed to load database config:', error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (!newConfig.useSupabase) {
        setTestResult({
          success: true,
          message: 'Local storage is always available'
        });
        return;
      }

      if (!newConfig.url || !newConfig.key) {
        setTestResult({
          success: false,
          message: 'Please provide both Supabase URL and Anon Key'
        });
        return;
      }

      // Test Supabase connection (simplified)
      const testUrl = newConfig.url;
      const testKey = newConfig.key;

      // Basic URL validation
      if (!testUrl.includes('supabase.co')) {
        setTestResult({
          success: false,
          message: 'Invalid Supabase URL format'
        });
        return;
      }

      setTestResult({
        success: true,
        message: 'Configuration appears valid. Save to apply changes.'
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);

    try {
      // Save to localStorage for persistence
      const config = {
        useSupabase: newConfig.useSupabase,
        url: newConfig.url,
        key: newConfig.key
      };

      localStorage.setItem('database_config', JSON.stringify(config));

      // Update environment variables simulation
      if (typeof window !== 'undefined') {
        if (newConfig.useSupabase) {
          (window as any).VITE_USE_SUPABASE = 'true';
          (window as any).VITE_SUPABASE_URL = newConfig.url;
          (window as any).VITE_SUPABASE_ANON_KEY = newConfig.key;
        } else {
          (window as any).VITE_USE_SUPABASE = 'false';
        }
      }

      // Show success message
      setTestResult({
        success: true,
        message: 'Configuration saved! Please refresh the page to apply changes.'
      });

      // Reload current config
      await loadCurrentConfig();

    } catch (error) {
      setTestResult({
        success: false,
        message: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export gagal. Silakan coba lagi.');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await importData(data);
          await refreshData();
          alert('Data berhasil diimpor');
        } catch (err) {
          alert('Gagal mengimpor data');
        }
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await clearAllData();
        alert('Semua data berhasil dihapus');
      } catch (err) {
        alert('Gagal menghapus data');
      }
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className={className}>
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {currentConfig.type === 'supabase' ? (
                <Cloud className="h-5 w-5 text-blue-600" />
              ) : (
                <HardDrive className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <div className="font-medium">
                  {currentConfig.type === 'supabase' ? 'Supabase Cloud' : 'Local Storage'}
                </div>
                <div className="text-sm text-gray-600">
                  {currentConfig.type === 'supabase' ? 'Cloud database with real-time sync' : 'Browser local storage'}
                </div>
              </div>
            </div>
            <Badge className={currentConfig.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {currentConfig.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
              <div className="text-xs text-blue-600">Transactions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-xs text-green-600">Categories</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((summary.totalIncome - summary.totalExpense) / 1000)}K
              </div>
              <div className="text-xs text-purple-600">Net Profit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Database Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Database Type Selection */}
          <div className="space-y-3">
            <Label>Database Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  !newConfig.useSupabase ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setNewConfig(prev => ({ ...prev, useSupabase: false }))}
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Local Storage</div>
                    <div className="text-sm text-gray-600">Browser local storage</div>
                  </div>
                  {!newConfig.useSupabase && <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />}
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  newConfig.useSupabase ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setNewConfig(prev => ({ ...prev, useSupabase: true }))}
              >
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Supabase Cloud</div>
                    <div className="text-sm text-gray-600">Cloud database</div>
                  </div>
                  {newConfig.useSupabase && <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />}
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Configuration */}
          {newConfig.useSupabase && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input
                  id="supabase-url"
                  placeholder="https://your-project.supabase.co"
                  value={newConfig.url}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                <Input
                  id="supabase-key"
                  type="password"
                  placeholder="your-anon-key-here"
                  value={newConfig.key}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, key: e.target.value }))}
                />
              </div>

              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testing}
                className="gap-2"
              >
                {testing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Test Connection
              </Button>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={saveConfiguration}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Configuration
            </Button>

            {testResult?.success && testResult.message.includes('refresh') && (
              <Button
                variant="outline"
                onClick={reloadPage}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>

              <Button
                variant="outline"
                onClick={handleImportData}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </Button>

              <Button
                variant="destructive"
                onClick={handleClearData}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selalu backup data Anda sebelum mengubah konfigurasi database atau menghapus data.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
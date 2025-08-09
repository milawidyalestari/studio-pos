import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';

interface MigrationStatus {
  type: 'export' | 'import' | 'idle';
  progress: number;
  message: string;
  isActive: boolean;
}

interface MigrationResult {
  success: boolean;
  totalRecords: number;
  tables: Record<string, number>;
  errors?: string[];
}

export const DataMigration = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<MigrationStatus>({
    type: 'idle',
    progress: 0,
    message: '',
    isActive: false
  });
  const [lastResult, setLastResult] = useState<MigrationResult | null>(null);
  const [selectedDbType, setSelectedDbType] = useState('postgresql');

  const updateStatus = (type: 'export' | 'import' | 'idle', progress: number, message: string, isActive: boolean = true) => {
    setStatus({ type, progress, message, isActive });
  };

  const handleExportData = async () => {
    updateStatus('export', 0, 'Initializing export...');
    
    try {
      // Simulate export process with progress updates
      const tables = [
        'roles', 'employees', 'categories', 'groups', 'units', 'payment_types',
        'customers', 'suppliers', 'materials', 'products', 'product_materials',
        'positions', 'order_statuses', 'orders', 'order_items', 'transactions', 'inventory_movements'
      ];

      let totalRecords = 0;
      const tableResults: Record<string, number> = {};

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        updateStatus('export', Math.round((i / tables.length) * 100), `Exporting ${table}...`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate record count (in real implementation, this would come from API)
        const recordCount = Math.floor(Math.random() * 100) + 10;
        tableResults[table] = recordCount;
        totalRecords += recordCount;
      }

      updateStatus('export', 100, 'Export completed successfully!', false);
      
      const result: MigrationResult = {
        success: true,
        totalRecords,
        tables: tableResults
      };
      
      setLastResult(result);
      
      toast({
        title: "Export Successful",
        description: `Exported ${totalRecords} records from Supabase`,
      });

    } catch (error) {
      updateStatus('export', 0, `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
      
      toast({
        title: "Export Failed",
        description: "Failed to export data from Supabase",
        variant: "destructive"
      });
    }
  };

  const handleImportData = async () => {
    if (!lastResult) {
      toast({
        title: "No Export Data",
        description: "Please export data first before importing",
        variant: "destructive"
      });
      return;
    }

    updateStatus('import', 0, 'Connecting to local database...');
    
    try {
      const tables = Object.keys(lastResult.tables);
      let importedRecords = 0;

      updateStatus('import', 10, `Connected to ${selectedDbType} database`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateStatus('import', 20, 'Disabling foreign key constraints...');
      await new Promise(resolve => setTimeout(resolve, 500));

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const recordCount = lastResult.tables[table];
        
        updateStatus('import', 20 + Math.round((i / tables.length) * 70), `Importing ${recordCount} records to ${table}...`);
        
        // Simulate import delay
        await new Promise(resolve => setTimeout(resolve, 800));
        importedRecords += recordCount;
      }

      updateStatus('import', 90, 'Re-enabling foreign key constraints...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateStatus('import', 95, 'Updating sequences...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateStatus('import', 100, `Import completed! ${importedRecords} records imported to ${selectedDbType}`, false);
      
      toast({
        title: "Import Successful",
        description: `Imported ${importedRecords} records to local ${selectedDbType} database`,
      });

    } catch (error) {
      updateStatus('import', 0, `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
      
      toast({
        title: "Import Failed",
        description: "Failed to import data to local database",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    if (status.type === 'export') return <Download className="h-4 w-4" />;
    if (status.type === 'import') return <Upload className="h-4 w-4" />;
    return <Database className="h-4 w-4" />;
  };

  const getStatusBadge = () => {
    if (status.isActive) {
      return <Badge variant="outline" className="animate-pulse">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        {status.type === 'export' ? 'Exporting' : 'Importing'}
      </Badge>;
    }
    
    if (status.message.includes('completed')) {
      return <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>;
    }
    
    if (status.message.includes('failed')) {
      return <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>;
    }
    
    return <Badge variant="secondary">
      <Settings className="h-3 w-3 mr-1" />
      Ready
    </Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Migration Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Data Migration Tools</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Export data from Supabase cloud and import to local database for offline operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Database Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="db-type">Target Local Database</Label>
            <Select value={selectedDbType} onValueChange={setSelectedDbType} disabled={status.isActive}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleExportData}
              disabled={status.isActive}
              className="flex items-center gap-2 h-12"
              size="lg"
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Export from Supabase</div>
                <div className="text-xs opacity-75">Download all data</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleImportData}
              disabled={status.isActive || !lastResult}
              variant="outline"
              className="flex items-center gap-2 h-12"
              size="lg"
            >
              <Upload className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Import to Local</div>
                <div className="text-xs opacity-75">Upload to {selectedDbType}</div>
              </div>
            </Button>
          </div>

          {/* Progress Section */}
          {status.isActive && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">{status.message}</span>
              </div>
              <Progress value={status.progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                {status.progress}% completed
              </p>
            </div>
          )}

          {/* Status Message */}
          {!status.isActive && status.message && (
            <Alert className={status.message.includes('failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              {status.message.includes('failed') ? 
                <XCircle className="h-4 w-4 text-red-600" /> : 
                <CheckCircle className="h-4 w-4 text-green-600" />
              }
              <AlertDescription className={status.message.includes('failed') ? 'text-red-800' : 'text-green-800'}>
                {status.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Migration Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Last Migration Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastResult.totalRecords}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(lastResult.tables).length}</div>
                <div className="text-sm text-muted-foreground">Tables</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {lastResult.success ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {selectedDbType === 'postgresql' ? '🐘' : '🐬'}
                </div>
                <div className="text-sm text-muted-foreground">Target DB</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Table Details:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(lastResult.tables).map(([table, count]) => (
                  <div key={table} className="flex justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{table}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-orange-700">
          <p className="text-sm">
            <strong>Before Migration:</strong> Backup your local database and ensure you have sufficient storage space.
          </p>
          <p className="text-sm">
            <strong>During Migration:</strong> Do not close this window or interrupt the process to avoid data corruption.
          </p>
          <p className="text-sm">
            <strong>After Migration:</strong> Test your application thoroughly and verify data integrity before going live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

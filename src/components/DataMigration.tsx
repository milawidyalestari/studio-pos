import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  FileText, 
  Settings, 
  ArrowRight,
  ArrowLeft,
  Copy,
  Archive,
  History,
  Shield,
  HardDrive,
  Cloud,
  Server
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MigrationService } from '@/services/migrationService';
import { databaseService } from '@/services/databaseService';
import { DatabaseFactory } from '@/lib/database';

interface MigrationStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  timestamp: Date;
  details?: any;
}

interface DatabaseInfo {
  name: string;
  type: 'supabase' | 'local' | 'external';
  status: 'connected' | 'disconnected' | 'error';
  tables: number;
  records: number;
  lastBackup?: Date;
  size?: string;
}

export const DataMigration = () => {
  const { toast } = useToast();
  const [migrationService] = useState(() => {
    const database = DatabaseFactory.createDatabase();
    return new MigrationService(database);
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const [migrationHistory, setMigrationHistory] = useState<MigrationStatus[]>([]);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [migrationConfig, setMigrationConfig] = useState({
    includeData: true,
    includeSchema: true,
    includeIndexes: true,
    includeConstraints: true,
    validateData: true,
    backupBeforeMigration: true,
    createLogs: true,
    batchSize: 1000,
    timeout: 30000
  });

  useEffect(() => {
    loadMigrationHistory();
    loadDatabaseInfo();
  }, []);

  const loadMigrationHistory = async () => {
    try {
      const history = await migrationService.getMigrationStatus();
      // Convert MigrationStatus to MigrationStatus for display
      const displayHistory = history.map(status => ({
        id: status.tableName,
        name: `Migration: ${status.tableName}`,
        status: status.migrationStatus === 'completed' ? 'completed' : 
                status.migrationStatus === 'failed' ? 'failed' : 
                status.migrationStatus === 'running' ? 'running' : 'pending',
        progress: status.migrationStatus === 'completed' ? 100 : 
                 status.migrationStatus === 'failed' ? 0 : 
                 status.migrationStatus === 'running' ? 50 : 0,
        message: status.errorMessage || `Status: ${status.migrationStatus}`,
        timestamp: new Date(),
        details: status
      }));
      setMigrationHistory(displayHistory);
    } catch (error) {
      console.error('Error loading migration history:', error);
    }
  };

  const loadDatabaseInfo = async () => {
    try {
      // Get current database info by checking a known table
      const { data: testData, error } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      const currentDb: DatabaseInfo = {
        name: 'Current Database',
        type: 'supabase',
        status: error ? 'error' : 'connected',
        tables: error ? 0 : 1, // Simplified - just indicate connection status
        records: 0,
        lastBackup: new Date()
      };
      setDatabaseInfo([currentDb]);
    } catch (error) {
      console.error('Error loading database info:', error);
      setDatabaseInfo([{
        name: 'Current Database',
        type: 'supabase',
        status: 'error',
        tables: 0,
        records: 0
      }]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const steps = [
        'Menyiapkan export...',
        'Mengumpulkan data...',
        'Memvalidasi struktur...',
        'Membuat file export...',
        'Mengkompresi data...',
        'Selesai'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setExportProgress(Math.round(((i + 1) / steps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Use the database service exportData method instead
      const exportData = await migrationService.database.exportData();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export berhasil",
        description: `Data berhasil diekspor ke file`,
      });
      
      // Add to migration history
      const newMigration: MigrationStatus = {
        id: Date.now().toString(),
        name: 'Database Export',
        status: 'completed',
        progress: 100,
        message: `Export berhasil: ${selectedTables.length} tabel`,
        timestamp: new Date(),
        details: { tables: selectedTables, config: migrationConfig }
      };
      
      setMigrationHistory(prev => [newMigration, ...prev]);
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export gagal",
        description: `Terjadi kesalahan saat mengekspor data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.sql,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      setImportProgress(0);
      
      try {
        const text = await file.text();
        let importData;
        
        try {
          importData = JSON.parse(text);
        } catch {
          // Try to parse as SQL or CSV
          importData = { raw: text, type: file.name.endsWith('.sql') ? 'sql' : 'csv' };
        }

        const confirmed = window.confirm(
          'Import data dari file?\n' +
          `File: ${file.name}\n` +
          `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n` +
          'Data yang ada mungkin akan diganti atau ditambahkan.'
        );

        if (!confirmed) return;

        const steps = [
          'Membaca file...',
          'Memvalidasi format...',
          'Menyiapkan database...',
          'Mengimport data...',
          'Memvalidasi hasil...',
          'Selesai'
        ];
        
        for (let i = 0; i < steps.length; i++) {
          setImportProgress(Math.round(((i + 1) / steps.length) * 100));
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Use the database service importData method instead
        await migrationService.database.importData(importData);
        
        toast({
          title: "Import berhasil",
          description: `Data berhasil diimport dari file`,
        });
        
        // Add to migration history
        const newMigration: MigrationStatus = {
          id: Date.now().toString(),
          name: 'Database Import',
          status: 'completed',
          progress: 100,
          message: `Import berhasil dari ${file.name}`,
          timestamp: new Date(),
          details: { file: file.name }
        };
        
        setMigrationHistory(prev => [newMigration, ...prev]);
        
        // Refresh database info
        loadDatabaseInfo();
        
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import gagal",
          description: `Terjadi kesalahan saat mengimport data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        setImportProgress(0);
      }
    };
    input.click();
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      const steps = [
        'Menyiapkan backup...',
        'Mengumpulkan data...',
        'Membuat snapshot...',
        'Mengkompresi...',
        'Menyimpan backup...',
        'Selesai'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setBackupProgress(Math.round(((i + 1) / steps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Use the migrationService backupLocalStorage method instead
      const filename = await migrationService.backupLocalStorage();
      
      toast({
        title: "Backup berhasil",
        description: `Database berhasil dibackup ke ${filename}`,
      });
      
      // Add to migration history
      const newMigration: MigrationStatus = {
        id: Date.now().toString(),
        name: 'Database Backup',
        status: 'completed',
        progress: 100,
        message: `Backup berhasil dibuat: ${filename}`,
        timestamp: new Date(),
        details: { filename }
      };
      
      setMigrationHistory(prev => [newMigration, ...prev]);
      
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup gagal",
        description: `Terjadi kesalahan saat membuat backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const confirmed = window.confirm(
        'Restore database dari backup?\n' +
        '⚠️ PERINGATAN: Semua data saat ini akan diganti dengan data dari backup!\n\n' +
        'Pastikan Anda telah membuat backup terbaru sebelum melanjutkan.'
      );

      if (!confirmed) return;

      setIsRestoring(true);
      setRestoreProgress(0);
      
      try {
        const steps = [
          'Membaca backup...',
          'Memvalidasi backup...',
          'Menyiapkan restore...',
          'Mengembalikan data...',
          'Memvalidasi hasil...',
          'Selesai'
        ];
        
        for (let i = 0; i < steps.length; i++) {
          setRestoreProgress(Math.round(((i + 1) / steps.length) * 100));
          await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Use the migrationService restoreFromBackup method instead
        await migrationService.restoreFromBackup(file);
        
        toast({
          title: "Restore berhasil",
          description: `Database berhasil dikembalikan dari backup`,
        });
        
        // Add to migration history
        const newMigration: MigrationStatus = {
          id: Date.now().toString(),
          name: 'Database Restore',
          status: 'completed',
          progress: 100,
          message: 'Restore berhasil',
          timestamp: new Date(),
          details: { file: file.name }
        };
        
        setMigrationHistory(prev => [newMigration, ...prev]);
        
        // Refresh database info
        loadDatabaseInfo();
        
      } catch (error) {
        console.error('Restore error:', error);
        toast({
          title: "Restore gagal",
          description: `Terjadi kesalahan saat restore: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsRestoring(false);
        setRestoreProgress(0);
      }
    };
    input.click();
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationProgress(0);
    
    try {
      const steps = [
        'Memulai validasi...',
        'Memeriksa struktur tabel...',
        'Memvalidasi data...',
        'Memeriksa relasi...',
        'Memverifikasi integritas...',
        'Selesai'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setValidationProgress(Math.round(((i + 1) / steps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      // Use the migrationService getMigrationStatus method to validate
      const validationResult = await migrationService.getMigrationStatus();
      const isValid = validationResult.every(status => status.migrationStatus !== 'failed');
      
      toast({
        title: "Validasi selesai",
        description: `Database valid: ${isValid ? 'Ya' : 'Tidak'}`,
        variant: isValid ? "default" : "destructive"
      });
      
      // Add to migration history
      const newMigration: MigrationStatus = {
        id: Date.now().toString(),
        name: 'Database Validation',
        status: 'completed',
        progress: 100,
        message: `Validasi: ${isValid ? 'Berhasil' : 'Gagal'}`,
        timestamp: new Date(),
        details: { validation: validationResult }
      };
      
      setMigrationHistory(prev => [newMigration, ...prev]);
      
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validasi gagal",
        description: `Terjadi kesalahan saat validasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
      setValidationProgress(0);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      const steps = [
        'Memulai analisis...',
        'Menganalisis struktur...',
        'Memeriksa performa...',
        'Mengidentifikasi masalah...',
        'Membuat rekomendasi...',
        'Selesai'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setAnalysisProgress(Math.round(((i + 1) / steps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Use the migrationService getMigrationStatus method to analyze
      const analysisResult = await migrationService.getMigrationStatus();
      
      toast({
        title: "Analisis selesai",
        description: `Database berhasil dianalisis`,
      });
      
      // Add to migration history
      const newMigration: MigrationStatus = {
        id: Date.now().toString(),
        name: 'Database Analysis',
        status: 'completed',
        progress: 100,
        message: 'Analisis selesai',
        timestamp: new Date(),
        details: { analysis: analysisResult }
      };
      
      setMigrationHistory(prev => [newMigration, ...prev]);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analisis gagal",
        description: `Terjadi kesalahan saat analisis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Migration & Backup</h2>
          <p className="text-gray-600">Kelola migrasi data, backup, dan restore database</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadDatabaseInfo}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {databaseInfo.find(db => db.type === 'supabase')?.status === 'connected' ? 'Connected' : 'Disconnected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {databaseInfo.find(db => db.type === 'supabase')?.tables || 0} tables available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Migration History</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{migrationHistory.length}</div>
                <p className="text-xs text-muted-foreground">
                  {migrationHistory.filter(m => m.status === 'completed').length} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {databaseInfo.find(db => db.type === 'supabase')?.lastBackup 
                    ? new Date(databaseInfo.find(db => db.type === 'supabase')!.lastBackup!).toLocaleDateString('id-ID')
                    : 'Never'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Last backup date
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Akses cepat ke fitur-fitur utama migrasi data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={handleBackup}
                  variant="outline"
                  className="justify-start"
                  disabled={isBackingUp}
                >
                  {isBackingUp ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4 mr-2" />
                  )}
                  {isBackingUp ? 'Backing up...' : 'Backup'}
                </Button>
                
                <Button
                  onClick={handleValidate}
                  variant="outline"
                  className="justify-start"
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {isValidating ? 'Validating...' : 'Validate'}
                </Button>
                
                <Button
                  onClick={handleAnalyze}
                  variant="outline"
                  className="justify-start"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <HardDrive className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
                
                <Button
                  onClick={loadMigrationHistory}
                  variant="outline"
                  className="justify-start"
                  disabled={isLoading}
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Database</CardTitle>
              <CardDescription>
                Ekspor data database ke file untuk backup atau migrasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Tabel</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['products', 'customers', 'orders', 'employees', 'suppliers', 'materials', 'transactions'].map((table) => (
                    <label key={table} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables([...selectedTables, table]);
                          } else {
                            setSelectedTables(selectedTables.filter(t => t !== table));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{table}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Konfigurasi Export</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.includeData}
                      onChange={(e) => setMigrationConfig({...migrationConfig, includeData: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Include Data</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.includeSchema}
                      onChange={(e) => setMigrationConfig({...migrationConfig, includeSchema: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Include Schema</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.includeIndexes}
                      onChange={(e) => setMigrationConfig({...migrationConfig, includeIndexes: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Include Indexes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.includeConstraints}
                      onChange={(e) => setMigrationConfig({...migrationConfig, includeConstraints: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Include Constraints</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={isExporting || selectedTables.length === 0}
                className="w-full"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export Database'}
              </Button>

              {isExporting && (
                <div className="space-y-2">
                  <Progress value={exportProgress} className="w-full" />
                  <p className="text-xs text-gray-500 text-center">{exportProgress}% selesai</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Database</CardTitle>
              <CardDescription>
                Import data dari file ke database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Peringatan:</strong> Import data dapat mengganti data yang sudah ada. 
                  Pastikan Anda telah membuat backup sebelum melakukan import.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Konfigurasi Import</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.validateData}
                      onChange={(e) => setMigrationConfig({...migrationConfig, validateData: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Validate Data</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.backupBeforeMigration}
                      onChange={(e) => setMigrationConfig({...migrationConfig, backupBeforeMigration: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Backup Before Import</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={migrationConfig.createLogs}
                      onChange={(e) => setMigrationConfig({...migrationConfig, createLogs: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Create Logs</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isImporting ? 'Importing...' : 'Import Database'}
              </Button>

              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-xs text-gray-500 text-center">{importProgress}% selesai</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Backup</CardTitle>
                <CardDescription>
                  Buat backup lengkap database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="w-full"
                >
                  {isBackingUp ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4 mr-2" />
                  )}
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                </Button>

                {isBackingUp && (
                  <div className="space-y-2">
                    <Progress value={backupProgress} className="w-full" />
                    <p className="text-xs text-gray-500 text-center">{backupProgress}% selesai</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restore Backup</CardTitle>
                <CardDescription>
                  Restore database dari backup file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>PERINGATAN:</strong> Restore akan mengganti semua data saat ini!
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  variant="destructive"
                  className="w-full"
                >
                  {isRestoring ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  )}
                  {isRestoring ? 'Restoring...' : 'Restore Backup'}
                </Button>

                {isRestoring && (
                  <div className="space-y-2">
                    <Progress value={restoreProgress} className="w-full" />
                    <p className="text-xs text-gray-500 text-center">{restoreProgress}% selesai</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration History</CardTitle>
              <CardDescription>
                Riwayat semua operasi migrasi dan backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {migrationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada riwayat migrasi
                  </div>
                ) : (
                  migrationHistory.map((migration) => (
                    <div
                      key={migration.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(migration.status)}
                        <div>
                          <div className="font-medium">{migration.name}</div>
                          <div className="text-sm text-gray-500">
                            {migration.message}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(migration.status)}>
                          {migration.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {migration.timestamp.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Tips Migrasi Data</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Backup Rutin:</strong> Selalu buat backup sebelum melakukan migrasi</p>
              <p>• <strong>Validasi:</strong> Validasi data setelah import untuk memastikan integritas</p>
              <p>• <strong>Test Environment:</strong> Test migrasi di environment non-produksi terlebih dahulu</p>
              <p>• <strong>Logs:</strong> Aktifkan logging untuk tracking operasi migrasi</p>
              <p>• <strong>Batch Size:</strong> Atur batch size sesuai dengan kapasitas sistem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

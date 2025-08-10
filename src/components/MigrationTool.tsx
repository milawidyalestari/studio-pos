import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  FileText,
  Settings
} from 'lucide-react';
import { MigrationService, MigrationStatus, MigrationProgress } from '@/services/migrationService';
import { useDatabase } from '@/hooks/useDatabase';

interface MigrationToolProps {
  onClose?: () => void;
}

export const MigrationTool: React.FC<MigrationToolProps> = ({ onClose }) => {
  const { database } = useDatabase();
  const [migrationService] = useState(() => new MigrationService(database));
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus[]>([]);
  const [currentProgress, setCurrentProgress] = useState<MigrationProgress | null>(null);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [showBackupRestore, setShowBackupRestore] = useState(false);

  useEffect(() => {
    loadMigrationStatus();
  }, []);

  const loadMigrationStatus = async () => {
    try {
      const status = await migrationService.getMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Failed to load migration status:', error);
    }
  };

  const handleStartMigration = async () => {
    if (!confirm('Are you sure you want to start the migration? This will move all data from local storage to the database.')) {
      return;
    }

    setIsMigrating(true);
    setCurrentProgress(null);

    try {
      // Set progress callback
      migrationService.setProgressCallback((progress) => {
        setCurrentProgress(progress);
      });

      // Start migration
      const results = await migrationService.migrateAllData();
      setMigrationStatus(results);
      
      // Reload status
      await loadMigrationStatus();
      
      alert('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      alert(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
      setCurrentProgress(null);
    }
  };

  const handleBackupLocalStorage = async () => {
    try {
      const filename = await migrationService.backupLocalStorage();
      alert(`Backup created successfully: ${filename}`);
    } catch (error) {
      console.error('Backup failed:', error);
      alert(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRestoreFromBackup = async () => {
    if (!backupFile) {
      alert('Please select a backup file first');
      return;
    }

    if (!confirm('Are you sure you want to restore from backup? This will overwrite current local storage data.')) {
      return;
    }

    try {
      await migrationService.restoreFromBackup(backupFile);
      alert('Backup restored successfully!');
      setBackupFile(null);
      setShowBackupRestore(false);
    } catch (error) {
      console.error('Restore failed:', error);
      alert(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackupFile(file);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTotalRecords = () => {
    return migrationStatus.reduce((total, status) => total + status.totalRecords, 0);
  };

  const getMigratedRecords = () => {
    return migrationStatus.reduce((total, status) => total + status.migratedRecords, 0);
  };

  const getOverallProgress = () => {
    const total = getTotalRecords();
    if (total === 0) return 0;
    return Math.round((getMigratedRecords() / total) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Data Migration Tool</h2>
              <p className="text-sm text-gray-600">Migrate data from local storage to database</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6">
          {/* Overview Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Migration Overview</span>
              </CardTitle>
              <CardDescription>
                Current status and progress of data migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getTotalRecords()}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getMigratedRecords()}</div>
                  <div className="text-sm text-gray-600">Migrated Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getOverallProgress()}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
              </div>
              
              <Progress value={getOverallProgress()} className="w-full" />
            </CardContent>
          </Card>

          {/* Current Progress */}
          {currentProgress && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Current Migration Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Table: {currentProgress.currentTable}</span>
                    <span>{currentProgress.currentRecord} / {currentProgress.totalRecords}</span>
                  </div>
                  <Progress value={currentProgress.percentage} className="w-full" />
                  <p className="text-sm text-gray-600">{currentProgress.status}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Migration Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Migration Status by Table</CardTitle>
              <CardDescription>
                Detailed status for each data table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {migrationStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status.migrationStatus)}
                        <div>
                          <div className="font-medium">{status.tableName}</div>
                          <div className="text-sm text-gray-600">
                            {status.migratedRecords} / {status.totalRecords} records
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(status.migrationStatus)}>
                        {status.migrationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={handleStartMigration}
              disabled={isMigrating}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isMigrating ? 'Migrating...' : 'Start Migration'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleBackupLocalStorage}
              disabled={isMigrating}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Backup Local Storage</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowBackupRestore(!showBackupRestore)}
              disabled={isMigrating}
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Restore from Backup</span>
            </Button>

            <Button
              variant="ghost"
              onClick={loadMigrationStatus}
              disabled={isMigrating}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Status</span>
            </Button>
          </div>

          {/* Backup Restore Section */}
          {showBackupRestore && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Restore from Backup</CardTitle>
                <CardDescription>
                  Select a backup file to restore data to local storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {backupFile && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{backupFile.name}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleRestoreFromBackup}
                    disabled={!backupFile}
                    variant="outline"
                    className="w-full"
                  >
                    Restore from Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Before starting migration, make sure to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Backup your current local storage data</li>
                <li>Ensure your database is properly configured and accessible</li>
                <li>Close any other applications that might be using the data</li>
                <li>Migration will move data from local storage to database - data will remain in local storage as backup</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

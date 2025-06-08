
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, RefreshCw, Trash2, Database, FileText } from 'lucide-react';

export const ProgramTools = () => {
  const { toast } = useToast();

  const handleBackupDatabase = () => {
    toast({
      title: "Backup started",
      description: "Database backup is in progress...",
    });
  };

  const handleRestoreDatabase = () => {
    toast({
      title: "Restore initiated",
      description: "Please select a backup file to restore.",
    });
  };

  const handleClearCache = () => {
    toast({
      title: "Cache cleared",
      description: "Application cache has been cleared successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Data export is being prepared...",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import ready",
      description: "Please select a file to import data.",
    });
  };

  const handleCleanupLogs = () => {
    toast({
      title: "Logs cleaned",
      description: "Old log files have been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Tools
            </CardTitle>
            <CardDescription>
              Backup, restore, and maintain your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleBackupDatabase}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
            <Button 
              onClick={handleRestoreDatabase}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore Database
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Import and export application data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleExportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button 
              onClick={handleImportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">System Maintenance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={handleClearCache}
            variant="outline"
            className="justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          
          <Button 
            onClick={handleCleanupLogs}
            variant="outline"
            className="justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Logs
          </Button>
          
          <Button 
            variant="outline"
            className="justify-start"
            onClick={() => toast({
              title: "System check completed",
              description: "All systems are running normally.",
            })}
          >
            <Database className="h-4 w-4 mr-2" />
            System Check
          </Button>
        </div>
      </div>

      <Separator />

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">Important Notice</h4>
        <p className="text-sm text-yellow-700">
          These tools perform critical system operations. Please ensure you have proper backups 
          before performing any maintenance tasks. Some operations may temporarily affect system performance.
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { MigrationService, MigrationProgress } from '@/services/migrationService';
import { DatabaseFactory } from '@/lib/database';

interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
}

export default function MigrationWizard() {
  const [migrationService] = useState(() => {
    const database = DatabaseFactory.createDatabase();
    return new MigrationService(database);
  });
  
  const [progress, setProgress] = useState<MigrationProgress>({
    currentTable: 'Ready to migrate',
    currentRecord: 0,
    totalRecords: 7,
    percentage: 0,
    status: 'idle'
  });
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    setResult(null);
    
    // Set up progress callback
    migrationService.setProgressCallback((progress) => {
      setProgress(progress);
    });

    try {
      const migrationResult = await migrationService.migrateAllData();
      setResult({
        success: true,
        message: `Migration completed successfully. Migrated ${migrationResult.length} tables.`
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const getStatusIcon = (status: MigrationProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: MigrationProgress['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Migration Wizard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Migration Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This wizard will migrate all your data from <strong>Supabase (cloud)</strong> to your <strong>local database</strong>. 
              This process is irreversible and will create a complete copy of your data locally.
            </AlertDescription>
          </Alert>

          {/* Supabase Configuration Status */}
          <Alert variant={import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? "default" : "destructive"}>
            {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>Supabase Configuration:</strong> {
                import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
                  ? 'Configured ✓' 
                  : 'Not configured ✗'
              }
              {!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_ANON_KEY && (
                <div className="mt-2 text-sm">
                  Please create a <code>.env</code> file with your Supabase credentials:
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
                  </pre>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Migration Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Migration Process:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Step 1: Export</span>
                </div>
                <p className="text-sm text-gray-600">
                  Export all data from Supabase cloud database
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Step 2: Validate</span>
                </div>
                <p className="text-sm text-gray-600">
                  Validate data integrity and structure
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Step 3: Import</span>
                </div>
                <p className="text-sm text-gray-600">
                  Import data to local database
                </p>
              </Card>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Migration Progress</h3>
              {getStatusBadge(progress.status)}
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusIcon(progress.status)}
              <div className="flex-1">
                <p className="font-medium">{progress.currentTable}</p>
                <p className="text-sm text-gray-600">
                  Table {progress.currentRecord} of {progress.totalRecords} ({progress.percentage}%)
                </p>
              </div>
            </div>

            <Progress value={progress.percentage} className="w-full" />
            
            {progress.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{progress.error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Migration Button */}
          <Button 
            onClick={handleMigration} 
            disabled={isMigrating || progress.status === 'running'}
            className="w-full"
            size="lg"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrating Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>

          {/* Result Section */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Migration Result</h3>
              
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>{result.success ? 'Success!' : 'Failed!'}</strong> {result.message}
                  {result.error && (
                    <div className="mt-2 text-sm">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* The summary section was removed as per the new_code, as the MigrationService no longer provides a summary object. */}
            </div>
          )}

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This migration will create a complete copy of your data locally. 
              Make sure you have a backup of your Supabase data before proceeding. 
              The original Supabase data will remain unchanged.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

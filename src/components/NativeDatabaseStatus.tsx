import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TransparentCard, TransparentCardContent, TransparentCardDescription, TransparentCardHeader, TransparentCardTitle } from './TransparentCard';
import { TransparentWrapper } from './TransparentWrapper';
import { CheckCircle, XCircle, AlertCircle, Database, HardDrive, Cloud, Loader2 } from 'lucide-react';
import { nativeDatabaseService, DatabaseDetectionResult } from '@/services/nativeDatabaseService';

interface NativeDatabaseStatusProps {
  onSetupComplete?: () => void;
}

export const NativeDatabaseStatus: React.FC<NativeDatabaseStatusProps> = ({ onSetupComplete }) => {
  const [detectionResult, setDetectionResult] = useState<DatabaseDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectDatabase();
  }, []);

  const detectDatabase = async () => {
    try {
      setIsDetecting(true);
      setError(null);
      
      const result = await nativeDatabaseService.detectDatabase();
      setDetectionResult(result);
      
      console.log('Database detection result:', result);
    } catch (err) {
      console.error('Database detection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSetupFirstRun = async () => {
    try {
      setIsSettingUp(true);
      setError(null);

      await nativeDatabaseService.setupFirstRun({
        createDefaultUser: true,
        createDefaultCategories: true,
        createDefaultTables: true,
        initializeSampleData: true
      });

      // Re-detect after setup
      await detectDatabase();
      
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (err) {
      console.error('First run setup failed:', err);
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setIsSettingUp(false);
    }
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'sqlite':
        return <HardDrive className="h-5 w-5 text-green-500" />;
      case 'none':
        return <Cloud className="h-5 w-5 text-gray-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (connected: boolean) => {
    if (connected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (result: DatabaseDetectionResult) => {
    if (result.isFirstRun) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">First Run</Badge>;
    } else if (result.hasDatabase) {
      return <Badge variant="outline" className="text-green-600 border-green-600">Connected</Badge>;
    } else {
      return <Badge variant="outline" className="text-red-600 border-red-600">Not Connected</Badge>;
    }
  };

  if (isDetecting) {
    return (
      <TransparentWrapper>
        <TransparentCard className="w-full max-w-2xl mx-auto">
          <TransparentCardHeader>
            <TransparentCardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Detecting Database
            </TransparentCardTitle>
            <TransparentCardDescription>
              Checking for available databases on your system...
            </TransparentCardDescription>
          </TransparentCardHeader>
          <TransparentCardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-sm text-white/70">Please wait...</p>
              </div>
            </div>
          </TransparentCardContent>
        </TransparentCard>
      </TransparentWrapper>
    );
  }

  if (error) {
    return (
      <TransparentWrapper>
        <TransparentCard className="w-full max-w-2xl mx-auto">
          <TransparentCardHeader>
            <TransparentCardTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              Database Detection Error
            </TransparentCardTitle>
          </TransparentCardHeader>
          <TransparentCardContent>
            <Alert className="mb-4 bg-red-500/10 border-red-500/20 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
            <Button onClick={detectDatabase} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Try Again
            </Button>
          </TransparentCardContent>
        </TransparentCard>
      </TransparentWrapper>
    );
  }

  if (!detectionResult) {
    return null;
  }

  return (
    <TransparentWrapper>
      <TransparentCard className="w-full max-w-2xl mx-auto">
        <TransparentCardHeader>
          <TransparentCardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getDatabaseIcon(detectionResult.databaseType)}
              Database Status
            </span>
            {getStatusBadge(detectionResult)}
          </TransparentCardTitle>
          <TransparentCardDescription>
            {detectionResult.isFirstRun 
              ? "Welcome! Let's set up your Studio POS application."
              : "Your database connection status and configuration."
            }
          </TransparentCardDescription>
        </TransparentCardHeader>
        <TransparentCardContent className="space-y-4">
          {/* Database Type */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="font-medium text-white">Database Type:</span>
            <span className="flex items-center gap-2 text-white">
              {getDatabaseIcon(detectionResult.databaseType)}
              <span className="capitalize">
                {detectionResult.databaseType === 'none' ? 'Local Storage' : detectionResult.databaseType}
              </span>
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="font-medium text-white">Connection Status:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(detectionResult.hasDatabase)}
              <span className={detectionResult.hasDatabase ? 'text-green-400' : 'text-red-400'}>
                {detectionResult.hasDatabase ? 'Connected' : 'Not Connected'}
              </span>
            </span>
          </div>

          {/* First Run Status */}
          {detectionResult.isFirstRun && (
            <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="font-medium text-orange-300">First Run:</span>
              <span className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="h-4 w-4" />
                <span>Setup Required</span>
              </span>
            </div>
          )}

          {/* Setup Required */}
          {detectionResult.needsSetup && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-medium text-blue-300 mb-2">Setup Required</h4>
              <p className="text-sm text-blue-200 mb-4">
                Your Studio POS application needs to be set up for the first time. 
                This will create the necessary database structure and default data.
              </p>
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span>Create default admin user (admin/admin123)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span>Setup default categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span>Initialize database structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span>Add sample data for testing</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {detectionResult.needsSetup ? (
              <Button 
                onClick={handleSetupFirstRun} 
                disabled={isSettingUp}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Setting Up...
                  </>
                ) : (
                  'Setup Application'
                )}
              </Button>
            ) : (
              <Button 
                onClick={detectDatabase} 
                variant="outline" 
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Refresh Status
              </Button>
            )}
          </div>

          {/* Success Message */}
          {!detectionResult.needsSetup && detectionResult.hasDatabase && (
            <Alert className="mt-4 bg-green-500/10 border-green-500/20 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Your Studio POS application is ready to use! You can now start managing your business.
              </AlertDescription>
            </Alert>
          )}
        </TransparentCardContent>
      </TransparentCard>
    </TransparentWrapper>
  );
};

export default NativeDatabaseStatus;



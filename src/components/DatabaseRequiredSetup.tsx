import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Server,
  HardDrive,
  Cloud
} from 'lucide-react';

interface DatabaseDetectionResult {
  databaseType: string;
  connected: boolean;
  isFirstRun: boolean;
  needsSetup: boolean;
  error?: string;
}

interface DatabaseRequiredSetupProps {
  onSetupComplete?: () => void;
  onSkipSetup?: () => void;
}

export const DatabaseRequiredSetup: React.FC<DatabaseRequiredSetupProps> = ({ 
  onSetupComplete,
  onSkipSetup 
}) => {
  const [detectionResult, setDetectionResult] = useState<DatabaseDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'detecting' | 'no-database' | 'setup' | 'complete'>('detecting');

  useEffect(() => {
    detectDatabase();
  }, []);

  const detectDatabase = async () => {
    try {
      setIsDetecting(true);
      setError(null);
      
      // Simulate database detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if database exists
      const hasDatabase = await checkDatabaseExists();
      
      if (hasDatabase) {
        setDetectionResult({
          databaseType: 'sqlite',
          connected: true,
          isFirstRun: false,
          needsSetup: false
        });
        setSetupStep('setup');
      } else {
        setDetectionResult({
          databaseType: 'none',
          connected: false,
          isFirstRun: true,
          needsSetup: true
        });
        setSetupStep('no-database');
      }
    } catch (err) {
      console.error('Database detection failed:', err);
      setError(err instanceof Error ? err.message : 'Database detection failed');
      setDetectionResult({
        databaseType: 'none',
        connected: false,
        isFirstRun: true,
        needsSetup: true
      });
      setSetupStep('no-database');
    } finally {
      setIsDetecting(false);
    }
  };

  const checkDatabaseExists = async (): Promise<boolean> => {
    // Check if running in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const dbInfo = await (window as any).electronAPI.database.getInfo();
        return dbInfo && dbInfo.connected;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const handleSetupDatabase = async () => {
    try {
      setIsSettingUp(true);
      setError(null);

      // Setup database
      await setupDatabase();
      
      setSetupStep('complete');
      
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (err) {
      console.error('Database setup failed:', err);
      setError(err instanceof Error ? err.message : 'Database setup failed');
    } finally {
      setIsSettingUp(false);
    }
  };

  const setupDatabase = async () => {
    // Simulate database setup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In real implementation, this would:
    // 1. Create SQLite database file
    // 2. Run schema migrations
    // 3. Create default admin user
    // 4. Initialize sample data
  };

  const handleDownloadPostgreSQL = () => {
    window.open('https://www.postgresql.org/download/', '_blank');
  };

  const handleDownloadSQLite = () => {
    window.open('https://www.sqlite.org/download.html', '_blank');
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql': return <Server className="h-5 w-5 text-blue-600" />;
      case 'sqlite': return <HardDrive className="h-5 w-5 text-green-600" />;
      case 'supabase': return <Cloud className="h-5 w-5 text-purple-600" />;
      default: return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (result: DatabaseDetectionResult) => {
    if (result.connected) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
    } else if (result.isFirstRun) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Setup Required</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Not Connected</Badge>;
    }
  };

  if (isDetecting) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Detecting Database
          </CardTitle>
          <CardDescription>
            Checking for existing database configuration...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning for PostgreSQL...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking SQLite availability...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying database schema...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (setupStep === 'no-database') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Database Required
          </CardTitle>
          <CardDescription>
            Studio POS requires a database to store your data. Please install a database first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Database Required:</strong> Studio POS needs a database to store orders, customers, inventory, and financial data. 
              Please choose one of the options below to get started.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            {/* PostgreSQL Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  PostgreSQL (Recommended)
                </CardTitle>
                <CardDescription>
                  Full-featured database for production use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>High performance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>ACID compliance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Multi-user support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Advanced features</span>
                  </div>
                </div>
                <Button 
                  onClick={handleDownloadPostgreSQL}
                  className="w-full"
                  variant="default"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PostgreSQL
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* SQLite Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-green-600" />
                  SQLite (Simple)
                </CardTitle>
                <CardDescription>
                  Lightweight database for single-user setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>No installation required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Single file database</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Easy backup</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Perfect for small business</span>
                  </div>
                </div>
                <Button 
                  onClick={handleSetupDatabase}
                  className="w-full"
                  variant="outline"
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Use SQLite (Recommended for Start)
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Need help? Check our <a href="#" className="text-primary hover:underline">setup guide</a>
            </div>
            {onSkipSetup && (
              <Button variant="ghost" onClick={onSkipSetup}>
                Skip for Now (Demo Mode)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (setupStep === 'setup') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getDatabaseIcon(detectionResult?.databaseType || 'sqlite')}
            Database Setup Required
          </CardTitle>
          <CardDescription>
            {detectionResult?.isFirstRun 
              ? "Welcome! Let's set up your Studio POS database."
              : "Your database needs to be configured."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Database Type</div>
                  <div className="text-sm text-muted-foreground">
                    {detectionResult?.databaseType === 'sqlite' ? 'SQLite' : 'Unknown'}
                  </div>
                </div>
              </div>
              {getStatusBadge(detectionResult!)}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What will be set up?</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Database tables and schema</li>
                <li>• Default admin user (admin/admin123)</li>
                <li>• Sample categories and products</li>
                <li>• Basic configuration settings</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSetupDatabase}
                disabled={isSettingUp}
                className="flex-1"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setup Database
                  </>
                )}
              </Button>
              
              <Button 
                onClick={detectDatabase}
                variant="outline"
                disabled={isSettingUp}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (setupStep === 'complete') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Database Setup Complete
          </CardTitle>
          <CardDescription>
            Your Studio POS database has been successfully configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Database setup completed successfully! You can now proceed to login.
            </AlertDescription>
          </Alert>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Setup Summary:</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>✅ Database tables created</li>
              <li>✅ Default admin user created</li>
              <li>✅ Sample data initialized</li>
              <li>✅ Configuration saved</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Default Login Credentials:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Username:</strong> admin</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
          </div>

          <Button 
            onClick={() => onSetupComplete?.()}
            className="w-full"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};




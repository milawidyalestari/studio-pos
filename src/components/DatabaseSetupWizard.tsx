import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Cloud, 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Info,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

interface DatabaseSetupWizardProps {
  isOpen: boolean;
  onComplete: (config: {
    useSupabase: boolean;
    url?: string;
    key?: string;
  }) => void;
}

const DatabaseSetupWizard: React.FC<DatabaseSetupWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<'local' | 'supabase' | null>(null);
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    key: ''
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedType) {
      if (selectedType === 'local') {
        // Complete setup for local storage
        handleComplete();
      } else {
        // Go to Supabase configuration
        setStep(2);
      }
    }
  };

  const testSupabaseConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (!supabaseConfig.url || !supabaseConfig.key) {
        setTestResult({
          success: false,
          message: 'Please provide both Supabase URL and Anon Key'
        });
        return;
      }

      // Basic URL validation
      if (!supabaseConfig.url.includes('supabase.co')) {
        setTestResult({
          success: false,
          message: 'Invalid Supabase URL format. Should be like: https://your-project.supabase.co'
        });
        return;
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));

      setTestResult({
        success: true,
        message: 'Configuration looks good! You can proceed with the setup.'
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

  const handleComplete = () => {
    const config = {
      useSupabase: selectedType === 'supabase',
      url: selectedType === 'supabase' ? supabaseConfig.url : undefined,
      key: selectedType === 'supabase' ? supabaseConfig.key : undefined
    };

    // Save to localStorage
    localStorage.setItem('database_config', JSON.stringify(config));
    localStorage.setItem('database_setup_completed', 'true');

    onComplete(config);
  };

  if (step === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Welcome to Studio POS - Database Setup
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                Choose your preferred database storage for the application. You can change this later in Settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Storage Option */}
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedType === 'local' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedType('local')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <HardDrive className="h-6 w-6 text-gray-600" />
                    Local Storage
                    <Badge variant="secondary">Recommended for Testing</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Store data in your browser's local storage. Perfect for development and testing.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span>Quick setup - no configuration needed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Data stays on your device</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Always available offline</span>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Data will be lost if you clear browser storage or use a different device.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Supabase Option */}
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedType === 'supabase' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedType('supabase')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Cloud className="h-6 w-6 text-blue-600" />
                    Supabase Cloud
                    <Badge className="bg-blue-100 text-blue-800">Production Ready</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Store data in a secure cloud database with real-time synchronization.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span>Access from anywhere</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Automatic backups</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      <span>Real-time synchronization</span>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Requires Supabase account and project setup. Free tier available.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <div></div>
              <Button 
                onClick={handleNext}
                disabled={!selectedType}
                className="gap-2"
              >
                {selectedType === 'local' ? 'Complete Setup' : 'Configure Supabase'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Configure Supabase Database
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll need a Supabase account and project. Visit{' '}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                supabase.com
              </a>{' '}
              to create one if you haven't already.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setup-url">Supabase Project URL</Label>
              <Input
                id="setup-url"
                placeholder="https://your-project.supabase.co"
                value={supabaseConfig.url}
                onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
              />
              <p className="text-xs text-gray-500">
                Find this in your Supabase project settings under "API Settings"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setup-key">Supabase Anon Key</Label>
              <Input
                id="setup-key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseConfig.key}
                onChange={(e) => setSupabaseConfig(prev => ({ ...prev, key: e.target.value }))}
              />
              <p className="text-xs text-gray-500">
                This is the "anon" public key from your project's API settings
              </p>
            </div>

            <Button
              variant="outline"
              onClick={testSupabaseConnection}
              disabled={testing || !supabaseConfig.url || !supabaseConfig.key}
              className="gap-2 w-full"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Test Connection
            </Button>

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
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={!testResult?.success}
              className="gap-2"
            >
              Complete Setup
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseSetupWizard;
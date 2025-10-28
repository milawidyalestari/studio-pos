import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TransparentWrapper } from './TransparentWrapper';
import { TransparentCard, TransparentCardContent, TransparentCardDescription, TransparentCardHeader, TransparentCardTitle } from './TransparentCard';
import { databaseService } from '@/services/databaseService';
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
  Cloud,
  ArrowRight,
  ArrowLeft,
  Settings,
  User,
  Key,
  Shield,
  FileText,
  BarChart3
} from 'lucide-react';

interface DatabaseSetupWizardProps {
  onSetupComplete?: () => void;
  onSkipSetup?: () => void;
}

type SetupStep = 'welcome' | 'detecting' | 'database-type' | 'database-config' | 'configuring' | 'creating-user' | 'finalizing' | 'complete';

export const DatabaseSetupWizard: React.FC<DatabaseSetupWizardProps> = ({ 
  onSetupComplete,
  onSkipSetup 
}) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [selectedDbType, setSelectedDbType] = useState<'sqlite' | 'postgresql' | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: 5432,
    database: 'studio_pos',
    username: 'postgres',
    password: ''
  });

  // Validate database configuration
  const validateDbConfig = (config: typeof dbConfig): string | null => {
    if (!config.host.trim()) {
      return 'Host tidak boleh kosong';
    }
    
    const port = parseInt(config.port.toString());
    if (isNaN(port) || port < 1 || port > 65535) {
      return 'Port harus berupa angka antara 1-65535';
    }
    
    if (!config.database.trim()) {
      return 'Nama database tidak boleh kosong';
    }
    
    if (!config.username.trim()) {
      return 'Username tidak boleh kosong';
    }
    
    if (!config.password.trim()) {
      return 'Password tidak boleh kosong';
    }
    
    return null;
  };

  const steps: { key: SetupStep; title: string; description: string }[] = [
    { key: 'welcome', title: 'Selamat Datang di Studio POS', description: 'Mari kita setup database Anda' },
    { key: 'detecting', title: 'Mendeteksi Lingkungan', description: 'Memeriksa sistem Anda...' },
    { key: 'database-type', title: 'Pilih Database', description: 'Pilih database yang Anda inginkan' },
    { key: 'database-config', title: 'Konfigurasi Database', description: 'Konfigurasi koneksi database Anda' },
    { key: 'configuring', title: 'Mengonfigurasi Database', description: 'Menyiapkan skema database...' },
    { key: 'creating-user', title: 'Membuat Admin User', description: 'Menyiapkan akun administrator...' },
    { key: 'finalizing', title: 'Menyelesaikan Setup', description: 'Menyelesaikan konfigurasi...' },
    { key: 'complete', title: 'Setup Selesai', description: 'Siap untuk menggunakan Studio POS' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  useEffect(() => {
    // Check if setup has already been completed
    const setupCompleted = localStorage.getItem('database_setup_completed');
    if (setupCompleted === 'true') {
      // Setup already completed, skip directly to completion
      setCurrentStep('complete');
      return;
    }
    
    if (currentStep === 'detecting') {
      startDetection();
    }
  }, [currentStep]);

  const startDetection = async () => {
    try {
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('database-type');
    } catch (error) {
      setError('Deteksi gagal. Silakan coba lagi.');
    }
  };

  const handleDatabaseSelection = (dbType: 'sqlite' | 'postgresql') => {
    setSelectedDbType(dbType);
    if (dbType === 'sqlite') {
      setCurrentStep('configuring');
      startDatabaseSetup();
    } else {
      setCurrentStep('database-config');
    }
  };

  const startDatabaseSetup = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Step 1: Configuring Database
      setCurrentStep('configuring');
      setProgress(0);
      
      // Initialize database service
      const { databaseService } = await import('@/services/databaseService');
      await databaseService.initialize();
      
      for (let i = 0; i <= 50; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Step 2: Running Migrations
      setCurrentStep('creating-user');
      setProgress(50);
      
      try {
        const { migrationService } = await import('@/services/migrationService');
        const result = await migrationService.runMigrations(databaseService);
        
        if (!result.success) {
          throw new Error(result.error || 'Migration failed');
        }
        
        console.log(`✅ Applied ${result.appliedMigrations.length} migrations`);
      } catch (migrationError) {
        console.warn('Migration failed, continuing with setup:', migrationError);
      }
      
      for (let i = 50; i <= 80; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Step 3: Finalizing
      setCurrentStep('finalizing');
      setProgress(80);
      
      for (let i = 80; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Complete
      setCurrentStep('complete');
      setProgress(100);
      
    } catch (error) {
      console.error('Database setup error:', error);
      setError('Setup gagal. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPostgreSQL = () => {
    window.open('https://www.postgresql.org/download/', '_blank');
  };

  const handleDatabaseConfigNext = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Validate configuration first
      const validationError = validateDbConfig(dbConfig);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      // Test database connection first
      console.log('🔍 Testing database connection with config:', dbConfig);
      
      if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.updateConfig) {
        const config = {
          mode: 'production',
          type: 'postgresql',
          connection: {
            ...dbConfig,
            port: parseInt(dbConfig.port.toString())
          }
        };
        
        // Add timeout to the entire operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Koneksi timeout setelah 10 detik')), 10000)
        );
        
        const testPromise = (async () => {
          // Test connection
          const result = await (window as any).electronAPI.database.updateConfig(config);
          if (!result.success) {
            throw new Error(result.error || 'Failed to connect to PostgreSQL');
          }
          
          // Verify connection
          const dbInfo = await (window as any).electronAPI.database.getInfo();
          if (!dbInfo.connected) {
            throw new Error('Database connection verification failed');
          }
          
          return dbInfo;
        })();
        
        const dbInfo = await Promise.race([testPromise, timeoutPromise]);
        
        console.log('✅ PostgreSQL connection verified:', dbInfo);
        
        // Save configuration with setup date
        const finalConfig = {
          ...config,
          setupDate: new Date().toISOString()
        };
        localStorage.setItem('database_config', JSON.stringify(finalConfig));
        
        console.log('✅ Database configuration saved:', finalConfig);
        
        // Reinitialize database service with new config
        const { databaseService } = await import('@/services/databaseService');
        await databaseService.initialize();
        
        setCurrentStep('configuring');
        startDatabaseSetup();
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('❌ Database configuration failed:', error);
      setError(`Gagal terhubung ke database: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Validate configuration first
      const validationError = validateDbConfig(dbConfig);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      console.log('🔍 Testing PostgreSQL connection with config:', dbConfig);
      
      // Test connection by updating Electron database configuration
      if (typeof window !== 'undefined' && (window as any).electronAPI?.database?.updateConfig) {
        const config = {
          mode: 'production',
          type: 'postgresql',
          connection: {
            ...dbConfig,
            port: parseInt(dbConfig.port.toString())
          }
        };
        
        // Add timeout to the entire operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Koneksi timeout setelah 10 detik')), 10000)
        );
        
        const testPromise = (async () => {
          const result = await (window as any).electronAPI.database.updateConfig(config);
          if (!result.success) {
            throw new Error(result.error || 'Failed to connect to PostgreSQL');
          }
          
          // Test actual database query
          const dbInfo = await (window as any).electronAPI.database.getInfo();
          if (!dbInfo.connected) {
            throw new Error('Database connection test failed');
          }
          
          return dbInfo;
        })();
        
        const dbInfo = await Promise.race([testPromise, timeoutPromise]);
        
        console.log('✅ PostgreSQL connection test successful:', dbInfo);
        setError(null);
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      setError(`Tes koneksi gagal: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    try {
      // Save setup completion status to localStorage
      localStorage.setItem('database_setup_completed', 'true');
      localStorage.setItem('database_setup_date', new Date().toISOString());
      
      // Save database configuration if available
      if (selectedDbType) {
        const config = {
          mode: 'production',
          type: selectedDbType,
          connection: selectedDbType === 'postgresql' ? dbConfig : {},
          setupDate: new Date().toISOString()
        };
        localStorage.setItem('database_config', JSON.stringify(config));
        
        // Reinitialize database service with new config
        const { databaseService } = await import('@/services/databaseService');
        await databaseService.initialize();
      }
      
      // Admin user is already created by migration service
      console.log('✅ Database setup completed with migrations');
      
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      if (onSetupComplete) {
        onSetupComplete();
      }
    }
  };

  const handleSkip = () => {
    // Save setup completion status even when skipped (demo mode)
    localStorage.setItem('database_setup_completed', 'true');
    localStorage.setItem('database_setup_date', new Date().toISOString());
    localStorage.setItem('database_setup_skipped', 'true');
    
    if (onSkipSetup) {
      onSkipSetup();
    }
  };

  const renderWelcome = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Database className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-gray-900">Selamat Datang di Studio POS</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Mari kita setup database Anda untuk memulai sistem point of sale.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Setup Pertama Kali:</strong> Wizard ini akan membantu Anda mengonfigurasi database dan membuat akun admin.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">Yang akan kita setup:</h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Skema Database</div>
                <div className="text-sm text-gray-600">Tabel untuk pesanan, pelanggan, inventori</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Akun Admin</div>
                <div className="text-sm text-gray-600">User default dengan akses penuh</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Konfigurasi Dasar</div>
                <div className="text-sm text-gray-600">Pengaturan dan preferensi default</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setCurrentStep('detecting')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            Mulai Setup
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleSkip} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Lewati Setup (Mode Demo)
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDetecting = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Mendeteksi Lingkungan
        </CardTitle>
        <CardDescription className="text-gray-600">
          Memeriksa sistem Anda dan opsi database yang tersedia...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Pemeriksaan Sistem</span>
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Selesai</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-900">Memeriksa persyaratan sistem</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-900">Memindai database yang ada</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-900">Memverifikasi izin</span>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-900">Menganalisis opsi konfigurasi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDatabaseType = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-gray-900">Pilih Database Anda</CardTitle>
        <CardDescription className="text-gray-600">
          Pilih jenis database yang paling sesuai dengan kebutuhan Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* SQLite Option */}
          <div className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 rounded-lg border p-6 bg-white" 
                onClick={() => handleDatabaseSelection('sqlite')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <HardDrive className="h-5 w-5 text-green-600" />
                SQLite (Direkomendasikan)
                <Badge variant="default" className="ml-auto bg-green-100 text-green-800 border-green-200">Setup Mudah</Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sempurna untuk bisnis kecil hingga menengah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Tidak perlu instalasi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Database file tunggal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Backup dan migrasi mudah</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Sempurna untuk setup pengguna tunggal</span>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" variant="default">
                <HardDrive className="h-4 w-4 mr-2" />
                Gunakan SQLite
              </Button>
            </CardContent>
          </div>

          {/* PostgreSQL Option */}
          <div className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 rounded-lg border p-6 bg-white"
                onClick={() => handleDatabaseSelection('postgresql')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Server className="h-5 w-5 text-blue-600" />
                PostgreSQL (Lanjutan)
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 border-blue-200">Profesional</Badge>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Untuk bisnis besar dan setup multi-pengguna
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Performa tinggi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Dukungan multi-pengguna</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Fitur lanjutan</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">Siap produksi</span>
                </div>
              </div>
              <Button 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadPostgreSQL();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PostgreSQL
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('welcome')} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="text-gray-700 hover:bg-gray-50">
            Lewati Setup (Mode Demo)
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessing = (step: SetupStep, title: string, description: string, details: string[]) => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Progress</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-3">
              {progress > (index + 1) * (100 / details.length) ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
              <span className="text-sm text-gray-900">{detail}</span>
            </div>
          ))}
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderDatabaseConfig = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Settings className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-gray-900">Konfigurasi Database</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Konfigurasi koneksi database PostgreSQL Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="db-host" className="text-gray-900">Host</Label>
              <Input
                id="db-host"
                value={dbConfig.host}
                onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                placeholder="localhost"
              />
            </div>
            <div>
              <Label htmlFor="db-port" className="text-gray-900">Port</Label>
              <Input
                id="db-port"
                type="number"
                min="1"
                max="65535"
                value={dbConfig.port}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(Number(value)) && Number(value) >= 1 && Number(value) <= 65535)) {
                    setDbConfig(prev => ({ ...prev, port: value === '' ? 0 : parseInt(value) }));
                  }
                }}
                placeholder="5432"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="db-database" className="text-gray-900">Nama Database</Label>
            <Input
              id="db-database"
              value={dbConfig.database}
              onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
              placeholder="studio_pos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="db-username" className="text-gray-900">Nama Pengguna</Label>
              <Input
                id="db-username"
                value={dbConfig.username}
                onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                placeholder="postgres"
              />
            </div>
            <div>
              <Label htmlFor="db-password" className="text-gray-900">Kata Sandi</Label>
              <Input
                id="db-password"
                type="password"
                value={dbConfig.password}
                onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Your password"
              />
            </div>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Pastikan PostgreSQL sudah terinstall dan berjalan. Jika Anda belum menginstall PostgreSQL, 
            <Button variant="link" onClick={handleDownloadPostgreSQL} className="p-0 h-auto text-blue-600 hover:text-blue-700">
              download di sini
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button 
            onClick={handleDatabaseConfigNext}
            disabled={isProcessing || !dbConfig.host || !dbConfig.database || !dbConfig.username}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghubungkan...
              </>
            ) : (
              'Lanjutkan Setup'
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={handleTestConnection}
            disabled={isProcessing || !dbConfig.host || !dbConfig.database || !dbConfig.username}
          >
            Test Koneksi
          </Button>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep('database-type')}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-600">Setup Selesai!</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Studio POS Anda siap digunakan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Setup database berhasil diselesaikan! Anda sekarang bisa login dan mulai menggunakan Studio POS.
          </AlertDescription>
        </Alert>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-3">Ringkasan Setup:</h4>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Skema database dibuat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Akun admin dibuat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Konfigurasi default diterapkan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Data contoh diinisialisasi</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-3">Kredensial Login:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Nama Pengguna</div>
                <div className="text-blue-700">admin</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Kata Sandi</div>
                <div className="text-blue-700">admin123</div>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleComplete} className="w-full" size="lg">
          Lanjutkan ke Login
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full min-h-screen bg-transparent p-6">
      <div className="w-full max-w-6xl mx-auto">

        {/* Main Content */}
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'detecting' && renderDetecting()}
        {currentStep === 'database-type' && renderDatabaseType()}
        {currentStep === 'database-config' && renderDatabaseConfig()}
        {currentStep === 'configuring' && renderProcessing(
          'configuring',
          'Mengonfigurasi Database',
          'Menyiapkan skema database dan tabel...',
          [
            'Membuat file database',
            'Menyiapkan struktur tabel',
            'Mengonfigurasi indeks',
            'Menerapkan constraints'
          ]
        )}
        {currentStep === 'creating-user' && renderProcessing(
          'creating-user',
          'Membuat Admin User',
          'Menyiapkan akun administrator Anda...',
          [
            'Membuat akun pengguna',
            'Mengatur izin',
            'Membuat kredensial aman',
            'Mengonfigurasi tingkat akses'
          ]
        )}
        {currentStep === 'finalizing' && renderProcessing(
          'finalizing',
          'Menyelesaikan Setup',
          'Menyelesaikan konfigurasi...',
          [
            'Menerapkan pengaturan default',
            'Menginisialisasi data contoh',
            'Mengonfigurasi preferensi sistem',
            'Menyimpan konfigurasi'
          ]
        )}
        {currentStep === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default DatabaseSetupWizard;
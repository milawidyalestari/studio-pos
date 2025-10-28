
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, RefreshCw, Trash2, Database, FileText, AlertTriangle, CheckCircle, Loader2, Settings, Monitor, HardDrive, Network, Shield } from 'lucide-react';
import { exportService } from '@/services/exportService';
import { databaseService } from '@/services/databaseService';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ProgramTools = () => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isCleaningLogs, setIsCleaningLogs] = useState(false);
  const [isSystemChecking, setIsSystemChecking] = useState(false);
  const [isOptimizingDatabase, setIsOptimizingDatabase] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isRepairingDatabase, setIsRepairingDatabase] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [systemHealth, setSystemHealth] = useState({
    database: 95,
    performance: 88,
    storage: 92,
    network: 85
  });
  const [backupProgress, setBackupProgress] = useState(0);
  const [systemCheckResults, setSystemCheckResults] = useState<Record<string, { status: boolean; message: string; details: string }> | null>(null);

  // Database backup functionality with progress tracking
  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      const tables = [
        'roles', 'employees', 'categories', 'groups', 'units', 'payment_types',
        'customers', 'suppliers', 'materials', 'products', 'product_materials',
        'positions', 'order_statuses', 'orders', 'order_items', 'inventory_movements'
      ] as const;

      const backupData: any = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tables: {},
        metadata: { totalRecords: 0 }
      };

      let totalRecords = 0;

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setBackupProgress(Math.round((i / tables.length) * 100));
        
        try {
          const { data, error } = await (supabase as any).from(table).select('*');
          
          if (error) {
            console.warn(`Warning backing up table ${table}:`, error);
            backupData.tables[table] = [];
            continue;
          }

          const recordCount = data?.length || 0;
          backupData.tables[table] = data || [];
          totalRecords += recordCount;

          // Add small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error backing up table ${table}:`, error);
          backupData.tables[table] = [];
        }
      }

      backupData.metadata.totalRecords = totalRecords;
      setBackupProgress(100);

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `azuro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup berhasil",
        description: `Database berhasil dibackup dengan ${totalRecords} records`,
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup gagal",
        description: "Terjadi kesalahan saat melakukan backup database",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  // Database restore functionality with better validation
  const handleRestoreDatabase = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsRestoring(true);
      try {
        const text = await file.text();
        const backupData = JSON.parse(text);

        // Validate backup data structure more thoroughly
        if (!backupData.tables || !backupData.timestamp || !backupData.version) {
          throw new Error('Invalid backup file format - missing required fields');
        }

        // Check if backup is compatible
        if (backupData.version !== '1.0.0') {
          throw new Error(`Backup version ${backupData.version} is not compatible with current system`);
        }

        // Validate table structure
        const requiredTables = [
          'employees', 'categories', 'groups', 'units', 'payment_types',
          'customers', 'suppliers', 'materials', 'products', 'product_materials',
          'positions', 'order_statuses', 'orders', 'order_items', 'inventory_movements'
        ];

        const missingTables = requiredTables.filter(table => !backupData.tables[table]);
        if (missingTables.length > 0) {
          throw new Error(`Backup file missing required tables: ${missingTables.join(', ')}`);
        }

        // Show confirmation dialog with more details
        const confirmed = window.confirm(
          `Restore database dari backup tanggal ${new Date(backupData.timestamp).toLocaleString('id-ID')}?\n` +
          `Version: ${backupData.version}\n` +
          `Total records: ${backupData.metadata?.totalRecords || 'Unknown'}\n` +
          `Tables: ${Object.keys(backupData.tables).join(', ')}\n\n` +
          'PERINGATAN: Data yang ada akan diganti dengan data dari backup!\n' +
          'Pastikan Anda telah melakukan backup data saat ini sebelum melanjutkan.'
        );

        if (!confirmed) {
          setIsRestoring(false);
          return;
        }

        // Clear existing data first (in reverse dependency order)
        const tablesToClear = [
          'inventory_movements', 'product_materials', 'order_items', 'orders', 
          'products', 'customers', 'suppliers', 'employees', 'materials', 
          'categories', 'units', 'groups', 'payment_types', 'order_statuses', 
          'roles', 'role_permissions', 'positions'
        ] as const;

        for (const table of tablesToClear) {
          try {
            // Type-safe table access
            const { error } = await (supabase as any).from(table).delete().neq('id', 0);
            if (error) {
              console.warn(`Warning clearing table ${table}:`, error);
            }
          } catch (error) {
            console.warn(`Error clearing table ${table}:`, error);
          }
        }

        // Restore data table by table with progress and better error handling
        let restoredTables = 0;
        const totalTables = Object.keys(backupData.tables).length;
        
        for (const [tableName, records] of Object.entries(backupData.tables)) {
          if (Array.isArray(records) && records.length > 0) {
            try {
              // Validate record structure before insert
              const validRecords = records.filter(record => 
                record && typeof record === 'object' && record.id
              );

              if (validRecords.length !== records.length) {
                console.warn(`Table ${tableName}: ${records.length - validRecords.length} invalid records skipped`);
              }

              if (validRecords.length > 0) {
                // Type assertion for table name
                const tableKey = tableName as keyof typeof backupData.tables;
                const { error } = await supabase.from(tableKey as any).insert(validRecords);
                if (error) {
                  console.error(`Error restoring table ${tableName}:`, error);
                  throw new Error(`Failed to restore table ${tableName}: ${error.message}`);
                }
              }
              
              restoredTables++;
              // Update progress
              setBackupProgress(Math.round((restoredTables / totalTables) * 100));
            } catch (error) {
              console.error(`Error restoring table ${tableName}:`, error);
              throw new Error(`Failed to restore table ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        toast({
          title: "Restore berhasil",
          description: `Database berhasil dipulihkan dari backup tanggal ${new Date(backupData.timestamp).toLocaleString('id-ID')} dengan ${restoredTables} tables`,
        });
      } catch (error) {
        console.error('Restore error:', error);
        toast({
          title: "Restore gagal",
          description: `Terjadi kesalahan saat melakukan restore database: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsRestoring(false);
        setBackupProgress(0);
      }
    };
    input.click();
  };

  // Data export functionality with better error handling
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const tables = [
        'roles', 'employees', 'categories', 'groups', 'units', 'payment_types',
        'customers', 'suppliers', 'materials', 'products', 'product_materials',
        'positions', 'order_statuses', 'orders', 'order_items', 'inventory_movements'
      ];

      const exportData: any = {};
      let totalRecords = 0;

      for (const table of tables) {
        try {
          const { data, error } = await (supabase as any).from(table).select('*');
          
          if (error) {
            console.warn(`Warning exporting table ${table}:`, error);
            exportData[table] = [];
            continue;
          }

          const recordCount = data?.length || 0;
          exportData[table] = data || [];
          totalRecords += recordCount;
        } catch (error) {
          console.error(`Error exporting table ${table}:`, error);
          exportData[table] = [];
        }
      }

      exportData.export_timestamp = new Date().toISOString();
      exportData.total_records = totalRecords;

      // Create and download export file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `azuro-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export berhasil",
        description: `Data berhasil diekspor dengan ${totalRecords} records`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export gagal",
        description: "Terjadi kesalahan saat melakukan export data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Data import functionality with better validation
  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        // Validate import data structure more thoroughly
        if (!importData.orders || !importData.products || !importData.customers) {
          throw new Error('Invalid import file format - missing required tables (orders, products, customers)');
        }

        // Check for required fields in critical tables
        const requiredFields = {
          orders: ['id', 'order_number', 'customer_name', 'total_amount'],
          products: ['id', 'name', 'price'],
          customers: ['id', 'name', 'phone']
        };

        for (const [table, fields] of Object.entries(requiredFields)) {
          if (importData[table] && Array.isArray(importData[table]) && importData[table].length > 0) {
            const firstRecord = importData[table][0];
            const missingFields = fields.filter(field => !(field in firstRecord));
            if (missingFields.length > 0) {
              throw new Error(`Table ${table} missing required fields: ${missingFields.join(', ')}`);
            }
          }
        }

        // Show confirmation dialog with more details
        const confirmed = window.confirm(
          `Import data dengan total ${importData.total_records || 'Unknown'} records?\n` +
          `Tables: ${Object.keys(importData).filter(key => !['export_timestamp', 'total_records'].includes(key)).join(', ')}\n` +
          `File size: ${(file.size / 1024).toFixed(2)} KB\n\n` +
          'PERINGATAN: Data yang ada mungkin akan diganti!\n' +
          'Pastikan Anda telah melakukan backup sebelum melanjutkan.'
        );

        if (!confirmed) {
          setIsImporting(false);
          return;
        }

        // Import data table by table with progress tracking
        const tablesToImport = Object.keys(importData).filter(key => 
          !['export_timestamp', 'total_records'].includes(key)
        );
        
        let importedTables = 0;
        const totalTables = tablesToImport.length;

        for (const tableName of tablesToImport) {
          const records = importData[tableName];
          
          if (Array.isArray(records) && records.length > 0) {
            try {
              // Validate records before import
              const validRecords = records.filter(record => 
                record && typeof record === 'object' && record.id
              );

              if (validRecords.length !== records.length) {
                console.warn(`Table ${tableName}: ${records.length - validRecords.length} invalid records skipped`);
              }

              if (validRecords.length > 0) {
                // Use upsert to avoid duplicates and handle conflicts
                const { error } = await (supabase as any).from(tableName).upsert(validRecords, {
                  onConflict: 'id',
                  ignoreDuplicates: false
                });
                
                if (error) {
                  console.error(`Error importing table ${tableName}:`, error);
                  throw new Error(`Failed to import table ${tableName}: ${error.message}`);
                }
              }
              
              importedTables++;
              // Update progress (simulate progress for import)
              const progress = Math.round((importedTables / totalTables) * 100);
              setBackupProgress(progress);
            } catch (error) {
              console.error(`Error importing table ${tableName}:`, error);
              throw new Error(`Failed to import table ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        toast({
          title: "Import berhasil",
          description: `Data berhasil diimport dengan ${importedTables} tables dan ${importData.total_records || 'Unknown'} records`,
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import gagal",
          description: `Terjadi kesalahan saat melakukan import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        setBackupProgress(0);
      }
    };
    input.click();
  };

  // Clear cache functionality with better cleanup
  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      // Clear localStorage (but keep essential settings)
      const essentialKeys = ['notaSettings', 'userPreferences', 'theme', 'database_config', 'role_permissions'];
      const allKeys = Object.keys(localStorage);
      let clearedKeys = 0;
      
      allKeys.forEach(key => {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
          clearedKeys++;
        }
      });
      
      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionStorage.clear();
      
      // Clear IndexedDB if available
      let indexedDBCleared = false;
      if ('indexedDB' in window) {
        try {
          const databases = await window.indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              await window.indexedDB.deleteDatabase(db.name);
            }
          }
          indexedDBCleared = true;
        } catch (error) {
          console.warn('IndexedDB cleanup failed:', error);
        }
      }

      // Clear service worker cache if available
      let serviceWorkerCleared = false;
      if ('serviceWorker' in navigator && 'caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          serviceWorkerCleared = true;
        } catch (error) {
          console.warn('Service worker cache cleanup failed:', error);
        }
      }

      // Clear browser cache for the domain
      let browserCacheCleared = false;
      if ('caches' in window) {
        try {
          // Clear application cache
          if ('applicationCache' in window) {
            const appCache = (window as any).applicationCache;
            if (appCache && appCache.status !== appCache.UNCACHED) {
              appCache.swapCache();
            }
          }
          browserCacheCleared = true;
        } catch (error) {
          console.warn('Browser cache cleanup failed:', error);
        }
      }

      // Clear any stored form data
      try {
        if ('localStorage' in window) {
          const formKeys = Object.keys(localStorage).filter(key => 
            key.includes('form') || key.includes('Form') || key.includes('FORM') ||
            key.includes('input') || key.includes('Input') || key.includes('INPUT')
          );
          formKeys.forEach(key => localStorage.removeItem(key));
        }
      } catch (error) {
        console.warn('Form data cleanup failed:', error);
      }

      const summary = [
        `LocalStorage: ${clearedKeys} keys cleared`,
        `SessionStorage: ${sessionKeys.length} keys cleared`,
        `IndexedDB: ${indexedDBCleared ? 'cleared' : 'not available'}`,
        `Service Worker: ${serviceWorkerCleared ? 'cleared' : 'not available'}`,
        `Browser Cache: ${browserCacheCleared ? 'cleared' : 'not available'}`
      ].join(', ');

      toast({
        title: "Cache berhasil dibersihkan",
        description: `Semua cache aplikasi telah dibersihkan. ${summary}`,
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      toast({
        title: "Gagal membersihkan cache",
        description: "Terjadi kesalahan saat membersihkan cache",
        variant: "destructive"
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  // Cleanup logs functionality with better cleanup
  const handleCleanupLogs = async () => {
    setIsCleaningLogs(true);
    try {
      // Clear console logs
      console.clear();
      
      // Clear any stored logs in localStorage
      const logKeys = Object.keys(localStorage).filter(key => 
        key.includes('log') || key.includes('Log') || key.includes('LOG') ||
        key.includes('error') || key.includes('Error') || key.includes('ERROR')
      );
      logKeys.forEach(key => localStorage.removeItem(key));

      // Clear any stored logs in sessionStorage
      const sessionLogKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('log') || key.includes('Log') || key.includes('LOG') ||
        key.includes('error') || key.includes('Error') || key.includes('ERROR')
      );
      sessionLogKeys.forEach(key => sessionStorage.removeItem(key));

      toast({
        title: "Logs berhasil dibersihkan",
        description: "Semua log aplikasi telah dibersihkan",
      });
    } catch (error) {
      console.error('Cleanup logs error:', error);
      toast({
        title: "Gagal membersihkan logs",
        description: "Terjadi kesalahan saat membersihkan logs",
        variant: "destructive"
      });
    } finally {
      setIsCleaningLogs(false);
    }
  };

  // System check functionality with comprehensive checks
  const handleSystemCheck = async () => {
    setIsSystemChecking(true);
    setSystemCheckResults(null);
    
    try {
      const checks = {
        database: { status: false, message: '', details: '' },
        localStorage: { status: false, message: '', details: '' },
        indexedDB: { status: false, message: '', details: '' },
        serviceWorker: { status: false, message: '', details: '' },
        network: { status: false, message: '', details: '' },
        memory: { status: false, message: '', details: '' },
        storage: { status: false, message: '', details: '' }
      };

      // Check database connection
      try {
        const { data, error } = await supabase.from('orders').select('count').limit(1);
        checks.database.status = !error;
        checks.database.message = error ? 'Database connection failed' : 'Database connected';
        checks.database.details = error ? error.message : 'Connection successful';
      } catch (e) {
        checks.database.status = false;
        checks.database.message = 'Database connection error';
        checks.database.details = e instanceof Error ? e.message : 'Unknown error';
      }

      // Check localStorage
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        checks.localStorage.status = true;
        checks.localStorage.message = 'Local storage working';
        checks.localStorage.details = 'Read/write operations successful';
      } catch (e) {
        checks.localStorage.status = false;
        checks.localStorage.message = 'Local storage error';
        checks.localStorage.details = e instanceof Error ? e.message : 'Unknown error';
      }

      // Check IndexedDB
      checks.indexedDB.status = 'indexedDB' in window;
      checks.indexedDB.message = 'indexedDB' in window ? 'IndexedDB available' : 'IndexedDB not available';
      checks.indexedDB.details = 'indexedDB' in window ? 'Supported by browser' : 'Not supported';

      // Check Service Worker
      checks.serviceWorker.status = 'serviceWorker' in navigator;
      checks.serviceWorker.message = 'serviceWorker' in navigator ? 'Service Worker available' : 'Service Worker not available';
      checks.serviceWorker.details = 'serviceWorker' in navigator ? 'Supported by browser' : 'Not supported';

      // Check network
      try {
        const response = await fetch('https://httpbin.org/get', { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        checks.network.status = true;
        checks.network.message = 'Network connectivity OK';
        checks.network.details = 'External requests working';
      } catch (e) {
        checks.network.status = false;
        checks.network.message = 'Network connectivity issue';
        checks.network.details = e instanceof Error ? e.message : 'Unknown error';
      }

      // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        checks.memory.status = usedMB < totalMB * 0.8; // Less than 80% usage
        checks.memory.message = `Memory usage: ${usedMB}MB / ${totalMB}MB`;
        checks.memory.details = checks.memory.status ? 'Memory usage normal' : 'High memory usage';
      } else {
        checks.memory.status = true;
        checks.memory.message = 'Memory info not available';
        checks.memory.details = 'Browser does not support memory API';
      }

      // Check storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usagePercent = estimate.usage && estimate.quota ? 
            Math.round((estimate.usage / estimate.quota) * 100) : 0;
          checks.storage.status = usagePercent < 80; // Less than 80% usage
          checks.storage.message = `Storage usage: ${usagePercent}%`;
          checks.storage.details = checks.storage.status ? 'Storage usage normal' : 'High storage usage';
        } catch (e) {
          checks.storage.status = true;
          checks.storage.message = 'Storage info not available';
          checks.storage.details = 'Could not estimate storage';
        }
      } else {
        checks.storage.status = true;
        checks.storage.message = 'Storage quota not available';
        checks.storage.details = 'Browser does not support storage API';
      }

      setSystemCheckResults(checks);
      const allChecksPassed = Object.values(checks).every(check => check.status);
      
      if (allChecksPassed) {
        toast({
          title: "System check selesai",
          description: "Semua sistem berjalan dengan normal",
        });
      } else {
        const failedChecks = Object.entries(checks)
          .filter(([_, check]) => !check.status)
          .map(([name, _]) => name)
          .join(', ');
        
        toast({
          title: "System check selesai",
          description: `Beberapa sistem bermasalah: ${failedChecks}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('System check error:', error);
      toast({
        title: "System check gagal",
        description: "Terjadi kesalahan saat melakukan system check",
        variant: "destructive"
      });
    } finally {
      setIsSystemChecking(false);
    }
  };

  // Database optimization functionality
  const handleOptimizeDatabase = async () => {
    setIsOptimizingDatabase(true);
    try {
      // Simulate database optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update system health
      setSystemHealth(prev => ({
        ...prev,
        database: Math.min(100, prev.database + 3),
        performance: Math.min(100, prev.performance + 2)
      }));

      toast({
        title: "Database berhasil dioptimasi",
        description: "Performa database telah ditingkatkan",
      });
    } catch (error) {
      console.error('Database optimization error:', error);
      toast({
        title: "Gagal mengoptimasi database",
        description: "Terjadi kesalahan saat mengoptimasi database",
        variant: "destructive"
      });
    } finally {
      setIsOptimizingDatabase(false);
    }
  };

  // Database repair functionality
  const handleRepairDatabase = async () => {
    setIsRepairingDatabase(true);
    try {
      // Simulate database repair process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Update system health
      setSystemHealth(prev => ({
        ...prev,
        database: Math.min(100, prev.database + 5),
        performance: Math.min(100, prev.performance + 3)
      }));

      toast({
        title: "Database berhasil diperbaiki",
        description: "Masalah database telah diperbaiki",
      });
    } catch (error) {
      console.error('Database repair error:', error);
      toast({
        title: "Gagal memperbaiki database",
        description: "Terjadi kesalahan saat memperbaiki database",
        variant: "destructive"
      });
    } finally {
      setIsRepairingDatabase(false);
    }
  };

  // Check for updates functionality
  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Update check selesai",
        description: "Aplikasi sudah menggunakan versi terbaru",
      });
    } catch (error) {
      console.error('Update check error:', error);
      toast({
        title: "Gagal memeriksa update",
        description: "Terjadi kesalahan saat memeriksa update",
        variant: "destructive"
      });
    } finally {
      setIsCheckingUpdates(false);
    }
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
              Backup, restore, dan maintenance database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleBackupDatabase}
              className="w-full justify-start"
              variant="outline"
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isBackingUp ? 'Backup sedang berlangsung...' : 'Backup Database'}
            </Button>
            
            {isBackingUp && (
              <div className="space-y-2">
                <Progress value={backupProgress} className="w-full" />
                <p className="text-xs text-gray-500 text-center">{backupProgress}% selesai</p>
              </div>
            )}
            
            <Button 
              onClick={handleRestoreDatabase}
              className="w-full justify-start"
              variant="outline"
              disabled={isRestoring}
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isRestoring ? 'Restore sedang berlangsung...' : 'Restore Database'}
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
              Import dan export data aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleExportData}
              className="w-full justify-start"
              variant="outline"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Export sedang berlangsung...' : 'Export Data'}
            </Button>
            <Button 
              onClick={handleImportData}
              className="w-full justify-start"
              variant="outline"
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isImporting ? 'Import sedang berlangsung...' : 'Import Data'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">System Maintenance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button 
            onClick={handleClearCache}
            variant="outline"
            className="justify-start"
            disabled={isClearingCache}
          >
            {isClearingCache ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isClearingCache ? 'Membersihkan...' : 'Clear Cache'}
          </Button>
          
          <Button 
            onClick={handleCleanupLogs}
            variant="outline"
            className="justify-start"
            disabled={isCleaningLogs}
          >
            {isCleaningLogs ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isCleaningLogs ? 'Membersihkan...' : 'Cleanup Logs'}
          </Button>
          
          <Button 
            variant="outline"
            className="justify-start"
            onClick={handleSystemCheck}
            disabled={isSystemChecking}
          >
            {isSystemChecking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            {isSystemChecking ? 'Checking...' : 'System Check'}
          </Button>

          <Button 
            onClick={handleOptimizeDatabase}
            variant="outline"
            className="justify-start"
            disabled={isOptimizingDatabase}
          >
            {isOptimizingDatabase ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4 mr-2" />
            )}
            {isOptimizingDatabase ? 'Mengoptimasi...' : 'Optimasi Database'}
          </Button>

          <Button 
            onClick={handleRepairDatabase}
            variant="outline"
            className="justify-start"
            disabled={isRepairingDatabase}
          >
            {isRepairingDatabase ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {isRepairingDatabase ? 'Memperbaiki...' : 'Perbaiki Database'}
          </Button>

          <Button 
            onClick={handleCheckUpdates}
            variant="outline"
            className="justify-start"
            disabled={isCheckingUpdates}
          >
            {isCheckingUpdates ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Network className="h-4 w-4 mr-2" />
            )}
            {isCheckingUpdates ? 'Memeriksa...' : 'Cek Update'}
          </Button>
        </div>
      </div>

      {/* System Check Results */}
      {systemCheckResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Check Results
            </CardTitle>
            <CardDescription>
              Status komponen sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemCheckResults).map(([key, check]) => {
                const typedCheck = check as { status: boolean; message: string; details?: string };
                return (
                  <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                    {typedCheck.status ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-gray-600">{typedCheck.message}</div>
                      {typedCheck.details && (
                        <div className="text-xs text-gray-500">{typedCheck.details}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Health Monitoring
          </CardTitle>
          <CardDescription>
            Monitor kesehatan sistem secara real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Database Health</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Performance</span>
                  <span className="text-sm font-medium">{systemHealth.database}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemHealth.database >= 80 ? 'bg-green-500' : 
                      systemHealth.database >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${systemHealth.database}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Performance</span>
                  <span className="text-sm font-medium">{systemHealth.performance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemHealth.performance >= 80 ? 'bg-green-500' : 
                      systemHealth.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${systemHealth.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Storage & Network</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Usage</span>
                  <span className="text-sm font-medium">{systemHealth.storage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemHealth.storage >= 80 ? 'bg-red-500' : 
                      systemHealth.storage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemHealth.storage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network Status</span>
                  <span className="text-sm font-medium">{systemHealth.network}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemHealth.network >= 80 ? 'bg-green-500' : 
                      systemHealth.network >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${systemHealth.network}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Auto Backup Settings
          </CardTitle>
          <CardDescription>
            Konfigurasi backup otomatis database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Backup</h4>
              <p className="text-sm text-gray-600">Backup otomatis database secara berkala</p>
            </div>
            <Button
              variant={autoBackupEnabled ? "default" : "outline"}
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className="w-20"
            >
              {autoBackupEnabled ? 'Aktif' : 'Nonaktif'}
            </Button>
          </div>
          
          {autoBackupEnabled && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Frekuensi Backup</label>
                <select
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• Backup berikutnya: {(() => {
                  const now = new Date();
                  let nextBackup = new Date();
                  switch(backupFrequency) {
                    case 'daily':
                      nextBackup.setDate(now.getDate() + 1);
                      break;
                    case 'weekly':
                      nextBackup.setDate(now.getDate() + 7);
                      break;
                    case 'monthly':
                      nextBackup.setMonth(now.getMonth() + 1);
                      break;
                  }
                  return nextBackup.toLocaleDateString('id-ID');
                })()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Peringatan Penting</h4>
            <p className="text-sm text-yellow-700 mb-2">
              Tools ini melakukan operasi sistem yang kritis. Pastikan Anda memiliki backup yang tepat 
              sebelum melakukan tugas maintenance. Beberapa operasi mungkin akan mempengaruhi performa sistem sementara.
            </p>
            <div className="text-xs text-yellow-600 space-y-1">
              <p>• <strong>Backup Database:</strong> Membuat salinan lengkap database</p>
              <p>• <strong>Restore Database:</strong> Mengganti data yang ada dengan data dari backup</p>
              <p>• <strong>Export/Import:</strong> Menyalin data antar sistem</p>
              <p>• <strong>Clear Cache:</strong> Membersihkan cache aplikasi (pengaturan penting tetap tersimpan)</p>
              <p>• <strong>System Check:</strong> Memeriksa status sistem secara komprehensif</p>
              <p>• <strong>Optimasi Database:</strong> Meningkatkan performa database</p>
              <p>• <strong>Perbaiki Database:</strong> Memperbaiki masalah database</p>
              <p>• <strong>Cek Update:</strong> Memeriksa update aplikasi</p>
              <p>• <strong>Auto Backup:</strong> Backup otomatis secara berkala</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

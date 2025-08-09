import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Cloud, 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { DatabaseInitService } from '@/services/databaseInitService';

interface DatabaseStatusProps {
  className?: string;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ className }) => {
  const [dbInfo, setDbInfo] = useState<{
    type: 'local' | 'supabase';
    transactionCount: number;
    categoryCount: number;
    isConnected: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkStatus = async () => {
    setLoading(true);
    try {
      const info = await DatabaseInitService.getDatabaseInfo();
      setDbInfo(info);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check database status:', error);
      setDbInfo({
        type: 'local',
        transactionCount: 0,
        categoryCount: 0,
        isConnected: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!dbInfo?.isConnected) return <XCircle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Checking...</Badge>;
    if (!dbInfo?.isConnected) return <Badge className="bg-red-100 text-red-800">Disconnected</Badge>;
    return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
  };

  const getDatabaseIcon = () => {
    if (dbInfo?.type === 'supabase') return <Cloud className="h-5 w-5 text-blue-600" />;
    return <HardDrive className="h-5 w-5 text-gray-600" />;
  };

  const getDatabaseLabel = () => {
    if (dbInfo?.type === 'supabase') return 'Supabase (Cloud)';
    return 'Local Storage';
  };

  const getDatabaseDescription = () => {
    if (dbInfo?.type === 'supabase') {
      return 'Data tersimpan di cloud database dengan sinkronisasi real-time';
    }
    return 'Data tersimpan di browser local storage';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Connection Status</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Database Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getDatabaseIcon()}
            <div>
              <div className="font-medium">{getDatabaseLabel()}</div>
              <div className="text-xs text-gray-500">{getDatabaseDescription()}</div>
            </div>
          </div>
        </div>

        {/* Data Statistics */}
        {dbInfo && dbInfo.isConnected && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dbInfo.transactionCount}</div>
              <div className="text-xs text-gray-600">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dbInfo.categoryCount}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Development Info */}
        {dbInfo?.type === 'local' && (
          <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Development Mode</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Configure Supabase credentials in .env.local untuk cloud database
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && !dbInfo?.isConnected && (
          <div className="p-3 bg-red-50 rounded-md border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connection Failed</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Database connection could not be established. Check your configuration.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;
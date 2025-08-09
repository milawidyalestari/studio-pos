import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { databaseManager } from '@/lib/database-manager';
import { dataAccess } from '@/lib/data-access';

export default function DatabaseDebug() {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDatabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check database info
      const info = await databaseManager.getInfo();
      setDbInfo(info);
      console.log('Database Info:', info);

      // Check orders
      const ordersData = await dataAccess.getOrders();
      setOrders(ordersData);
      console.log('Orders Data:', ordersData);
      
    } catch (err) {
      console.error('Database check error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Debug Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={checkDatabase} disabled={isLoading} size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {/* Database Info */}
          {dbInfo && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Database Type:</strong> {dbInfo.type} |
                <strong> Connected:</strong> {dbInfo.isConnected ? 'Yes' : 'No'} |
                <strong> Mode:</strong> {dbInfo.mode}
                {dbInfo.version && ` | <strong>Version:</strong> ${dbInfo.version}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Orders Count */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Total Orders: {orders.length}
            </Badge>
          </div>

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Orders:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {orders.map((order, index) => (
                  <div key={order.id || index} className="text-sm p-2 bg-gray-50 rounded">
                    <strong>{order.order_number}</strong> - {order.customer_name} - 
                    Status: {order.status_id} - Total: {order.total_amount}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data */}
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Raw Database Info</summary>
            <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
              {JSON.stringify(dbInfo, null, 2)}
            </pre>
          </details>

          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Raw Orders Data</summary>
            <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
              {JSON.stringify(orders, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}


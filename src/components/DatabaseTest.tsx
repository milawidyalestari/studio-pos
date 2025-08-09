import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Database, Plus, Search, Edit, Trash } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  data?: any;
  error?: string;
}

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    // Get database info on component mount
    getDatabaseInfo();
  }, []);

  const getDatabaseInfo = async () => {
    try {
      if ((window as any).electronAPI?.database) {
        const info = await (window as any).electronAPI.database.getInfo();
        setDbInfo(info);
      }
    } catch (error) {
      console.error('Failed to get database info:', error);
    }
  };

  const runDatabaseTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    try {
      // Test 1: Create Operation
      console.log('📝 Test 1: Create Operation');
      const testCustomer = {
        id: `test-customer-${Date.now()}`,
        kode: `CUST${Date.now()}`,
        nama: 'Test Customer',
        whatsapp: '08123456789',
        level: 'Regular'
      };
      
      const createdCustomer = await (window as any).electronAPI.database.create('customers', testCustomer);
      console.log('✅ Create successful:', createdCustomer.nama);
      results.push({ test: 'Create Operation', status: 'PASS', data: createdCustomer });
      
      // Test 2: Read Operation
      console.log('📖 Test 2: Read Operation');
      const customers = await (window as any).electronAPI.database.query('customers', {
        where: { kode: testCustomer.kode }
      });
      console.log('✅ Read successful:', customers.length, 'records found');
      results.push({ test: 'Read Operation', status: 'PASS', data: customers });
      
      // Test 3: Update Operation
      console.log('✏️ Test 3: Update Operation');
      const updatedCustomer = await (window as any).electronAPI.database.update('customers', testCustomer.id, {
        nama: 'Updated Test Customer',
        level: 'Premium'
      });
      console.log('✅ Update successful:', updatedCustomer.nama);
      results.push({ test: 'Update Operation', status: 'PASS', data: updatedCustomer });
      
      // Test 4: Query with Options
      console.log('🔍 Test 4: Query with Options');
      const allCustomers = await (window as any).electronAPI.database.query('customers', {
        orderBy: { column: 'nama', direction: 'ASC' },
        limit: 10
      });
      console.log('✅ Query with options successful:', allCustomers.length, 'records');
      results.push({ test: 'Query with Options', status: 'PASS', data: allCustomers });
      
      // Test 5: Transaction Operation
      console.log('💾 Test 5: Transaction Operation');
      const transactionResult = await (window as any).electronAPI.database.transaction([
        {
          type: 'create',
          table: 'products',
          data: {
            id: `test-product-${Date.now()}`,
            kode: `PROD${Date.now()}`,
            jenis: 'Test Product',
            nama: 'Test Product Name',
            satuan: 'PCS',
            harga_beli: 1000,
            harga_jual: 1500
          }
        }
      ]);
      console.log('✅ Transaction successful:', transactionResult.length, 'operations completed');
      results.push({ test: 'Transaction Operation', status: 'PASS', data: transactionResult });
      
      // Test 6: Delete Operation
      console.log('🗑️ Test 6: Delete Operation');
      await (window as any).electronAPI.database.delete('customers', testCustomer.id);
      console.log('✅ Delete successful');
      results.push({ test: 'Delete Operation', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      results.push({ test: 'Error', status: 'FAIL', error: error.message });
    }
    
    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: 'PASS' | 'FAIL') => {
    return status === 'PASS' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: 'PASS' | 'FAIL') => {
    return status === 'PASS' ? 
      <Badge variant="default" className="bg-green-500">PASS</Badge> : 
      <Badge variant="destructive">FAIL</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Operations Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database Info */}
          {dbInfo && (
            <Alert>
              <AlertDescription>
                <strong>Database Type:</strong> {dbInfo.type} | 
                <strong> Connected:</strong> {dbInfo.connected ? 'Yes' : 'No'}
                {dbInfo.currentTime && ` | <strong>Time:</strong> ${dbInfo.currentTime}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Test Button */}
          <Button 
            onClick={runDatabaseTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Run Database Tests
              </>
            )}
          </Button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              {testResults.map((result, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  {result.error && (
                    <p className="text-red-500 text-sm mt-2">{result.error}</p>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">View Data</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </Card>
              ))}
              
              {/* Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Summary:</span>
                    <div className="flex gap-2">
                      <Badge variant="default" className="bg-green-500">
                        {testResults.filter(r => r.status === 'PASS').length} Passed
                      </Badge>
                      <Badge variant="destructive">
                        {testResults.filter(r => r.status === 'FAIL').length} Failed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


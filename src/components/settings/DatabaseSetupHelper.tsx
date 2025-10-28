import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { databaseService } from '@/services/databaseService';
import { CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';

export const DatabaseSetupHelper = () => {
  const [tableStatus, setTableStatus] = useState<{
    roles: boolean;
    role_permissions: boolean;
    loading: boolean;
  }>({
    roles: false,
    role_permissions: false,
    loading: true
  });

  const [setupStatus, setSetupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Check if tables exist
  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    try {
      setTableStatus(prev => ({ ...prev, loading: true }));

      // Check roles table
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .limit(1);

      // Check role_permissions table
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('*')
        .limit(1);

      setTableStatus({
        roles: !rolesError,
        role_permissions: !permissionsError,
        loading: false
      });

      if (rolesError) {
        // Roles table error
      }
      if (permissionsError) {
        // Role permissions table error
      }

    } catch (error) {
      console.error('Error checking tables:', error);
      setTableStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const createRolePermissionsTable = async () => {
    setSetupStatus('creating');
    setErrorMessage('');

    try {
      // Create role_permissions table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS role_permissions (
          id serial PRIMARY KEY,
          role varchar(50) NOT NULL,
          menu varchar(50) NOT NULL,
          action varchar(50) NOT NULL,
          allowed boolean DEFAULT true,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          UNIQUE(role, menu, action)
        );
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });

      if (createError) {
        throw createError;
      }

      // Add indexes
      const indexSQL = `
        CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
        CREATE INDEX IF NOT EXISTS idx_role_permissions_menu ON role_permissions(menu);
        CREATE INDEX IF NOT EXISTS idx_role_permissions_action ON role_permissions(action);
      `;

      await supabase.rpc('exec_sql', { sql: indexSQL });

      // Insert default permissions for Administrator
      const adminPermissions = [
        ['Administrator', 'Dashboard', 'view_stats'],
        ['Administrator', 'Dashboard', 'view_orders'],
        ['Administrator', 'Dashboard', 'view_income'],
        ['Administrator', 'Dashboard', 'view_calendar'],
        ['Administrator', 'Dashboard', 'view_inbox'],
        ['Administrator', 'Orderan', 'view_orders'],
        ['Administrator', 'Orderan', 'create_order'],
        ['Administrator', 'Orderan', 'edit_order'],
        ['Administrator', 'Orderan', 'delete_order'],
        ['Administrator', 'Orderan', 'print_spk'],
        ['Administrator', 'Orderan', 'print_nota'],
        ['Administrator', 'Orderan', 'change_status'],
        ['Administrator', 'Transaction', 'view_transactions'],
        ['Administrator', 'Transaction', 'print_receipt'],
        ['Administrator', 'Transaction', 'export_data'],
        ['Administrator', 'Transaction', 'filter_data'],
        ['Administrator', 'Finance', 'view_finance'],
        ['Administrator', 'Finance', 'view_profit_loss'],
        ['Administrator', 'Finance', 'view_cash_flow'],
        ['Administrator', 'Finance', 'manage_expenses'],
        ['Administrator', 'Finance', 'financial_reports'],
        ['Administrator', 'Inventory', 'view_inventory'],
        ['Administrator', 'Inventory', 'add_stock'],
        ['Administrator', 'Inventory', 'adjust_stock'],
        ['Administrator', 'Inventory', 'view_materials'],
        ['Administrator', 'Inventory', 'manage_stock_minimum'],
        ['Administrator', 'Master Data', 'view_products'],
        ['Administrator', 'Master Data', 'manage_products'],
        ['Administrator', 'Master Data', 'view_customers'],
        ['Administrator', 'Master Data', 'manage_customers'],
        ['Administrator', 'Master Data', 'view_suppliers'],
        ['Administrator', 'Master Data', 'manage_suppliers'],
        ['Administrator', 'Master Data', 'view_employees'],
        ['Administrator', 'Master Data', 'manage_employees'],
        ['Administrator', 'Report', 'view_reports'],
        ['Administrator', 'Report', 'daily_reports'],
        ['Administrator', 'Report', 'monthly_reports'],
        ['Administrator', 'Report', 'export_reports'],
        ['Administrator', 'Report', 'financial_analysis'],
        ['Administrator', 'Settings', 'view_settings'],
        ['Administrator', 'Settings', 'program_settings'],
        ['Administrator', 'Settings', 'database_settings'],
        ['Administrator', 'Settings', 'hardware_settings'],
        ['Administrator', 'Settings', 'user_management'],
        ['Administrator', 'Settings', 'role_management'],
        ['Administrator', 'Settings', 'system_tools']
      ];

      const permissionsToInsert = adminPermissions.map(([role, menu, action]) => ({
        role,
        menu,
        action,
        allowed: true
      }));

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToInsert);

      if (insertError) {
        console.error('Error inserting permissions:', insertError);
        // Non-fatal error, continue
      }

      setSetupStatus('success');
      await checkTables(); // Refresh status

    } catch (error) {
      console.error('Setup error:', error);
      setErrorMessage(error.message || 'Unknown error occurred');
      setSetupStatus('error');
    }
  };

  const addOwnerRole = async () => {
    try {
      // Add Owner role to roles table
      const { error } = await supabase
        .from('roles')
        .insert([
          { name: 'Owner', description: 'Pemilik dengan akses monitoring dan laporan' }
        ]);

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      await checkTables();

    } catch (error) {
      console.error('Error adding Owner role:', error);
      setErrorMessage(error.message || 'Error adding Owner role');
    }
  };

  if (tableStatus.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Checking Database Setup...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Memverifikasi tabel database...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {tableStatus.roles ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Roles Table: {tableStatus.roles ? 'Exists' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {tableStatus.role_permissions ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Role Permissions Table: {tableStatus.role_permissions ? 'Exists' : 'Missing'}</span>
          </div>
        </div>

        {/* Alerts and Actions */}
        {!tableStatus.role_permissions && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tabel role_permissions tidak ditemukan. Ini diperlukan untuk sistem role permissions berfungsi.
            </AlertDescription>
          </Alert>
        )}

        {!tableStatus.roles && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tabel roles tidak ditemukan. Pastikan migration sudah dijalankan.
            </AlertDescription>
          </Alert>
        )}

        {setupStatus === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Error: {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {setupStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Database setup berhasil! Role permissions system sekarang aktif.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!tableStatus.role_permissions && (
            <Button 
              onClick={createRolePermissionsTable}
              disabled={setupStatus === 'creating'}
            >
              {setupStatus === 'creating' ? 'Creating...' : 'Create Role Permissions Table'}
            </Button>
          )}

          {tableStatus.roles && (
            <Button 
              onClick={addOwnerRole}
              variant="outline"
            >
              Add Owner Role
            </Button>
          )}

          <Button onClick={checkTables} variant="outline">
            Refresh Status
          </Button>
        </div>

        {/* Manual Setup Instructions */}
        {!tableStatus.role_permissions && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Manual Setup (Alternative):</h4>
            <p className="text-sm text-gray-600 mb-2">
              Jika tombol di atas tidak bekerja, jalankan SQL ini di Supabase Dashboard:
            </p>
            <pre className="text-xs bg-white p-2 border rounded overflow-x-auto">
{`-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS role_permissions (
  id serial PRIMARY KEY,
  role varchar(50) NOT NULL,
  menu varchar(50) NOT NULL,
  action varchar(50) NOT NULL,
  allowed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, menu, action)
);`}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

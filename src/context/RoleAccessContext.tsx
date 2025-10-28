import React, { createContext, useContext, useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

interface Permission {
  menu: string;
  action: string;
  allowed: boolean;
}

interface RoleAccessContextType {
  permissions: Permission[];
  userRole: string;
  refresh: (role: string) => Promise<void>;
}

export const RoleAccessContext = createContext<RoleAccessContextType>({ permissions: [], userRole: '', refresh: async () => {} });

export function RoleAccessProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState('');

  // Fetch permissions saat login atau role berubah
  const refresh = async (role: string) => {
    setUserRole(role);
    
    // For Administrator, give full access without database check
    if (role === 'Administrator') {
      setPermissions([]); // Empty array, but hasAccess will handle this
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('menu, action, allowed')
        .eq('role', role)
        .eq('allowed', true);
      
      if (error) {
        console.error('❌ Error fetching permissions:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // For non-admin roles, if database error, give basic access
        if (role === 'Manager' || role === 'Cashier') {
          setPermissions([
            { menu: 'Dashboard', action: 'view_stats', allowed: true },
            { menu: 'Orderan', action: 'view_orders', allowed: true },
            { menu: 'Transaction', action: 'view_transactions', allowed: true },
            { menu: 'Inventory', action: 'view_inventory', allowed: true },
            { menu: 'Master Data', action: 'view_products', allowed: true },
            { menu: 'Report', action: 'view_reports', allowed: true },
            { menu: 'Settings', action: 'view_settings', allowed: true }
          ]);
        } else {
          setPermissions([]);
        }
        
        // Log specific error for troubleshooting
        if (error.code === '42P01') {
          console.error('🚨 Table role_permissions does not exist. Please run the database migration.');
        }
        return;
      }
      
      setPermissions(data || []);
      
    } catch (error) {
      console.error('❌ Fatal error in refresh:', error);
      // Give basic access on error for non-admin roles
      if (role === 'Manager' || role === 'Cashier') {
        setPermissions([
          { menu: 'Dashboard', action: 'view_stats', allowed: true },
          { menu: 'Orderan', action: 'view_orders', allowed: true },
          { menu: 'Transaction', action: 'view_transactions', allowed: true },
          { menu: 'Inventory', action: 'view_inventory', allowed: true },
          { menu: 'Master Data', action: 'view_products', allowed: true },
          { menu: 'Report', action: 'view_reports', allowed: true },
          { menu: 'Settings', action: 'view_settings', allowed: true }
        ]);
      } else {
        setPermissions([]);
      }
    }
  };

  // Tambahkan efek untuk inisialisasi dari localStorage saat mount
  React.useEffect(() => {
    const userStr = localStorage.getItem('azuro_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          refresh(user.role);
        }
      } catch {}
    } else {
      // Default to Administrator if no user found
      refresh('Administrator');
    }
  }, []);

  return (
    <RoleAccessContext.Provider value={{ permissions, userRole, refresh }}>
      {children}
    </RoleAccessContext.Provider>
  );
}

export function useHasAccess() {
  const { permissions, userRole } = useContext(RoleAccessContext);
  return (menu: string, action: string) => {
    // Administrator always has access (even if permissions array is empty due to DB error)
    if (userRole === 'Administrator') {
      return true;
    }
    
    // If no permissions loaded (database error), deny access for non-admin
    if (permissions.length === 0) {
      return false;
    }
    
    // Check specific permission
    const hasPermission = permissions.some(
      (perm) => perm.menu === menu && perm.action === action && perm.allowed
    );
    
    return hasPermission;
  };
} 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    console.log('🔄 RoleAccessContext: Refreshing permissions for role:', role);
    setUserRole(role);
    
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
        setPermissions([]);
        return;
      }
      
      console.log('✅ Fetched permissions from database:', data);
      setPermissions(data || []);
      
    } catch (error) {
      console.error('❌ Fatal error in refresh:', error);
      setPermissions([]);
    }
  };

  // Tambahkan efek untuk inisialisasi dari localStorage saat mount
  React.useEffect(() => {
    const userStr = localStorage.getItem('studio_pos_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          refresh(user.role);
        }
      } catch {}
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
    console.log(`🔍 Checking access: ${menu}.${action} for role: ${userRole}`);
    console.log('Available permissions:', permissions);
    
    // Administrator always has access
    if (userRole === 'Administrator') {
      console.log('✅ Administrator has full access');
      return true;
    }
    
    // Check specific permission
    const hasPermission = permissions.some(
      (perm) => perm.menu === menu && perm.action === action && perm.allowed
    );
    
    console.log(`${hasPermission ? '✅' : '❌'} Access ${hasPermission ? 'granted' : 'denied'} for ${menu}.${action}`);
    return hasPermission;
  };
} 
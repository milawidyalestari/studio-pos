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
    setUserRole(role);
    const { data } = await supabase
      .from('role_permissions')
      .select('menu, action, allowed')
      .eq('role', role)
      .eq('allowed', true);
    setPermissions(data || []);
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
    if (userRole === 'Administrator') return true;
    return permissions.some(
      (perm) => perm.menu === menu && perm.action === action && perm.allowed
    );
  };
} 
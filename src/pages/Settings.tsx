import React from 'react';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { useHasAccess } from '@/context/RoleAccessContext';

const Settings = () => {
  const hasAccess = useHasAccess();
  
  // Check access to Settings page
  if (!hasAccess('Settings', 'view_settings')) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman pengaturan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SettingsTabs />
    </div>
  );
};

export default Settings;
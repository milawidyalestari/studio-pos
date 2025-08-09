import React from 'react';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

const Settings = () => {
  const hasAccess = useHasAccess();
  return (
    <div className="p-6">
      <SettingsTabs />
    </div>
  );
};

export default Settings;
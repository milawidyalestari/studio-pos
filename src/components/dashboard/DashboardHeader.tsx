
import React from 'react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  showInbox: boolean;
  onToggleInbox: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ showInbox, onToggleInbox }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang kembali! Berikut adalah ringkasan performa hari ini</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Chat button removed */}
      </div>
    </div>
  );
};

export default DashboardHeader;

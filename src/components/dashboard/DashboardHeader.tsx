
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface DashboardHeaderProps {
  showInbox: boolean;
  onToggleInbox: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ showInbox, onToggleInbox }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang kembali! Berikut adalah ringkasan performa hari ini</p>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleInbox}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;

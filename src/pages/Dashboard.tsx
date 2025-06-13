
import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [showInbox, setShowInbox] = useState(false);

  return (
    <div className="p-6 space-y-6 h-screen overflow-hidden">
      {/* Header */}
      <DashboardHeader showInbox={showInbox} onToggleInbox={() => setShowInbox(!showInbox)} />

      {/* Stats Grid */}
      <DashboardStats />

      {/* Main Content */}
      <DashboardContent
        selectedDate={selectedDate}
        selectedDeadline={selectedDeadline}
        onDateSelect={setSelectedDate}
        onDeadlineFilterChange={setSelectedDeadline}
      />
    </div>
  );
};

export default Dashboard;

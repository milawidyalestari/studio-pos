
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActiveOrdersTable from '@/components/dashboard/ActiveOrdersTable';
import CalendarSection from '@/components/dashboard/CalendarSection';
import InboxSection from '@/components/dashboard/InboxSection';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [showInbox, setShowInbox] = useState(false);

  return (
    <div className="p-6 space-y-2 h-screen overflow-hidden">
      {/* Header */}
      <DashboardHeader showInbox={showInbox} onToggleInbox={() => setShowInbox(!showInbox)} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0">
        {/* Left Section: Stats and Active Orders */}
        <div className="lg:col-span-3 flex flex-col space-y-2 min-h-0">
          {/* Stats Grid */}
          <DashboardStats />
          
          {/* Active Orders Table */}
          <div className="flex-1 min-h-0">
            <ActiveOrdersTable
              selectedDate={selectedDate}
              selectedDeadline={selectedDeadline}
              onDeadlineFilterChange={setSelectedDeadline}
            />
          </div>
        </div>

        {/* Right Section: Calendar and Inbox */}
        <Card className="lg:col-span-1 flex flex-col">
          {/* Calendar Section */}
          <CalendarSection
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {/* Single Line Divider */}
          <Separator className="mx-6" />

          {/* Inbox Section */}
          <InboxSection />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

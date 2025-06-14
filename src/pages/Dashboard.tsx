
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
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <DashboardHeader showInbox={showInbox} onToggleInbox={() => setShowInbox(!showInbox)} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0 mt-2">
        {/* Left Section: Stats and Active Orders */}
        <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0">
          {/* Stats Grid */}
          <div className="flex-shrink-0">
            <DashboardStats />
          </div>
          
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
        <Card className="lg:col-span-1 flex flex-col min-h-0">
          {/* Calendar Section */}
          <div className="flex-shrink-0">
            <CalendarSection
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* Single Line Divider */}
          <Separator className="flex-shrink-0" />

          {/* Inbox Section */}
          <div className="flex-1 min-h-0">
            <InboxSection />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

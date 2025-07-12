import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActiveOrdersTable from '@/components/dashboard/ActiveOrdersTable';
import CalendarSection from '@/components/dashboard/CalendarSection';
import InboxSection from '@/components/dashboard/InboxSection';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [showInbox, setShowInbox] = useState(false);
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [inboxCollapsed, setInboxCollapsed] = useState(false);

  // Flex logic for stacking and dynamic height
  let calendarFlex = 'min-h-0';
  let inboxFlex = 'min-h-0';
  if (calendarCollapsed && inboxCollapsed) {
    calendarFlex = 'flex-shrink-0 min-h-0';
    inboxFlex = 'flex-shrink-0 min-h-0';
  } else if (calendarCollapsed) {
    calendarFlex = 'flex-shrink-0 min-h-0';
    inboxFlex = 'flex-1 min-h-0';
  } else if (inboxCollapsed) {
    calendarFlex = 'flex-1 min-h-0';
    inboxFlex = 'flex-shrink-0 min-h-0';
  } else {
    calendarFlex = 'flex-shrink-0';
    inboxFlex = 'flex-1 min-h-0';
  }

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-white mb-p4">
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
          <div className={`flex flex-col flex-1 min-h-0`}>
            {/* Calendar Section */}
            <div className={`${calendarFlex} overflow-hidden`}>
              <CalendarSection
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                collapsed={calendarCollapsed}
                onToggleCollapse={() => setCalendarCollapsed((c) => !c)}
              />
              {/* Visual separation */}
              <div className="border-b border-gray-200 mb-1" />
            </div>

            {/* Inbox Section */}
            <div className={`${inboxFlex} overflow-y-auto`}>
              <InboxSection
                collapsed={inboxCollapsed}
                onToggleCollapse={() => setInboxCollapsed((c) => !c)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

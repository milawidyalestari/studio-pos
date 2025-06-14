
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ActiveOrdersTable from './ActiveOrdersTable';
import CalendarSection from './CalendarSection';
import InboxSection from './InboxSection';

interface DashboardContentProps {
  selectedDate: Date | undefined;
  selectedDeadline: string;
  onDateSelect: (date: Date | undefined) => void;
  onDeadlineFilterChange: (filter: string) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  selectedDate,
  selectedDeadline,
  onDateSelect,
  onDeadlineFilterChange
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
      {/* Active Orders - Taking up 3 columns but with shorter height */}
      <div className="lg:col-span-3 h-[400px]">
        <ActiveOrdersTable
          selectedDate={selectedDate}
          selectedDeadline={selectedDeadline}
          onDeadlineFilterChange={onDeadlineFilterChange}
        />
      </div>

      {/* Merged Calendar and Inbox - Taking up 1 column but with taller height */}
      <Card className="lg:col-span-1 flex flex-col min-h-0 h-[500px]">
        {/* Calendar Section */}
        <CalendarSection
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />

        {/* Single Line Divider */}
        <Separator className="mx-6" />

        {/* Inbox Section */}
        <InboxSection />
      </Card>
    </div>
  );
};

export default DashboardContent;

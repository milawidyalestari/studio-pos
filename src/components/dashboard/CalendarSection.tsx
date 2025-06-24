import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarSectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ selectedDate, onDateSelect, collapsed, onToggleCollapse }) => {
  return (
    <>
      <CardHeader className="pb-3 px-4 cursor-pointer select-none" onClick={onToggleCollapse}>
        <CardTitle className="text-lg flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-[#0050C8]" />
          {format(new Date(), 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0 pb-4 px-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="w-full mx-auto"
          />
        </CardContent>
      )}
    </>
  );
};

export default CalendarSection;

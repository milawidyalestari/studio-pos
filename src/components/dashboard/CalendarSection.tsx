import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useOrders } from '@/hooks/useOrders';
import { isSameDay, parseISO } from 'date-fns';

interface CalendarSectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ selectedDate, onDateSelect, collapsed, onToggleCollapse }) => {
  const { orders } = useOrders();

  // Ambil semua tanggal deadline dari order (field estimasi)
  const deadlineDates = (orders || [])
    .map(order => order.estimasi)
    .filter(Boolean)
    .map(dateStr => {
      // Pastikan format Date
      try {
        return parseISO(dateStr);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  // Modifier: hari yang ada deadline
  const modifiers = {
    hasDeadline: (date: Date) => deadlineDates.some(deadline => isSameDay(deadline as Date, date)),
  };

  // Modifier class: biru jika ada deadline, abu-abu jika tidak
  const modifiersClassNames = {
    hasDeadline: 'text-blue-600 font-bold',
    day: 'text-gray-400', // default abu-abu
  };

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
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </CardContent>
      )}
    </>
  );
};

export default CalendarSection;

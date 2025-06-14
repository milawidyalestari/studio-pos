
import React from 'react';
import { Button } from '@/components/ui/button';

interface DeadlineFilterProps {
  selectedDeadline: string;
  onDeadlineFilterChange: (filter: string) => void;
}

const DeadlineFilter: React.FC<DeadlineFilterProps> = ({
  selectedDeadline,
  onDeadlineFilterChange
}) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'overdue', label: 'Overdue' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Deadline:</span>
      <div className="flex space-x-1">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant={selectedDeadline === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDeadlineFilterChange(filter.key)}
            className={selectedDeadline === filter.key ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DeadlineFilter;

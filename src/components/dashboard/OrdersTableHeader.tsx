
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import OrdersTableFilters from './OrdersTableFilters';

interface OrdersTableHeaderProps {
  selectedDeadline: string;
  onDeadlineFilterChange: (filter: string) => void;
}

const OrdersTableHeader: React.FC<OrdersTableHeaderProps> = ({
  selectedDeadline,
  onDeadlineFilterChange
}) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-[#0050C8]" />
          Orderan Aktif
        </CardTitle>
        <OrdersTableFilters
          selectedDeadline={selectedDeadline}
          onDeadlineFilterChange={onDeadlineFilterChange}
        />
      </div>
    </CardHeader>
  );
};

export default OrdersTableHeader;

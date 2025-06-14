
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ActiveOrdersTableProps } from './types';
import { activeOrders } from './mockData';
import { filterOrders } from './utils';
import DeadlineFilter from './DeadlineFilter';
import OrdersTableContent from './OrdersTableContent';

const ActiveOrdersTable: React.FC<ActiveOrdersTableProps> = ({
  selectedDate,
  selectedDeadline,
  onDeadlineFilterChange
}) => {
  const filteredOrders = filterOrders(activeOrders, selectedDate, selectedDeadline);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#0050C8]" />
            Orderan Aktif
          </CardTitle>
          <DeadlineFilter
            selectedDeadline={selectedDeadline}
            onDeadlineFilterChange={onDeadlineFilterChange}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <OrdersTableContent orders={filteredOrders} />
      </CardContent>
    </Card>
  );
};

export default ActiveOrdersTable;

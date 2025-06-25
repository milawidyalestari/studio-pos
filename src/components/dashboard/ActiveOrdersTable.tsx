import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { isSameDay } from 'date-fns';
import OrdersTableHeader from './OrdersTableHeader';
import OrdersTableContent from './OrdersTableContent';

interface Order {
  id: string;
  customer: string;
  tanggal: string;
  deadline: string;
  status: string;
  total: string;
}

interface ActiveOrdersTableProps {
  selectedDate: Date | undefined;
  selectedDeadline: string;
  onDeadlineFilterChange: (filter: string) => void;
}

const ActiveOrdersTable: React.FC<ActiveOrdersTableProps> = ({
  selectedDate,
  selectedDeadline,
  onDeadlineFilterChange
}) => {
  const activeOrders: Order[] = [
    {
      id: '1',
      customer: 'Pak Tut Lanji',
      tanggal: 'June 26, 2025',
      deadline: 'June 26, 2025',
      status: 'Desain',
      total: 'IDR 35.000'
    },
    {
      id: '2',
      customer: 'Sri Asri',
      tanggal: 'June 26, 2025',
      deadline: 'June 26, 2025',
      status: 'Konfirmasi',
      total: 'IDR 25.000'
    },
    {
      id: '3',
      customer: 'Choirull',
      tanggal: 'June 26, 2025',
      deadline: 'June 27, 2025',
      status: 'Cek File',
      total: 'IDR 20.000'
    },
    {
      id: '4',
      customer: 'Matteo',
      tanggal: 'June 26, 2025',
      deadline: 'June 28, 2025',
      status: 'Cek File',
      total: 'IDR 75.000'
    },
    {
      id: '5',
      customer: 'Srimulyadi',
      tanggal: 'June 26, 2025',
      deadline: 'June 29, 2025',
      status: 'Desain',
      total: 'IDR 105.000'
    },
    {
      id: '6',
      customer: 'Unggul Madani',
      tanggal: 'June 26, 2025',
      deadline: 'June 29, 2025',
      status: 'Desain',
      total: 'IDR 87.000'
    }
  ];

  const filteredOrders = activeOrders.filter(order => {
    if (selectedDate) {
      const orderDate = new Date(order.deadline);
      const isDateMatch = isSameDay(orderDate, selectedDate);
      if (!isDateMatch) return false;
    }
    
    if (selectedDeadline !== 'all') {
      const today = new Date();
      const orderDeadline = new Date(order.deadline);
      
      switch (selectedDeadline) {
        case 'today':
          return isSameDay(orderDeadline, today);
        case 'tomorrow': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return isSameDay(orderDeadline, tomorrow);
        }
        case 'overdue':
          return orderDeadline < today;
        default:
          return true;
      }
    }
    
    return true;
  });

  return (
    <Card className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0">
        <OrdersTableHeader
          selectedDeadline={selectedDeadline}
          onDeadlineFilterChange={onDeadlineFilterChange}
        />
      </div>
      <CardContent className="flex-1 min-h-0 pt-0 pb-6">
        <OrdersTableContent orders={filteredOrders} />
      </CardContent>
    </Card>
  );
};

export default ActiveOrdersTable;

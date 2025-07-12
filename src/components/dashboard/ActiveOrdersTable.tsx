import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { isSameDay } from 'date-fns';
import OrdersTableHeader from './OrdersTableHeader';
import OrdersTableContent from './OrdersTableContent';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/services/productPricing';

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
  const { orders, isLoading } = useOrders();

  // Mapping dan filter order dari database
  const filteredOrders = (orders || [])
    .filter(order => {
      // Pastikan status tersedia
      const statusName = order.order_statuses?.name || '';
      return statusName.toLowerCase() !== 'export' && statusName.toLowerCase() !== 'done';
    })
    .filter(order => {
      // Filter berdasarkan tanggal dan deadline seperti sebelumnya
      if (selectedDate) {
        const orderDate = order.estimasi ? new Date(order.estimasi) : null;
        const isDateMatch = orderDate && isSameDay(orderDate, selectedDate);
        if (!isDateMatch) return false;
      }
      if (selectedDeadline !== 'all') {
        const today = new Date();
        const orderDeadline = order.estimasi ? new Date(order.estimasi) : null;
        switch (selectedDeadline) {
          case 'today':
            return orderDeadline && isSameDay(orderDeadline, today);
          case 'tomorrow': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return orderDeadline && isSameDay(orderDeadline, tomorrow);
          }
          case 'overdue':
            return orderDeadline && orderDeadline < today;
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
        {isLoading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : (
          <OrdersTableContent orders={filteredOrders} />
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveOrdersTable;

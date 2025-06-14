
import { isSameDay } from 'date-fns';
import { Order } from './types';

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'desain': return 'bg-yellow-100 text-yellow-800';
    case 'konfirmasi': return 'bg-blue-100 text-blue-800';
    case 'cek file': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const filterOrders = (
  orders: Order[], 
  selectedDate: Date | undefined, 
  selectedDeadline: string
): Order[] => {
  return orders.filter(order => {
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
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return isSameDay(orderDeadline, tomorrow);
        case 'overdue':
          return orderDeadline < today;
        default:
          return true;
      }
    }
    
    return true;
  });
};

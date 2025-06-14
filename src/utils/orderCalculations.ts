
import { OrderItem } from '@/types/order';

export const calculateOrderTotal = (
  items: OrderItem[], 
  jasaDesain: number = 0, 
  biayaLain: number = 0, 
  discount: number = 0, 
  ppn: number = 10
) => {
  const itemsTotal = items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  const subtotal = itemsTotal + jasaDesain + biayaLain;
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * ppn) / 100;
  const total = afterDiscount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    total
  };
};

export const generateNextItemId = (orderList: OrderItem[]) => {
  const nextNumber = orderList.length + 1;
  return nextNumber.toString().padStart(3, '0');
};

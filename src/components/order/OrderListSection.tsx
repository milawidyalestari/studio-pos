import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/services/masterData';

interface OrderItem {
  id: string;
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  subTotal: number;
}

interface OrderListSectionProps {
  orderList: OrderItem[];
  onEditItem: (item: OrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  editingItemId?: string | null;
}

const OrderListSection = ({ orderList, onEditItem, onDeleteItem, editingItemId }: OrderListSectionProps) => {
  return (
    <div className="mb-2">
      <h3 className="text-lg font-semibold mb-2">Order List</h3>
      <div className="border rounded-lg h-48 overflow-hidden">
        <div className="grid grid-cols-6 gap-1 text-xs font-semibold border-b p-2 bg-gray-50">
          <span>No</span>
          <span>Item</span>
          <span>Qty</span>
          <span>Sub Total</span>
          <span>Edit</span>
          <span>Del</span>
        </div>
        <ScrollArea className="h-[calc(100%-2.5rem)]">
          {orderList.map((item, index) => (
            <div 
              key={item.id} 
              className={`grid grid-cols-6 gap-1 text-xs py-2 px-2 border-b transition-all duration-5 ${
                editingItemId === item.id 
                  ? 'bg-blue-200 ' 
                  : 'hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: editingItemId === item.id ? '#dbeafe' : undefined,
                borderColor: editingItemId === item.id ? '#dbeafe' : undefined,
              }}
            >
              <span>{index + 1}</span>
              <span className="truncate" title={item.item}>{item.item}</span>
              <span>{item.quantity}</span>
              <span className="text-green-600 font-semibold">{formatCurrency(item.subTotal)}</span>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => onEditItem(item)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0 text-red-500"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default OrderListSection;

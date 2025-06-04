
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'pending' | 'in-progress' | 'ready' | 'done';
  date: string;
  estimatedDate: string;
}

interface OrderCardProps {
  order: Order;
  provided?: any;
  snapshot?: any;
  onOrderClick?: (order: Order) => void;
}

const OrderCard = ({ order, provided, snapshot, onOrderClick }: OrderCardProps) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'done': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = () => {
    if (onOrderClick) {
      onOrderClick(order);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle edit functionality here
  };

  return (
    <Card 
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        snapshot?.isDragging ? 'shadow-lg' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{order.orderNumber}</CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={handleEditClick}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-2">{order.customer}</p>
        <div className="space-y-1 mb-3">
          {order.items.map((item, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
              {item}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#0050C8]">{order.total}</span>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;

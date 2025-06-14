
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, User } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'pending' | 'in-progress' | 'ready' | 'done';
  date: string;
  estimatedDate: string;
  designer?: {
    name: string;
    avatar?: string;
    assignedBy?: string;
  };
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    <TooltipProvider>
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
          
          {/* Designer Assignment Indicator */}
          {order.designer && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={order.designer.avatar} alt={order.designer.name} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {getInitials(order.designer.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{order.designer.name}</p>
                    {order.designer.assignedBy && (
                      <p className="text-gray-500">Assigned by {order.designer.assignedBy}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-gray-600">
                Assigned to {order.designer.name}
              </span>
            </div>
          )}
          
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
    </TooltipProvider>
  );
};

export default OrderCard;

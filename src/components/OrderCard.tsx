
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Calendar } from 'lucide-react';

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
  onEditOrder?: (order: Order) => void;
}

const OrderCard = ({ order, provided, snapshot, onOrderClick, onEditOrder }: OrderCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getResponsiblePerson = () => {
    // Based on status, determine who's responsible
    switch (order.status) {
      case 'pending':
        return { name: 'Admin', avatar: undefined, role: 'Processing' };
      case 'in-progress':
        return order.designer || { name: 'Designer', avatar: undefined, role: 'Designing' };
      case 'ready':
        return { name: 'Production', avatar: undefined, role: 'Ready for pickup' };
      case 'done':
        return { name: 'Completed', avatar: undefined, role: 'Delivered' };
      default:
        return { name: 'Unassigned', avatar: undefined, role: 'Pending' };
    }
  };

  const formatDeadline = (dateString: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getDeadlineColor = (dateString: string) => {
    if (!dateString) return 'text-gray-500';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 1) return 'text-orange-600';
    if (diffDays <= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const handleCardClick = () => {
    if (onOrderClick) {
      onOrderClick(order);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditOrder) {
      onEditOrder(order);
    }
  };

  const responsiblePerson = getResponsiblePerson();

  return (
    <TooltipProvider>
      <Card 
        ref={provided?.innerRef}
        {...(provided?.draggableProps || {})}
        {...(provided?.dragHandleProps || {})}
        className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${
          snapshot?.isDragging ? 'shadow-lg rotate-2' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium text-gray-900 mb-1">
                {order.customer}
              </CardTitle>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span className={`font-medium ${getDeadlineColor(order.estimatedDate)}`}>
                  {formatDeadline(order.estimatedDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Responsible Person Avatar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm">
                    <AvatarImage src={responsiblePerson.avatar} alt={responsiblePerson.name} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
                      {getInitials(responsiblePerson.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{responsiblePerson.name}</p>
                    <p className="text-gray-500">{responsiblePerson.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Edit Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 hover:bg-gray-100 transition-colors"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit order</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Items */}
          <div className="space-y-1 mb-3">
            {order.items.slice(0, 2).map((item, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                {item}
              </span>
            ))}
            {order.items.length > 2 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{order.items.length - 2} more
              </span>
            )}
          </div>
          
          {/* Assigned Team (only avatars) */}
          {order.designer && (
            <div className="flex items-center gap-1 mb-3">
              <span className="text-xs text-gray-500 mr-2">Team:</span>
              <div className="flex -space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 ring-2 ring-white">
                      <AvatarImage src={order.designer.avatar} alt={order.designer.name} />
                      <AvatarFallback className="text-xs bg-green-100 text-green-700">
                        {getInitials(order.designer.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium">{order.designer.name}</p>
                      <p className="text-gray-500">Designer</p>
                      {order.designer.assignedBy && (
                        <p className="text-gray-400">Assigned by {order.designer.assignedBy}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                
                {/* Add more team members here if needed */}
                <Avatar className="h-6 w-6 ring-2 ring-white">
                  <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                    +
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}
          
          {/* Price */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#0050C8]">{order.total}</span>
            <span className="text-xs text-gray-500">
              {new Date(order.date).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default OrderCard;

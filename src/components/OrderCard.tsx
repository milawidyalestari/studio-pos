
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Calendar, Trash2 } from 'lucide-react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: string;
  date: string;
  estimatedDate: string;
  designer?: {
    name: string;
    avatar?: string;
    assignedBy?: string;
  };
  created_at?: string;
}

interface OrderCardProps {
  order: Order;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  onOrderClick?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  isOptimisticallyMoved?: boolean;
}

function safeLocaleDateString(dateValue: string | undefined) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

function formatCreatedAt(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const OrderCard = ({ order, provided, snapshot, onOrderClick, onEditOrder, onDeleteOrder, isOptimisticallyMoved }: OrderCardProps) => {
  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === '-' || dateString === '') return 'No deadline';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No deadline';
    
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getDeadlineColor = (dateString: string) => {
    if (!dateString || dateString === '-' || dateString === '') return 'text-gray-500';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'text-gray-500';
    
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteOrder) {
      onDeleteOrder(order.id);
    }
  };

  return (
    <TooltipProvider>
      <Card 
        ref={provided?.innerRef}
        {...(provided?.draggableProps || {})}
        {...(provided?.dragHandleProps || {})}
        className={`cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.02] ${
          snapshot?.isDragging ? 'shadow-xl rotate-1 scale-105 z-50 opacity-95' : ''
        } ${
          isOptimisticallyMoved ? 'ring-2 ring-blue-400 ring-opacity-60 shadow-md bg-blue-50/30' : ''
        }`}
        style={{
          transform: snapshot?.isDragging ? 'rotate(1deg) scale(1.05)' : isOptimisticallyMoved ? 'translateZ(0)' : 'none',
          transition: snapshot?.isDragging ? 'none' : 'all 0.2s ease-out',
          willChange: snapshot?.isDragging || isOptimisticallyMoved ? 'transform, box-shadow' : 'auto',
          ...provided?.draggableProps?.style
        }}
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
            <div className="flex items-center gap-1">
              {/* Edit Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 hover:bg-gray-100 transition-colors"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit order</p>
                </TooltipContent>
              </Tooltip>

              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete order</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Items */}
          <div className="space-y-1 mb-1">
            {(order.items || []).slice(0, 2).map((item, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                {item}
              </span>
            ))}
            {(order.items || []).length > 2 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{(order.items || []).length - 2} more
              </span>
            )}
          </div>
          
          {/* Created date and designer avatar */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-[12px] text-gray-500">
              Dibuat: {order.created_at ? formatCreatedAt(order.created_at) : '-'}
            </div>

            {order.designer ? (
              <Avatar className="h-6 w-6">
                {order.designer.avatar ? (
                  <AvatarImage src={order.designer.avatar} alt={order.designer.name} />
                ) : (
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {order.designer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-100 border border-gray-200"></div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default OrderCard;

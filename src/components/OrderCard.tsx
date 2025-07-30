
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Calendar, Trash2 } from 'lucide-react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useProducts } from '@/hooks/useProducts';

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
  isDoneColumn?: boolean;
  onMarkPickedUp?: (orderId: string) => void;
}

function safeLocaleDateString(dateValue: string | undefined) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

function formatCreatedAt(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { 
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  });
}

const OrderCard = ({ order, provided, snapshot, onOrderClick, onEditOrder, onDeleteOrder, isOptimisticallyMoved, isDoneColumn, onMarkPickedUp }: OrderCardProps) => {
  const { data: products } = useProducts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === '-' || dateString === '') return 'No deadline';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No deadline';
    
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Terlambat ${Math.abs(diffDays)} hari`;
    if (diffDays === 0) return 'Hari Ini';
    if (diffDays === 1) return 'Besok';
    return `${diffDays} Hari Lagi`;
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
    if (onOrderClick && !showDeleteDialog) {
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
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteOrder) {
      onDeleteOrder(order.id);
    }
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleMarkPickedUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkPickedUp) {
      onMarkPickedUp(order.id);
    }
  };

  if (isDoneColumn && order.status === 'Done') {
    return (
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
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-900 mb-1">
              {order.customer}
            </CardTitle>
            <div className="flex items-center gap-1">
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
              {onMarkPickedUp && order.status === 'Done' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 py-0 text-xs ml-2 hover:bg-green-100"
                  onClick={handleMarkPickedUp}
                  disabled={isOptimisticallyMoved}
                >
                  Diambil
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

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
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus order ini? 
                      <br />
                      <strong>Order #{order.orderNumber}</strong> - <strong>{order.customer}</strong>
                      <br />
                      <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan!</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => { e.stopPropagation(); handleCancelDelete(); }}>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => { e.stopPropagation(); handleConfirmDelete(); }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Hapus Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Items */}
          <div className="space-y-1 mb-1">
            {(order.items || []).slice(0, 2).map((item, index) => {
              const itemProduct = products?.find(p => p.kode === item);
              return (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1 inline-block">
                  {itemProduct?.nama || item}
                </span>
              );
            })}
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
              <div className="h-6 w-6 rounded-full"></div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default OrderCard;

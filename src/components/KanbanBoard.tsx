
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Edit, Archive } from 'lucide-react';
import OrderCard from './OrderCard';
import { useToast } from '@/hooks/use-toast';

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
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color?: string;
}

interface KanbanBoardProps {
  orders: Order[];
  onDragEnd: (result: DropResult) => void;
  onOrderClick?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onArchiveOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: string) => void;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'pending', title: 'Pending', status: 'pending', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: 'bg-blue-100 border-blue-200' },
  { id: 'ready', title: 'Ready', status: 'ready', color: 'bg-green-100 border-green-200' },
];

const KanbanBoard = ({ 
  orders, 
  onDragEnd, 
  onOrderClick, 
  onEditOrder, 
  onArchiveOrder,
  onUpdateOrderStatus 
}: KanbanBoardProps) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const { toast } = useToast();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(draggableId, newStatus);
    }
    
    onDragEnd(result);
    
    toast({
      title: "Order moved",
      description: `Order moved to ${columns.find(col => col.status === newStatus)?.title}`,
    });
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumn: KanbanColumn = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newColumnTitle,
      status: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      color: 'bg-gray-100 border-gray-200'
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setShowAddColumn(false);
    
    toast({
      title: "Status added",
      description: `New status "${newColumnTitle}" has been added`,
    });
  };

  const handleArchiveOrder = (orderId: string) => {
    if (onArchiveOrder) {
      onArchiveOrder(orderId);
      toast({
        title: "Order archived",
        description: "Order has been moved to archive",
      });
    }
  };

  const getColumnOrders = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
          {columns.map((column) => {
            const columnOrders = getColumnOrders(column.status);
            
            return (
              <div 
                key={column.id} 
                className={`flex-shrink-0 w-80 rounded-lg p-4 border-2 ${column.color || 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary">{columnOrders.length}</Badge>
                </div>
                
                <Droppable droppableId={column.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
                      }`}
                    >
                      {columnOrders.map((order, index) => (
                        <Draggable key={order.id} draggableId={order.id} index={index}>
                          {(provided, snapshot) => (
                            <OrderCard 
                              order={order}
                              provided={provided}
                              snapshot={snapshot}
                              onOrderClick={onOrderClick}
                              onEditOrder={onEditOrder}
                              onArchiveOrder={handleArchiveOrder}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          
          {/* Add New Column Button */}
          <div className="flex-shrink-0 w-80">
            <Button
              variant="outline"
              className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              onClick={() => setShowAddColumn(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Status
            </Button>
          </div>
        </div>
      </DragDropContext>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter status name..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddColumn(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
                Add Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;


import { DropResult } from 'react-beautiful-dnd';

export interface Order {
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

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color?: string;
}

export interface KanbanBoardProps {
  orders: Order[];
  onDragEnd: (result: DropResult) => void;
  onOrderClick?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onArchiveOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: string) => void;
}

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'pending', title: 'Pending', status: 'pending', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'ready', title: 'Ready', status: 'ready', color: 'bg-green-50 border-green-200' },
];

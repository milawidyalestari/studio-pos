
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
  { id: 'Design', title: 'Design', status: 'Design', color: 'bg-purple-50 border-purple-200' },
  { id: 'Cek File', title: 'Cek File', status: 'Cek File', color: 'bg-blue-50 border-blue-200' },
  { id: 'Konfirmasi', title: 'Konfirmasi', status: 'Konfirmasi', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'Export', title: 'Export', status: 'Export', color: 'bg-orange-50 border-orange-200' },
  { id: 'Proses Cetak', title: 'Proses Cetak', status: 'Proses Cetak', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'Done', title: 'Done', status: 'Done', color: 'bg-green-50 border-green-200' },
];

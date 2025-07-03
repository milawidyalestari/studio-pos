import { DropResult } from 'react-beautiful-dnd';
import { OrderWithItems } from '@/types';

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color?: string;
}

export interface KanbanBoardProps {
  orders: OrderWithItems[];
  onDragEnd: (result: DropResult) => void;
  onOrderClick?: (order: OrderWithItems) => void;
  onEditOrder?: (order: OrderWithItems) => void;
  onDeleteOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: string) => void;
}

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'Design', title: 'Design', status: 'Design', color: 'bg-gray-50' },
  { id: 'Cek File', title: 'Cek File', status: 'Cek File', color: 'bg-gray-50' },
  { id: 'Konfirmasi', title: 'Konfirmasi', status: 'Konfirmasi', color: 'bg-gray-50' },
  { id: 'Export', title: 'Export', status: 'Export', color: 'bg-gray-50' },
  { id: 'Proses Cetak', title: 'Proses Cetak', status: 'Proses Cetak', color: 'bg-gray-50' },
  { id: 'Done', title: 'Done', status: 'Done', color: 'bg-gray-50' },
];

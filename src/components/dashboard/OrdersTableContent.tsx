
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  customer: string;
  tanggal: string;
  deadline: string;
  status: string;
  total: string;
}

interface OrdersTableContentProps {
  orders: Order[];
}

const OrdersTableContent: React.FC<OrdersTableContentProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'desain': return 'bg-yellow-100 text-yellow-800';
      case 'konfirmasi': return 'bg-blue-100 text-blue-800';
      case 'cek file': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ScrollArea className="h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Jumlah Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{order.customer}</TableCell>
              <TableCell>{order.tanggal}</TableCell>
              <TableCell>{order.deadline}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-[#0050C8]">
                {order.total}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default OrdersTableContent;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { isSameDay } from 'date-fns';

interface Order {
  id: string;
  customer: string;
  tanggal: string;
  deadline: string;
  status: string;
  total: string;
}

interface ActiveOrdersTableProps {
  selectedDate: Date | undefined;
  selectedDeadline: string;
  onDeadlineFilterChange: (filter: string) => void;
}

const ActiveOrdersTable: React.FC<ActiveOrdersTableProps> = ({
  selectedDate,
  selectedDeadline,
  onDeadlineFilterChange
}) => {
  const activeOrders: Order[] = [
    {
      id: '1',
      customer: 'Pak Tut Lanji',
      tanggal: 'June 26, 2025',
      deadline: 'June 26, 2025',
      status: 'Desain',
      total: 'IDR 35.000'
    },
    {
      id: '2',
      customer: 'Sri Asri',
      tanggal: 'June 26, 2025',
      deadline: 'June 26, 2025',
      status: 'Konfirmasi',
      total: 'IDR 25.000'
    },
    {
      id: '3',
      customer: 'Choirull',
      tanggal: 'June 26, 2025',
      deadline: 'June 27, 2025',
      status: 'Cek File',
      total: 'IDR 20.000'
    },
    {
      id: '4',
      customer: 'Matteo',
      tanggal: 'June 26, 2025',
      deadline: 'June 28, 2025',
      status: 'Cek File',
      total: 'IDR 75.000'
    },
    {
      id: '5',
      customer: 'Srimulyadi',
      tanggal: 'June 26, 2025',
      deadline: 'June 29, 2025',
      status: 'Desain',
      total: 'IDR 105.000'
    },
    {
      id: '6',
      customer: 'Unggul Madani',
      tanggal: 'June 26, 2025',
      deadline: 'June 29, 2025',
      status: 'Desain',
      total: 'IDR 87.000'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'desain': return 'bg-yellow-100 text-yellow-800';
      case 'konfirmasi': return 'bg-blue-100 text-blue-800';
      case 'cek file': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = activeOrders.filter(order => {
    if (selectedDate) {
      const orderDate = new Date(order.deadline);
      const isDateMatch = isSameDay(orderDate, selectedDate);
      if (!isDateMatch) return false;
    }
    
    if (selectedDeadline !== 'all') {
      const today = new Date();
      const orderDeadline = new Date(order.deadline);
      
      switch (selectedDeadline) {
        case 'today':
          return isSameDay(orderDeadline, today);
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return isSameDay(orderDeadline, tomorrow);
        case 'overdue':
          return orderDeadline < today;
        default:
          return true;
      }
    }
    
    return true;
  });

  return (
    <Card className="flex flex-col min-h-0 h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#0050C8]" />
            Orderan Aktif
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Deadline:</span>
            <div className="flex space-x-1">
              <Button
                variant={selectedDeadline === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDeadlineFilterChange('all')}
                className={selectedDeadline === 'all' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
              >
                All
              </Button>
              <Button
                variant={selectedDeadline === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDeadlineFilterChange('today')}
                className={selectedDeadline === 'today' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
              >
                Today
              </Button>
              <Button
                variant={selectedDeadline === 'tomorrow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDeadlineFilterChange('tomorrow')}
                className={selectedDeadline === 'tomorrow' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
              >
                Tomorrow
              </Button>
              <Button
                variant={selectedDeadline === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDeadlineFilterChange('overdue')}
                className={selectedDeadline === 'overdue' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
              >
                Overdue
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
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
              {filteredOrders.map((order) => (
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
      </CardContent>
    </Card>
  );
};

export default ActiveOrdersTable;

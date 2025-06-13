import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Receipt, Package, TrendingUp, Calendar as CalendarIcon, Users, MessageCircle, Bell, Filter } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [showInbox, setShowInbox] = useState(false);

  const stats = [
    {
      title: 'Total Pendapatan',
      value: 'IDR 3.689.400',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Total Transaksi',
      value: '29',
      icon: Receipt,
      color: 'text-green-600'
    },
    {
      title: 'Belum Diproses',
      value: '14',
      icon: Package,
      color: 'text-orange-600'
    }
  ];

  const activeOrders = [
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

  const inboxMessages = [
    {
      id: '1',
      type: 'Requested Design',
      customer: 'Kom 3',
      time: 'Jun 26 • Pak Tut Lanji',
      message: 'Spanduk Me Kolor',
      unread: true
    },
    {
      id: '2',
      type: 'Requested File',
      customer: 'Kom 1',
      time: 'Jun 26 • Choirull',
      message: 'Cek File Premium',
      unread: true
    },
    {
      id: '3',
      type: 'Requested Send Confirmation',
      customer: 'Kom 2',
      time: 'Jun 26 • Sri Asri',
      message: 'File Happy Wedding...',
      unread: true
    },
    {
      id: '4',
      type: 'Requested File',
      customer: 'Kom 2',
      time: 'Jun 26 • Matteo',
      message: 'Spanduk Cafe Teduh',
      unread: false
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
    <div className="p-6 space-y-6 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInbox(!showInbox)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Active Orders */}
        <Card className="lg:col-span-3 flex flex-col min-h-0">
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
                    onClick={() => setSelectedDeadline('all')}
                    className={selectedDeadline === 'all' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedDeadline === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDeadline('today')}
                    className={selectedDeadline === 'today' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
                  >
                    Today
                  </Button>
                  <Button
                    variant={selectedDeadline === 'tomorrow' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDeadline('tomorrow')}
                    className={selectedDeadline === 'tomorrow' ? 'bg-[#0050C8] hover:bg-[#003a9b]' : ''}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant={selectedDeadline === 'overdue' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDeadline('overdue')}
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

        {/* Merged Calendar and Inbox */}
        <Card className="lg:col-span-1 flex flex-col min-h-0">
          {/* Calendar Section */}
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-[#0050C8]" />
              {format(new Date(), 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
            />
          </CardContent>

          {/* Single Line Divider */}
          <Separator className="mx-6" />

          {/* Inbox Section */}
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-[#0050C8]" />
                Inbox
              </div>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-0 flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {inboxMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                      message.unread ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        message.unread ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.customer} {message.type}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">{message.time}</p>
                        <p className="text-sm text-gray-600 truncate">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

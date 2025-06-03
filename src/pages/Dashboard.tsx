
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt, Package, TrendingUp, Calendar, Users } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Orders',
      value: '125',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Orders',
      value: '23',
      change: '+5%',
      icon: Calendar,
      color: 'text-yellow-600'
    },
    {
      title: 'Completed Today',
      value: '8',
      change: '+20%',
      icon: Receipt,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: 'IDR 2,450,000',
      change: '+15%',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const recentOrders = [
    { id: '#009461', customer: 'John Doe', items: 'Luster Banner', status: 'pending', total: 'IDR 125,000' },
    { id: '#009462', customer: 'Jane Smith', items: 'HVS A3', status: 'in-progress', total: 'IDR 15,000' },
    { id: '#009463', customer: 'Bob Wilson', items: 'Banner', status: 'ready', total: 'IDR 20,000' },
    { id: '#009464', customer: 'Alice Brown', items: 'Business Cards', status: 'done', total: 'IDR 50,000' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'done': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#0050C8]" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customer} - {order.items}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#0050C8]">{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#0050C8]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-[#0050C8]" />
                <div>
                  <p className="font-medium">New Order</p>
                  <p className="text-sm text-gray-600">Create customer request</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-3 text-[#0050C8]" />
                <div>
                  <p className="font-medium">Check Inventory</p>
                  <p className="text-sm text-gray-600">View stock levels</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-[#0050C8]" />
                <div>
                  <p className="font-medium">Customer List</p>
                  <p className="text-sm text-gray-600">Manage customers</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Receipt className="h-5 w-5 mr-3 text-[#0050C8]" />
                <div>
                  <p className="font-medium">Print Reports</p>
                  <p className="text-sm text-gray-600">Generate daily reports</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Receipt, Package } from 'lucide-react';

const DashboardStats = () => {
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

  return (
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
  );
};

export default DashboardStats;

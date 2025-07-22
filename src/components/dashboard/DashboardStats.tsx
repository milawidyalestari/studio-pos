
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Receipt, Package } from 'lucide-react';
import { useTodayOrderStats } from '@/hooks/useOrders';
import { hasAccess } from '@/utils/roleAccess';

// Tambahkan type agar data tidak unknown
interface TodayOrderStats {
  totalPendapatan: number;
  totalTransaksi: number;
  belumDiproses: number;
}

const DashboardStats = () => {
  const { data, isLoading, error } = useTodayOrderStats();

  const stats = [
    {
      title: 'Total Pendapatan',
      value: data ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((data as TodayOrderStats).totalPendapatan) : '-',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Total Orderan',
      value: data ? (data as TodayOrderStats).totalTransaksi : '-',
      icon: Receipt,
      color: 'text-green-600'
    },
    {
      title: 'Belum Diproses',
      value: data ? (data as TodayOrderStats).belumDiproses : '-',
      icon: Package,
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return <div className="p-6 text-center">Loading statistik...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">Gagal memuat statistik</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {stats.map((stat, index) => {
        // Mapping index ke aksi akses
        const accessActions = ['view_income', 'view_orders', 'view_unprocessed'];
        if (!hasAccess('Dashboard', accessActions[index])) return null;
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

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Receipt, Package } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useHasAccess } from '@/context/RoleAccessContext';
import { isSameDay } from 'date-fns';

// Type untuk statistik orderan aktif
interface TodayOrderStats {
  totalPendapatan: number;
  totalTransaksi: number;
  belumDiproses: number;
}

interface DashboardStatsProps {
  selectedDate?: Date;
  selectedDeadline?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  selectedDate,
  selectedDeadline = 'all'
}) => {
  const hasAccess = useHasAccess();
  const { orders, isLoading } = useOrders({ enableAutoRefresh: false });

  // Hitung statistik berdasarkan filter yang sama dengan Active Orders
  const calculateStats = (): ActiveOrderStats => {
    if (!orders) return { totalPendapatan: 0, totalTransaksi: 0, belumDiproses: 0 };

    const today = new Date();

    // Filter untuk SEMUA orderan aktif (PERSIS seperti di ActiveOrdersTable)
    const activeOrders = orders.filter(order => {
      // Exclude hanya status Done dan Selesai-diambil (Export tetap ditampilkan)
      const statusName = order.order_statuses?.name || '';
      if (statusName.toLowerCase() === 'done' || 
          statusName.toLowerCase() === 'selesai-diambil') {
        return false;
      }

      // Filter berdasarkan selectedDate (sama seperti ActiveOrdersTable)
      if (selectedDate) {
        const orderDate = order.estimasi ? new Date(order.estimasi) : null;
        const isDateMatch = orderDate && isSameDay(orderDate, selectedDate);
        if (!isDateMatch) return false;
      }

      // Filter berdasarkan selectedDeadline (sama seperti ActiveOrdersTable)
      if (selectedDeadline !== 'all') {
        const orderDeadline = order.estimasi ? new Date(order.estimasi) : null;
        
        switch (selectedDeadline) {
          case 'today':
            return orderDeadline && isSameDay(orderDeadline, today);
          case 'tomorrow': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return orderDeadline && isSameDay(orderDeadline, tomorrow);
          }
          case 'overdue':
            return orderDeadline && orderDeadline < today;
          default:
            return true;
        }
      }

      return true;
    });

    // Hitung total pendapatan dari SEMUA orderan aktif
    const totalPendapatan = activeOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    // Total orderan = semua orderan aktif (dengan atau tanpa designer)
    const totalTransaksi = activeOrders.length;

    // Filter untuk orderan yang belum diproses (belum ada designer)
    const unprocessedOrders = activeOrders.filter(order => !order.desainer_id);
    const belumDiproses = unprocessedOrders.length;

    return { totalPendapatan, totalTransaksi, belumDiproses };
  };

  const data = calculateStats();
  const error = null;

  // Determine if filter is active
  const hasActiveFilter = selectedDate !== undefined || selectedDeadline !== 'all';
  
  // Get filter description
  const getFilterDescription = () => {
    if (selectedDate && selectedDeadline !== 'all') {
      return 'Sesuai filter tanggal & deadline';
    } else if (selectedDate) {
      return 'Sesuai filter tanggal';
    } else if (selectedDeadline !== 'all') {
      const filterLabels: { [key: string]: string } = {
        today: 'Deadline hari ini',
        tomorrow: 'Deadline besok',
        overdue: 'Terlambat'
      };
      return filterLabels[selectedDeadline] || '';
    }
    return '';
  };

  const stats = [
    {
      title: 'Total Pendapatan',
      value: data ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(data.totalPendapatan)
        .replace(/IDR/g, '')
        .replace(/\./g, ',')
        .replace(/,/g, '.')
        .trim()
        .replace(/^[0\s]+/, '') : '-',
      icon: TrendingUp,
      color: hasActiveFilter ? 'text-emerald-600' : 'text-blue-600',
      subtitle: hasActiveFilter ? getFilterDescription() : 'Semua orderan aktif'
    },
    {
      title: 'Total Orderan',
      value: data ? data.totalTransaksi : '-',
      icon: Receipt,
      color: hasActiveFilter ? 'text-green-600' : 'text-blue-600',
      subtitle: hasActiveFilter ? getFilterDescription() : 'Semua orderan aktif'
    },
    {
      title: 'Belum Diproses',
      value: data ? data.belumDiproses : '-',
      icon: Package,
      color: hasActiveFilter ? 'text-orange-600' : 'text-blue-600',
      subtitle: hasActiveFilter ? getFilterDescription() : 'Semua orderan aktif'
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
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.title === 'Total Pendapatan' ? `IDR ${stat.value}` : stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1 italic">{stat.subtitle}</p>
                  )}
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

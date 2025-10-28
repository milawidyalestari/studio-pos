/**
 * Accounting Dashboard Component
 * 
 * Dashboard untuk monitoring integrasi POS-Accounting
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccountingMetrics, usePOSAccounting } from '@/hooks/usePOSAccounting';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const AccountingDashboard = () => {
  const { metrics, isLoading } = useAccountingMetrics();
  const { useOutstandingReceivables } = usePOSAccounting();
  const { data: receivables, isLoading: loadingReceivables } = useOutstandingReceivables();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Saldo Kas',
      value: formatCurrency(metrics.cashBalance),
      icon: DollarSign,
      description: 'Saldo kas saat ini',
      color: 'text-green-600',
    },
    {
      title: 'Penjualan Hari Ini',
      value: formatCurrency(metrics.todaySales),
      icon: TrendingUp,
      description: 'Total penjualan hari ini',
      color: 'text-blue-600',
    },
    {
      title: 'Total Piutang',
      value: formatCurrency(metrics.totalReceivables),
      icon: Users,
      description: 'Total piutang outstanding',
      color: 'text-orange-600',
    },
    {
      title: 'Order Belum Lunas',
      value: metrics.outstandingOrders.toString(),
      icon: AlertCircle,
      description: 'Jumlah order belum lunas',
      color: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Outstanding Receivables Table */}
      {metrics.outstandingOrders > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Piutang Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReceivables ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Order</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Tanggal</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">DP</th>
                      <th className="text-right p-2">Sisa</th>
                      <th className="text-center p-2">Hari</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivables?.slice(0, 5).map((item: any) => (
                      <tr key={item.order_id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.order_number}</td>
                        <td className="p-2">{item.customer_name}</td>
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(item.order_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="p-2 text-right text-green-600">
                          {formatCurrency(item.down_payment)}
                        </td>
                        <td className="p-2 text-right font-bold text-orange-600">
                          {formatCurrency(item.remaining_payment)}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.days_outstanding > 30
                                ? 'bg-red-100 text-red-800'
                                : item.days_outstanding > 14
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.days_outstanding} hari
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {receivables && receivables.length > 5 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Dan {receivables.length - 5} piutang lainnya...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


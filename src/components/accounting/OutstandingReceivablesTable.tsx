/**
 * Outstanding Receivables Table Component
 * 
 * Tabel untuk menampilkan dan mengelola piutang outstanding
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePOSAccounting } from '@/hooks/usePOSAccounting';
import { formatCurrency } from '@/lib/utils';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';

export const OutstandingReceivablesTable = () => {
  const { useOutstandingReceivables } = usePOSAccounting();
  const { data: receivables, isLoading } = useOutstandingReceivables();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleRecordPayment = (order: any) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Piutang Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!receivables || receivables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Piutang Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Tidak ada piutang outstanding</p>
            <p className="text-sm text-gray-400 mt-2">
              Semua pembayaran sudah lunas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOutstanding = receivables.reduce((sum: number, item: any) => 
    sum + parseFloat(item.remaining_payment), 0
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Piutang Outstanding</CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Piutang</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Order</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Tanggal</th>
                  <th className="text-right p-3 font-medium">Total</th>
                  <th className="text-right p-3 font-medium">DP</th>
                  <th className="text-right p-3 font-medium">Sisa</th>
                  <th className="text-center p-3 font-medium">Hari</th>
                  <th className="text-center p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map((item: any) => (
                  <tr key={item.order_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-medium">{item.order_number}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-700">{item.customer_name}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {new Date(item.order_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-gray-700">
                        {formatCurrency(item.total_amount)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-green-600">
                        {formatCurrency(item.down_payment)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-orange-600">
                        {formatCurrency(item.remaining_payment)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          item.days_outstanding > 30
                            ? 'bg-red-100 text-red-800'
                            : item.days_outstanding > 14
                            ? 'bg-orange-100 text-orange-800'
                            : item.days_outstanding > 7
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.days_outstanding} hari
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecordPayment(item)}
                      >
                        Catat Bayar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Total {receivables.length} piutang outstanding
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {receivables.filter((r: any) => r.days_outstanding > 30).length} piutang lebih dari 30 hari
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Sisa Tagihan</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        order={selectedOrder}
      />
    </>
  );
};


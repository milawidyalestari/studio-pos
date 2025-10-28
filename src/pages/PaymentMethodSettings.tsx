/**
 * Payment Method Settings Page
 * 
 * Halaman untuk mengatur mapping tipe pembayaran ke akun akuntansi
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethodAccountManager } from '@/components/accounting/PaymentMethodAccountManager';
import { PaymentMethodAccountOverview } from '@/components/accounting/PaymentMethodAccountCard';
import { AccountingDashboard } from '@/components/accounting/AccountingDashboard';
import { Settings, BarChart3, Eye } from 'lucide-react';

export const PaymentMethodSettings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Pembayaran</h1>
          <p className="text-gray-600">
            Kelola mapping tipe pembayaran ke akun akuntansi
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Kelola Mapping
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mapping Pembayaran ke Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Berikut adalah mapping tipe pembayaran ke akun akuntansi yang sudah dikonfigurasi.
                Setiap transaksi dengan tipe pembayaran tertentu akan otomatis masuk ke akun yang sesuai.
              </p>
              <PaymentMethodAccountOverview />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Panduan Penggunaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">✅ Tipe Pembayaran yang Didukung</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>cash</strong> - Pembayaran tunai</li>
                    <li>• <strong>transfer</strong> - Transfer bank</li>
                    <li>• <strong>credit</strong> - Kredit/tempo</li>
                    <li>• <strong>ewallet</strong> - E-wallet (GoPay, OVO, dll)</li>
                    <li>• <strong>qris</strong> - QRIS</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-700">📊 Akun yang Bisa Dipetakan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>1110 - Kas</strong> - Uang tunai</li>
                    <li>• <strong>1120 - Bank</strong> - Rekening bank</li>
                    <li>• <strong>1130 - Piutang</strong> - Piutang usaha</li>
                    <li>• <strong>1140 - Persediaan</strong> - Barang dagang</li>
                    <li>• Dan akun lainnya...</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Tips Penggunaan</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Mapping pembayaran akan otomatis digunakan saat order selesai</li>
                  <li>• Pastikan akun tujuan sudah ada di Chart of Accounts</li>
                  <li>• Untuk pembayaran kredit, tetap akan masuk ke akun Piutang</li>
                  <li>• Mapping dapat diubah kapan saja tanpa mempengaruhi transaksi lama</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <PaymentMethodAccountManager />
        </TabsContent>

        <TabsContent value="dashboard">
          <AccountingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Payment Method Account Card Component
 * 
 * Card untuk menampilkan mapping pembayaran dengan preview debit/credit accounts
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccountForPaymentMethod } from '@/hooks/usePaymentMethodAccounts';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, DollarSign, Building2, Users, TrendingUp } from 'lucide-react';

interface PaymentMethodAccountCardProps {
  paymentMethod: string;
  showDetails?: boolean;
}

const getPaymentMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return <DollarSign className="h-5 w-5" />;
    case 'transfer':
      return <Building2 className="h-5 w-5" />;
    case 'credit':
      return <Users className="h-5 w-5" />;
    case 'ewallet':
    case 'qris':
      return <CreditCard className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
};

const getPaymentMethodLabel = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'Tunai';
    case 'transfer':
      return 'Transfer';
    case 'credit':
      return 'Kredit';
    case 'ewallet':
      return 'E-Wallet';
    case 'qris':
      return 'QRIS';
    default:
      return method.charAt(0).toUpperCase() + method.slice(1);
  }
};

const getAccountTypeColor = (type: string) => {
  switch (type) {
    case 'asset':
      return 'bg-green-100 text-green-800';
    case 'liability':
      return 'bg-red-100 text-red-800';
    case 'equity':
      return 'bg-blue-100 text-blue-800';
    case 'income':
      return 'bg-purple-100 text-purple-800';
    case 'expense':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const PaymentMethodAccountCard = ({ paymentMethod, showDetails = true }: PaymentMethodAccountCardProps) => {
  const { data: account, isLoading, error } = useAccountForPaymentMethod(paymentMethod);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !account) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-500">
            {getPaymentMethodIcon(paymentMethod)}
            <div className="flex-1">
              <p className="font-medium">{getPaymentMethodLabel(paymentMethod)}</p>
              <p className="text-sm">Belum ada mapping akun</p>
            </div>
            <Badge variant="outline" className="text-xs">
              Tidak Terkonfigurasi
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-gray-600">
            {getPaymentMethodIcon(paymentMethod)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900">
                {getPaymentMethodLabel(paymentMethod)}
              </p>
              <span className="text-gray-400">→</span>
              <p className="font-medium text-gray-900">
                {account.account_code}
              </p>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {account.account_name}
            </p>
            
            {showDetails && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getAccountTypeColor(account.account_type || '')}`}
                >
                  {account.account_type?.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500">
                  Pembayaran {paymentMethod} akan masuk ke akun ini
                </span>
              </div>
            )}
          </div>
          
          <Badge variant="default" className="text-xs">
            Terkonfigurasi
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Payment Method Account Overview Component
 * 
 * Overview semua mapping pembayaran dalam grid dengan debit/credit info
 */
export const PaymentMethodAccountOverview = () => {
  const { usePaymentMethodAccounts } = usePaymentMethodAccounts();
  const { data: paymentMethodAccounts, isLoading } = usePaymentMethodAccounts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!paymentMethodAccounts || paymentMethodAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Belum ada mapping pembayaran</p>
          <p className="text-sm text-gray-400">
            Atur mapping pembayaran di Master Data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paymentMethodAccounts.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-gray-600">
                {getPaymentMethodIcon(item.payment_method)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {getPaymentMethodLabel(item.payment_method)}
                </p>
                <Badge 
                  variant={item.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {item.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Debit:</span>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.debit_account_code}</p>
                  <p className="text-xs text-gray-500">{item.debit_account_name}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Credit:</span>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.credit_account_code}</p>
                  <p className="text-xs text-gray-500">{item.credit_account_name}</p>
                </div>
              </div>
            </div>
            
            {item.description && (
              <p className="text-xs text-gray-600 mt-2 pt-2 border-t">
                {item.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
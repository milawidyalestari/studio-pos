import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionSummaryProps {
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  totalPaid?: number;
  paymentSteps?: Array<{amount: number, category: string}>;
  currentAmount?: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  total,
  subtotal,
  tax,
  discount,
  totalPaid = 0,
  paymentSteps = [],
  currentAmount = ''
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="flex-shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-center">Total</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 bg-gray-100 p-3 rounded-lg">
            {formatCurrency(total)}
          </div>
          
          {(subtotal || tax || discount) && (
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              {subtotal && (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              )}
              {tax && (
                <div className="flex justify-between">
                  <span>Tax (11%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}
              {discount && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Steps */}
          {paymentSteps.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <div className="text-xs text-gray-600 mb-1">Payment Steps:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {paymentSteps.map((step, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-blue-600">{step.category}</span>
                    <span className="font-medium">{formatCurrency(step.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t">
                <span>Total Paid:</span>
                <span className="text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
            </div>
          )}

          {/* Current Amount Input */}
          {currentAmount && (
            <div className="mt-2 p-2 bg-blue-50 rounded border">
              <div className="text-xs text-gray-600">Current Amount:</div>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(parseFloat(currentAmount) || 0)}</div>
            </div>
          )}

          {/* Remaining Amount */}
          {totalPaid > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded border">
              <div className="text-xs text-gray-600">Remaining:</div>
              <div className="text-lg font-bold text-orange-600">{formatCurrency(Math.max(0, total - totalPaid))}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionSummary;

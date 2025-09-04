import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentSectionProps {
  total?: number;
  onPaymentMethodChange?: (method: 'cash' | 'card' | 'transfer') => void;
  onCashReceivedChange?: (amount: string) => void;
  currentAmount?: string;
  selectedCategory?: string;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  total = 0,
  onPaymentMethodChange,
  onCashReceivedChange,
  currentAmount = '',
  selectedCategory = ''
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState('');

  const calculateChange = () => {
    if (cashReceived && paymentMethod === 'cash') {
      const received = parseFloat(cashReceived);
      return received - total;
    }
    return 0;
  };

  const handlePaymentMethodChange = (value: 'cash' | 'card' | 'transfer') => {
    setPaymentMethod(value);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(value);
    }
  };

  const handleCashReceivedChange = (value: string) => {
    setCashReceived(value);
    if (onCashReceivedChange) {
      onCashReceivedChange(value);
    }
  };

  return (
    <Card className="flex-shrink-0">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-method" className="text-sm">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Current Amount Display */}
          {currentAmount && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1">Current Amount:</div>
              <div className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(parseFloat(currentAmount) || 0)}
              </div>
            </div>
          )}

          {/* Selected Category Display */}
          {selectedCategory && (
            <div className="p-3 bg-green-50 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1">Selected Category:</div>
              <div className="text-sm font-medium text-green-700">{selectedCategory}</div>
            </div>
          )}

          <div className="min-h-[80px]">
            {paymentMethod === 'cash' ? (
              <div>
                <Label htmlFor="cash-received" className="text-sm">Cash Received</Label>
                <Input
                  id="cash-received"
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => handleCashReceivedChange(e.target.value)}
                  className="mt-1 h-10 text-sm"
                />
                {cashReceived && (
                  <p className="text-sm text-gray-600 mt-1">
                    Change: ${calculateChange().toFixed(2)}
                  </p>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-500">
                  {paymentMethod === 'card' ? 'Card payment selected' : 'Transfer payment selected'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;

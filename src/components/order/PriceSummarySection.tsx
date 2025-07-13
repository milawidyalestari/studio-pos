import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/services/masterData';
import { Textarea } from '../ui/textarea';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface PriceSummarySectionProps {
  formData: {
    notes: string | number | readonly string[];
    discount: number;
    ppn: number;
    payment_method: string;
  };
  totalPrice: number;
  onFormDataChange: (field: string, value: number | string) => void;
}

const PriceSummarySection: React.FC<PriceSummarySectionProps> = ({ formData, totalPrice, onFormDataChange }) => {
  const { data: paymentTypes, isLoading: paymentTypesLoading, error: paymentTypesError } = usePaymentTypes();
  // Get unique payment_method values (non-cash)
  const nonCashMethods = paymentTypes
    ? Array.from(new Set(paymentTypes.map(pt => pt.payment_method).filter(Boolean)))
    : [];
  // Controlled value for payment method
  const paymentMethod = formData.payment_method || 'Cash';
  return (
    <div className="border-t bg-white pl-6 pr-6 pt-2 pb-6 flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">TOTAL</span>
        <span className="text-2xl font-bold text-[#0050C8]">{formatCurrency(totalPrice)}</span>
      </div>
      {/* 2-column grid layout, compact and aligned */}
      <div className="grid grid-cols-2 gap-8 items-start mb-2">
        {/* Left column: vertical alignment, compact */}
        <div className="flex flex-col gap-3">
          {/* Tax */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-16 mr-2">Tax</Label>
            <Checkbox className="ml-0" />
            <Input 
              value={formData.ppn}
              onChange={(e) => onFormDataChange('ppn', Number(e.target.value))}
              className="h-8 px-2 py-1 flex-1" 
              type="number"
            />
            <span className="text-sm ml-1 mr-16">%</span>
          </div>
          {/* Discount */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-16">Discount</Label>
            <span className="w-6" />
            <Input 
              value={formData.discount}
              onChange={(e) => onFormDataChange('discount', Number(e.target.value))}
              type="number"
              className="h-8 px-2 py-1 flex-1"
            />
            <span className="text-sm ml-1 mr-16">%</span>
          </div>
        </div>
        {/* Right column: label beside input */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Down Payment</Label>
            <Input placeholder="Down payment" className="h-8 px-2 py-1 flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Pelunasan</Label>
            <Input placeholder="Pelunasan" className="h-8 px-2 py-1 flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Sisa</Label>
            <Input value={formatCurrency(totalPrice)} readOnly className="bg-gray-100 h-8 px-2 py-1 flex-1 " />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={val => onFormDataChange('payment_method', val)}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                {paymentTypesLoading && <SelectItem value="loading">Loading...</SelectItem>}
                {paymentTypesError && <SelectItem value="error">Error loading payment types</SelectItem>}
                {nonCashMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummarySection;

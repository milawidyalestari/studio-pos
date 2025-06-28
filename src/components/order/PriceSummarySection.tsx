
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/services/masterData';

interface PriceSummarySectionProps {
  formData: {
    discount: number;
    ppn: number;
  };
  totalPrice: number;
  onFormDataChange: (field: string, value: any) => void;
}

const PriceSummarySection = ({ formData, totalPrice, onFormDataChange }: PriceSummarySectionProps) => {
  return (
    <div className="border-t bg-white p-6 flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">TOTAL</span>
        <span className="text-2xl font-bold text-[#0050C8]">{formatCurrency(totalPrice)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-sm font-medium">Discount</Label>
          <div className="flex items-center mt-1">
            <Input 
              value={formData.discount}
              onChange={(e) => onFormDataChange('discount', Number(e.target.value))}
              type="number"
              className="mr-2"
            />
            <span className="text-sm">%</span>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Down Payment</Label>
          <Input placeholder="Down payment" className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox />
          <Label className="text-sm">Tax</Label>
          <Input 
            value={formData.ppn}
            onChange={(e) => onFormDataChange('ppn', Number(e.target.value))}
            className="w-16 text-sm"
            type="number"
          />
          <span className="text-sm">%</span>
        </div>
        <div>
          <Label className="text-sm font-medium">Remaining</Label>
          <Input value={formatCurrency(totalPrice)} readOnly className="mt-1 bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

export default PriceSummarySection;

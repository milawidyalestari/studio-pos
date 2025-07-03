import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/services/masterData';
import { Textarea } from '../ui/textarea';

interface PriceSummarySectionProps {
  formData: {
    notes: string | number | readonly string[];
    discount: number;
    ppn: number;
  };
  totalPrice: number;
  onFormDataChange: (field: string, value: number | string) => void;
}

const PriceSummarySection: React.FC<PriceSummarySectionProps> = ({ formData, totalPrice, onFormDataChange }) => {
  return (
    <div className="border-t bg-white pl-6 pr-6 pt-2 pb-6 flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold">TOTAL</span>
        <span className="text-2xl font-bold text-[#0050C8]">{formatCurrency(totalPrice)}</span>
      </div>
      {/* Grid 4 kolom */}
      <div className="grid grid-cols-4 gap-4 items-end mb-2">
        {/* Tax */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium">Tax</Label>
          <div className="flex items-center mt-1">
            <Checkbox />
            <Input 
              value={formData.ppn}
              onChange={(e) => onFormDataChange('ppn', Number(e.target.value))}
              className="w-16 text-sm ml-2 h-8"
              type="number"
            />
            <span className="text-sm ml-1">%</span>
          </div>
        </div>
        {/* Discount */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium">Discount</Label>
          <div className="flex items-center mt-1">
            <Input 
              value={formData.discount}
              onChange={(e) => onFormDataChange('discount', Number(e.target.value))}
              type="number"
              className="mr-2 h-8"
            />
            <span className="text-sm">%</span>
          </div>
        </div>
        {/* Down Payment */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium">Down Payment</Label>
          <Input placeholder="Down payment" className="mt-1 h-8" />
        </div>
        {/* Remaining */}
        <div className="flex flex-col">
          <Label className="text-sm font-medium">Remaining</Label>
          <Input value={formatCurrency(totalPrice)} readOnly className="mt-1 bg-gray-100 h-8" />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFormDataChange('notes', e.target.value as string)}
          placeholder="Order notes..."
          className="mt-1 resize-none"
        />
      </div>
    </div>
  );
};

export default PriceSummarySection;


import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/services/masterData';

interface ServiceCostSectionProps {
  formData: {
    notes: string;
    jasaDesain: string;
    biayaLain: string;
    admin: string;
    desainer: string;
    komputer: string;
  };
  totalPrice: number;
  onFormDataChange: (field: string, value: any) => void;
}

const ServiceCostSection = ({ formData, totalPrice, onFormDataChange }: ServiceCostSectionProps) => {
  return (
    <>
      <div className="mb-4">
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFormDataChange('notes', e.target.value)}
          placeholder="Order notes..."
          className="mt-1 h-20 resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="jasaDesain" className="text-sm font-medium">Design Service</Label>
          <Input
            id="jasaDesain"
            value={formData.jasaDesain}
            onChange={(e) => onFormDataChange('jasaDesain', e.target.value)}
            placeholder="Design fee"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="biayaLain" className="text-sm font-medium">Other Costs</Label>
          <Input
            id="biayaLain"
            value={formData.biayaLain}
            onChange={(e) => onFormDataChange('biayaLain', e.target.value)}
            placeholder="Other costs"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="subTotal" className="text-sm font-medium">Sub Total</Label>
          <Input
            id="subTotal"
            value={formatCurrency(totalPrice)}
            readOnly
            className="mt-1 bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="admin" className="text-sm font-medium">Admin</Label>
          <Input
            id="admin"
            value={formData.admin}
            onChange={(e) => onFormDataChange('admin', e.target.value)}
            placeholder="Admin name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="desainer" className="text-sm font-medium">Designer</Label>
          <Input
            id="desainer"
            value={formData.desainer}
            onChange={(e) => onFormDataChange('desainer', e.target.value)}
            placeholder="Designer name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="komputer" className="text-sm font-medium">Computer</Label>
          <Input
            id="komputer"
            value={formData.komputer}
            onChange={(e) => onFormDataChange('komputer', e.target.value)}
            placeholder="Computer info"
            className="mt-1"
          />
        </div>
      </div>
    </>
  );
};

export default ServiceCostSection;

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/services/masterData';
import { Employee } from '@/types';

interface ServiceCostSectionFormData {
  notes: string;
  jasaDesain: string;
  biayaLain: string;
  admin: string;
  desainer: string;
  komputer: string;
}

interface ServiceCostSectionProps {
  formData: ServiceCostSectionFormData;
  totalPrice: number;
  onFormDataChange: (field: keyof ServiceCostSectionFormData, value: string) => void;
  designers: Employee[];
  loadingDesigners?: boolean;
  admins: Employee[];
  loadingAdmins?: boolean;
}

const ServiceCostSection = ({ formData, totalPrice, onFormDataChange, designers, loadingDesigners, admins, loadingAdmins }: ServiceCostSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="jasaDesain" className="text-sm font-medium">Design Service</Label>
          <Input
            id="jasaDesain"
            value={formData.jasaDesain}
            onChange={(e) => onFormDataChange('jasaDesain', e.target.value)}
            placeholder="Design fee"
            className="mt-1 h-8"
          />
        </div>
        <div>
          <Label htmlFor="biayaLain" className="text-sm font-medium">Other Costs</Label>
          <Input
            id="biayaLain"
            value={formData.biayaLain}
            onChange={(e) => onFormDataChange('biayaLain', e.target.value)}
            placeholder="Other costs"
            className="mt-1 h-8"
          />
        </div>
        <div>
          <Label htmlFor="subTotal" className="text-sm font-medium">Sub Total</Label>
          <Input
            id="subTotal"
            value={formatCurrency(totalPrice)}
            readOnly
            className="mt-1 bg-gray-100 h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="admin" className="text-sm font-medium">Admin</Label>
          <select
            id="admin"
            value={formData.admin}
            onChange={e => onFormDataChange('admin', e.target.value)}
              className="border rounded-md p-1 mt-1 min-w-[120px] w-full text-gray-700 text-sm h-8"
          >
            <option value="">Admin Name</option>
            {loadingAdmins ? (
              <option disabled>Loading...</option>
            ) : (
              admins.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nama}</option>
              ))
            )}
          </select>
        </div>
        <div>
          <Label htmlFor="desainer" className="text-sm font-medium">Designer</Label>
          <select
            id="desainer"
            value={formData.desainer}
            onChange={e => onFormDataChange('desainer', e.target.value)}
            className="border rounded-md p-1 mt-1 min-w-[120px] w-full text-gray-700 text-sm h-8"
          >
            <option value="">Designer Name</option>
            {loadingDesigners ? (
              <option disabled>Loading...</option>
            ) : (
              designers.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nama}</option>
              ))
            )}
          </select>
        </div>
        <div>
          <Label htmlFor="komputer" className="text-sm font-medium">Computer</Label>
          <Input
            id="komputer"
            value={formData.komputer}
            onChange={(e) => onFormDataChange('komputer', e.target.value)}
            placeholder="Computer info"
            className="mt-1 h-8"
          />
        </div>
      </div>
    </>
  );
};

export default ServiceCostSection;

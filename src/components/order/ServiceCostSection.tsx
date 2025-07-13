import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            value={formData.jasaDesain ? `IDR ${parseFloat(formData.jasaDesain).toLocaleString('id-ID')}` : ''}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/[^\d]/g, '');
              onFormDataChange('jasaDesain', rawValue);
            }}
            placeholder="IDR 0"
            className="mt-1 h-8"
          />
        </div>
        <div>
          <Label htmlFor="biayaLain" className="text-sm font-medium">Other Costs</Label>
          <Input
            id="biayaLain"
            value={formData.biayaLain ? `IDR ${parseFloat(formData.biayaLain).toLocaleString('id-ID')}` : ''}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/[^\d]/g, '');
              onFormDataChange('biayaLain', rawValue);
            }}
            placeholder="IDR 0"
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
          <Select value={formData.admin} onValueChange={(value) => onFormDataChange('admin', value)}>
            <SelectTrigger className="mt-1 h-8">
              <SelectValue placeholder="Pilih Admin" />
            </SelectTrigger>
            <SelectContent>
              {loadingAdmins ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                admins.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.nama}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="desainer" className="text-sm font-medium">Designer</Label>
          <Select value={formData.desainer} onValueChange={(value) => onFormDataChange('desainer', value)}>
            <SelectTrigger className="mt-1 h-8">
              <SelectValue placeholder="Pilih Designer" />
            </SelectTrigger>
            <SelectContent>
              {loadingDesigners ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                designers.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.nama}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
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

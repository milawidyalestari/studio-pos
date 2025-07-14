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
    paymentType: string;
    jasaDesain: string;
    biayaLain: string;
    downPayment: string;
    pelunasan: string;
    taxChecked: boolean;
  };
  totalPrice: number;
  subtotal: number;
  onFormDataChange: (field: string, value: number | string | boolean) => void;
}

const PriceSummarySection: React.FC<PriceSummarySectionProps> = ({ formData, totalPrice, subtotal, onFormDataChange }) => {
  const { data: paymentTypes, isLoading: paymentTypesLoading, error: paymentTypesError } = usePaymentTypes();
  
  // Debug: log payment types data
  React.useEffect(() => {
    console.log('Payment types from database:', paymentTypes);
  }, [paymentTypes]);
  
  // Get all payment types from database (including Cash if it exists)
  const allPaymentTypes = paymentTypes || [];
  
  // Add Cash as default option if not in database
  const availablePaymentTypes = allPaymentTypes.length > 0 
    ? allPaymentTypes 
    : [{ id: 'cash', payment_method: 'Cash', code: 'CASH', type: 'Cash' }];
  
  // Controlled value for payment method (should be ID)
  const selectedPaymentTypeId = formData.paymentType || '';
  
  // Find the selected payment type for display
  const selectedPaymentType = availablePaymentTypes.find(pt => pt.id === selectedPaymentTypeId);
  
  // Calculate total including service costs
  const designService = parseFloat(formData.jasaDesain) || 0;
  const otherCosts = parseFloat(formData.biayaLain) || 0;
  const totalWithServices = subtotal + designService + otherCosts;

  // Calculate discount
  const discountPercent = Number(formData.discount) || 0;
  const totalAfterDiscount = totalWithServices - (totalWithServices * discountPercent / 100);

  // Tambahkan fungsi pembulatan custom
  function customRounding(value: number): number {
    const ribuan = Math.floor(value / 1000) * 1000;
    const sisa = value - ribuan;
    if (sisa >= 1 && sisa <= 499) return ribuan;
    if (sisa === 500) return ribuan + 500;
    if (sisa >= 501 && sisa <= 999) return ribuan + 1000;
    return value; // Sudah bulat ribuan
  }

  // Calculate tax (PPN)
  const taxPercent = Number(formData.ppn) || 0;
  const totalAfterTax = formData.taxChecked ? totalAfterDiscount + (totalAfterDiscount * taxPercent / 100) : totalAfterDiscount;

  // Terapkan pembulatan custom
  const roundedTotal = customRounding(totalAfterTax);

  // Calculate remaining amount (Sisa)
  const downPaymentAmount = parseFloat(formData.downPayment) || 0;
  const pelunasanAmount = parseFloat(formData.pelunasan) || 0;
  const sisa = roundedTotal - (downPaymentAmount + pelunasanAmount);

  // Untuk input PPN dan Discount agar 0 menjadi placeholder
  const ppnValue = String(formData.ppn) === '' || String(formData.ppn) === '0' ? '' : formData.ppn;
  const discountValue = String(formData.discount) === '' || String(formData.discount) === '0' ? '' : formData.discount;
  
  return (
    <div className="border-t bg-white pl-6 pr-6 pt-2 pb-6 flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">TOTAL</span>
        <span className="text-2xl font-bold text-[#0050C8]">{formatCurrency(roundedTotal)}</span>
      </div>
      {/* 2-column grid layout, compact and aligned */}
      <div className="grid grid-cols-2 gap-8 items-start mb-2">
        {/* Left column: vertical alignment, compact */}
        <div className="flex flex-col gap-3">
          {/* Tax */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-16 mr-2">PPN</Label>
            <Checkbox className="ml-0" checked={formData.taxChecked} onCheckedChange={val => onFormDataChange('taxChecked', !!val)} />
            <Input 
              value={ppnValue}
              onChange={(e) => {
                const val = e.target.value;
                onFormDataChange('ppn', val === '' ? '' : Number(val));
              }}
              className="h-8 px-2 py-1 flex-1" 
              type="number"
              placeholder="0"
            />
            <span className="text-sm ml-1 mr-16">%</span>
          </div>
          {/* Discount */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-16">Diskon</Label>
            <span className="w-6" />
            <Input 
              value={discountValue}
              onChange={(e) => {
                const val = e.target.value;
                onFormDataChange('discount', val === '' ? '' : Number(val));
              }}
              type="number"
              className="h-8 px-2 py-1 flex-1"
              placeholder="0"
            />
            <span className="text-sm ml-1 mr-16">%</span>
          </div>
        </div>
        {/* Right column: label beside input */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Uang Muka</Label>
            <Input 
              value={formData.downPayment ? `IDR ${parseFloat(formData.downPayment).toLocaleString('id-ID')}` : ''}
              placeholder="IDR 0" 
              className="h-8 px-2 py-1 flex-1" 
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, '');
                onFormDataChange('downPayment', rawValue);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Pelunasan</Label>
            <Input 
              value={formData.pelunasan ? `IDR ${parseFloat(formData.pelunasan).toLocaleString('id-ID')}` : ''}
              placeholder="IDR 0" 
              className="h-8 px-2 py-1 flex-1" 
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, '');
                onFormDataChange('pelunasan', rawValue);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28">Sisa</Label>
            <Input value={formatCurrency(sisa)} readOnly className="bg-gray-100 h-8 px-2 py-1 flex-1 " />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium w-28"> Tipe Pembayaran</Label>
            <Select value={selectedPaymentTypeId} onValueChange={val => onFormDataChange('paymentType', val)}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue placeholder="Pilih Metode">
                  {selectedPaymentType ? selectedPaymentType.payment_method : 'Pilih Metodea'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentTypesLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                {paymentTypesError && <SelectItem value="error" disabled>Error loading payment types</SelectItem>}
                {!paymentTypesLoading && !paymentTypesError && availablePaymentTypes.map((paymentType) => (
                  <SelectItem key={paymentType.id} value={paymentType.id}>
                    {paymentType.payment_method}
                  </SelectItem>
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

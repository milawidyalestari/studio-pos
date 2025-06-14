
import { useState, useEffect } from 'react';
import { OrderFormData } from '@/types/order';
import { generateOrderNumber } from '@/services/orderService';

const initialFormData: OrderFormData = {
  orderNumber: generateOrderNumber(),
  customer: '',
  tanggal: new Date().toISOString().split('T')[0],
  waktu: new Date().toTimeString().slice(0, 5),
  estimasi: '',
  estimasiWaktu: '',
  outdoor: false,
  laserPrinting: false,
  mugNota: false,
  jasaDesain: '',
  biayaLain: '',
  subTotal: '',
  discount: 0,
  ppn: 10,
  paymentType: '',
  bank: '',
  admin: '',
  desainer: '',
  komputer: '',
  notes: ''
};

export const useOrderForm = () => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      orderNumber: generateOrderNumber(),
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toTimeString().slice(0, 5),
    });
    setHasUnsavedChanges(false);
  };

  return {
    formData,
    hasUnsavedChanges,
    handleFormDataChange,
    resetForm,
    setHasUnsavedChanges
  };
};

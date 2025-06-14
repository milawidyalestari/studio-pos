
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import type { Database } from '@/integrations/supabase/types';

type CustomerLevel = Database['public']['Enums']['customer_level'];

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated?: (customer: any) => void;
}

const CustomerModal = ({ open, onClose, onCustomerCreated }: CustomerModalProps) => {
  const { createCustomer, isCreatingCustomer } = useCustomers();
  
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    whatsapp: '',
    email: '',
    address: '',
    level: 'Regular' as CustomerLevel
  });

  const generateCustomerCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `CUST${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      ...formData,
      kode: formData.kode || generateCustomerCode()
    };

    try {
      await createCustomer(customerData);
      if (onCustomerCreated) {
        onCustomerCreated(customerData);
      }
      handleClose();
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      kode: '',
      nama: '',
      whatsapp: '',
      email: '',
      address: '',
      level: 'Regular' as CustomerLevel
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="kode">Customer Code</Label>
            <Input
              id="kode"
              value={formData.kode}
              onChange={(e) => handleInputChange('kode', e.target.value)}
              placeholder="Auto-generated if empty"
            />
          </div>
          
          <div>
            <Label htmlFor="nama">Name *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              placeholder="Customer name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              placeholder="WhatsApp number"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email address"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Customer address"
            />
          </div>
          
          <div>
            <Label htmlFor="level">Customer Level</Label>
            <Select value={formData.level} onValueChange={(value: CustomerLevel) => handleInputChange('level', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingCustomer || !formData.nama}>
              {isCreatingCustomer ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerModal;

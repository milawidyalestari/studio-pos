
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CustomerLevel = 'Reguler' | 'VIP' | 'Vendor' | 'Organisasi';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated?: (customer: any) => void;
  onCustomerUpdated?: (customer: any) => void;
  editingCustomer?: any;
}

const CustomerModal = ({ open, onClose, onCustomerCreated, onCustomerUpdated, editingCustomer }: CustomerModalProps) => {
  const { createCustomer, updateCustomer, isCreatingCustomer, isUpdatingCustomer } = useCustomers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    whatsapp: '',
    email: '',
    address: '',
    level: 'Regular' as CustomerLevel
  });

  // Populate form when editing
  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        kode: editingCustomer.kode || '',
        nama: editingCustomer.nama || '',
        whatsapp: editingCustomer.whatsapp || '',
        email: editingCustomer.email || '',
        address: editingCustomer.address || '',
        level: editingCustomer.level || 'Reguler'
      });
    } else {
      setFormData({
        kode: '',
        nama: '',
        whatsapp: '',
        email: '',
        address: '',
        level: 'Reguler'
      });
    }
  }, [editingCustomer, open]);

  const generateCustomerCode = async () => {
    try {
      // Get existing customers to find the next available code
      const existingCustomers = await databaseService.query('customers', {
        select: 'kode',
        orderBy: { column: 'kode', direction: 'desc' },
        limit: 1
      });

      let nextNumber = 1;
      if (existingCustomers.length > 0) {
        const lastCode = existingCustomers[0].kode;
        if (lastCode && lastCode.startsWith('CUST')) {
          const numberPart = lastCode.replace('CUST', '');
          const lastNumber = parseInt(numberPart, 10);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
      }

      return `CUST${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating customer code:', error);
      // Fallback to timestamp-based code if query fails
      return `CUST${Date.now().toString().slice(-6)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.nama.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required.",
        variant: "destructive",
      });
      return;
    }
    
    let customerCode = formData.kode;
    if (!customerCode && !editingCustomer) {
      try {
        customerCode = await generateCustomerCode();
      } catch (error) {
        console.error('Failed to generate customer code:', error);
        // Use a fallback code
        customerCode = `CUST${Date.now().toString().slice(-6)}`;
      }
    }

    const customerData = {
      ...formData,
      kode: customerCode
    };

    try {
      if (editingCustomer) {
        // Update existing customer
        await updateCustomer({ id: editingCustomer.id, ...customerData });
        if (onCustomerUpdated) {
          onCustomerUpdated({ ...editingCustomer, ...customerData });
        }
      } else {
        // Create new customer
        const newCustomer = await createCustomer(customerData);
        if (onCustomerCreated) {
          onCustomerCreated(newCustomer);
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      kode: '',
      nama: '',
      whatsapp: '',
      email: '',
      address: '',
      level: 'Reguler' as CustomerLevel
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
          <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Tambah Customer Baru'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div >
            <Label htmlFor="kode" >Kode Customer</Label>
            <Input
              id="kode"
              value={formData.kode}
              onChange={(e) => handleInputChange('kode', e.target.value)}
              placeholder="Auto"
              disabled={true}
            />
          </div>
          
          <div>
            <Label htmlFor="nama">Nama *</Label>
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
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Customer address"
            />
          </div>
          
          <div>
            <Label htmlFor="level">Level Customer </Label>
            <Select value={formData.level} onValueChange={(value: CustomerLevel) => handleInputChange('level', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reguler">Reguler</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Vendor">Vendor</SelectItem>
                <SelectItem value="Organisasi">Organisasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={(isCreatingCustomer || isUpdatingCustomer) || !formData.nama}>
              {editingCustomer ? (isUpdatingCustomer ? 'Updating...' : 'Update Customer') : (isCreatingCustomer ? 'Creating...' : 'Create Customer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerModal;

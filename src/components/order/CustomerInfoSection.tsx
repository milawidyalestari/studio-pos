import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import CustomerModal from '@/components/CustomerModal';

interface CustomerInfoSectionProps {
  formData: {
    customer: string;
    customerId?: string;
    outdoor: boolean;
    laserPrinting: boolean;
    mugNota: boolean;
    tanggal: string;
    waktu: string;
    estimasi: string;
    estimasiWaktu: string;
  };
  onFormDataChange: (field: string, value: any) => void;
}

const CustomerInfoSection = ({ formData, onFormDataChange }: CustomerInfoSectionProps) => {
  const { customers, isLoading } = useCustomers();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers?.find(c => c.id === customerId);
    if (selectedCustomer) {
      onFormDataChange('customerId', customerId);
      onFormDataChange('customer', selectedCustomer.nama);
      setShowDropdown(false);
    }
  };

  const handleCustomerInputChange = (value: string) => {
    onFormDataChange('customer', value);
    // Clear customer ID when manually typing
    onFormDataChange('customerId', '');
    setShowDropdown(value.length > 0);
  };

  const handleCustomerCreated = (newCustomer: any) => {
    onFormDataChange('customer', newCustomer.nama);
    // Note: The customerId will be set once the customer list refreshes
  };

  const filteredCustomers = customers?.filter(customer => 
    customer.nama.toLowerCase().includes(formData.customer.toLowerCase())
  ) || [];

  return (
    <>
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Label htmlFor="customer" className="text-sm font-medium">Customer</Label>
            <Input
              id="customer"
              value={formData.customer}
              onChange={(e) => handleCustomerInputChange(e.target.value)}
              onFocus={() => setShowDropdown(formData.customer.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Enter customer name"
              className="mt-1"
            />
            
            {/* Dropdown for customer suggestions */}
            {showDropdown && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onMouseDown={() => handleCustomerSelect(customer.id)}
                  >
                    {customer.nama} ({customer.kode})
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            type="button" 
            size="sm" 
            className="bg-[#0050C8] hover:bg-[#003a9b] mt-6"
            onClick={() => setShowCustomerModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="outdoor"
              checked={formData.outdoor}
              onCheckedChange={(checked) => onFormDataChange('outdoor', !!checked)}
            />
            <Label htmlFor="outdoor" className="text-sm">Outdoor/Indoor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="laser"
              checked={formData.laserPrinting}
              onCheckedChange={(checked) => onFormDataChange('laserPrinting', !!checked)}
            />
            <Label htmlFor="laser" className="text-sm">Laser Printing</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mug"
              checked={formData.mugNota}
              onCheckedChange={(checked) => onFormDataChange('mugNota', !!checked)}
            />
            <Label htmlFor="mug" className="text-sm">Mug/Nota/Stemple</Label>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="tanggal" className="text-sm font-medium">Date</Label>
            <Input
              id="tanggal"
              type="date"
              value={formData.tanggal}
              onChange={(e) => onFormDataChange('tanggal', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="waktu" className="text-sm font-medium">Time</Label>
            <Input
              id="waktu"
              type="time"
              value={formData.waktu}
              onChange={(e) => onFormDataChange('waktu', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="estimasi" className="text-sm font-medium">Estimate Date</Label>
            <Input
              id="estimasi"
              type="date"
              value={formData.estimasi}
              onChange={(e) => onFormDataChange('estimasi', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="estimasiWaktu" className="text-sm font-medium">Time</Label>
            <Input
              id="estimasiWaktu"
              type="time"
              value={formData.estimasiWaktu}
              onChange={(e) => onFormDataChange('estimasiWaktu', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <CustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  );
};

export default CustomerInfoSection;

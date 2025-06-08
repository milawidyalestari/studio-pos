
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export const BusinessInfoTab = () => {
  const { toast } = useToast();
  const [businessInfo, setBusinessInfo] = useState({
    companyName: 'PT. Digital Printing Solutions',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    phone: '(021) 1234-5678',
    email: 'info@digitalprinting.com',
    website: 'www.digitalprinting.com',
    taxId: '01.234.567.8-901.000',
    businessType: 'Digital Printing Services',
    description: 'Professional digital printing services for business and personal needs.'
  });

  const handleInputChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Business information saved",
      description: "Your business information has been updated successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={businessInfo.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="business-type">Business Type</Label>
          <Input
            id="business-type"
            value={businessInfo.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
          />
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={businessInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={businessInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={businessInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={businessInfo.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tax-id">Tax ID</Label>
          <Input
            id="tax-id"
            value={businessInfo.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
          />
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={businessInfo.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Business Information</Button>
      </div>
    </div>
  );
};

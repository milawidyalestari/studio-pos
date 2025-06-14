
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CustomerInfoSectionProps {
  formData: {
    customer: string;
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
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Label htmlFor="customer" className="text-sm font-medium">Customer</Label>
          <Input
            id="customer"
            value={formData.customer}
            onChange={(e) => onFormDataChange('customer', e.target.value)}
            placeholder="Customer name"
            className="mt-1"
          />
        </div>
        <Button type="button" size="sm" className="bg-[#0050C8] hover:bg-[#003a9b] mt-6">
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
          <Label htmlFor="estimasi" className="text-sm font-medium">Estimate</Label>
          <Input
            id="estimasi"
            value={formData.estimasi}
            onChange={(e) => onFormDataChange('estimasi', e.target.value)}
            placeholder="Days"
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
  );
};

export default CustomerInfoSection;

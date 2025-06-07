
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MasterDataItem } from './MasterDataOverlay';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
}

interface MasterDataFormProps {
  fields: FormField[];
  initialData?: MasterDataItem | null;
  onSubmit: (data: MasterDataItem) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const MasterDataForm: React.FC<MasterDataFormProps> = ({
  fields,
  initialData,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const data: Record<string, string> = {};
      fields.forEach(field => {
        data[field.key] = initialData[field.key] || '';
      });
      setFormData(data);
    } else {
      const data: Record<string, string> = {};
      fields.forEach(field => {
        data[field.key] = '';
      });
      setFormData(data);
    }
    setErrors({});
  }, [initialData, fields]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData as MasterDataItem);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Edit Record' : 'Add New Record'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'text' ? (
                <Input
                  id={field.key}
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className={errors[field.key] ? 'border-red-500' : ''}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'select' && field.options ? (
                <Select
                  value={formData[field.key] || ''}
                  onValueChange={(value) => handleInputChange(field.key, value)}
                >
                  <SelectTrigger className={errors[field.key] ? 'border-red-500' : ''}>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              
              {errors[field.key] && (
                <p className="text-red-500 text-xs">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};

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
import { Product } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    jenis: '',
    satuan: '',
    harga_beli: 0,
    harga_jual: 0,
    stok_opname: 0,
    category_id: '',
    stok_minimum: 0,
    stok_awal: 0,
    stok_masuk: 0,
    stok_keluar: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: categories = [] } = useProductCategories();

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode: initialData.kode || '',
        nama: initialData.nama || '',
        jenis: initialData.jenis || '',
        satuan: initialData.satuan || '',
        harga_beli: initialData.harga_beli || 0,
        harga_jual: initialData.harga_jual || 0,
        stok_opname: initialData.stok_opname || 0,
        category_id: initialData.category_id || '',
        stok_minimum: initialData.stok_minimum || 0,
        stok_awal: initialData.stok_awal || 0,
        stok_masuk: initialData.stok_masuk || 0,
        stok_keluar: initialData.stok_keluar || 0
      });
    }
    setErrors({});
  }, [initialData]);

  const handleInputChange = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.kode.trim()) {
      newErrors.kode = 'Product code is required';
    }
    if (!formData.nama.trim()) {
      newErrors.nama = 'Product name is required';
    }
    if (!formData.jenis.trim()) {
      newErrors.jenis = 'Product type is required';
    }
    if (!formData.satuan.trim()) {
      newErrors.satuan = 'Unit is required';
    }
    if (formData.harga_beli < 0) {
      newErrors.harga_beli = 'Purchase price cannot be negative';
    }
    if (formData.harga_jual < 0) {
      newErrors.harga_jual = 'Selling price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // If "no-category" is selected, set category_id to undefined
      const submitData = {
        ...formData,
        category_id: formData.category_id === 'no-category' ? undefined : formData.category_id || undefined
      };
      onSubmit(submitData);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kode" className="text-sm font-medium">
              Product Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kode"
              type="text"
              value={formData.kode}
              onChange={(e) => handleInputChange('kode', e.target.value)}
              className={errors.kode ? 'border-red-500' : ''}
              placeholder="Enter product code"
            />
            {errors.kode && (
              <p className="text-red-500 text-xs">{errors.kode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-medium">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama"
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              className={errors.nama ? 'border-red-500' : ''}
              placeholder="Enter product name"
            />
            {errors.nama && (
              <p className="text-red-500 text-xs">{errors.nama}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenis" className="text-sm font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jenis"
              type="text"
              value={formData.jenis}
              onChange={(e) => handleInputChange('jenis', e.target.value)}
              className={errors.jenis ? 'border-red-500' : ''}
              placeholder="Enter product type"
            />
            {errors.jenis && (
              <p className="text-red-500 text-xs">{errors.jenis}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="satuan" className="text-sm font-medium">
              Unit <span className="text-red-500">*</span>
            </Label>
            <Input
              id="satuan"
              type="text"
              value={formData.satuan}
              onChange={(e) => handleInputChange('satuan', e.target.value)}
              className={errors.satuan ? 'border-red-500' : ''}
              placeholder="Enter unit (e.g., Roll, Pack, Meter)"
            />
            {errors.satuan && (
              <p className="text-red-500 text-xs">{errors.satuan}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleInputChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="no-category">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga_beli" className="text-sm font-medium">
              Purchase Price
            </Label>
            <Input
              id="harga_beli"
              type="number"
              min="0"
              step="0.01"
              value={formData.harga_beli}
              onChange={(e) => handleInputChange('harga_beli', parseFloat(e.target.value) || 0)}
              className={errors.harga_beli ? 'border-red-500' : ''}
              placeholder="0.00"
            />
            {errors.harga_beli && (
              <p className="text-red-500 text-xs">{errors.harga_beli}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga_jual" className="text-sm font-medium">
              Selling Price
            </Label>
            <Input
              id="harga_jual"
              type="number"
              min="0"
              step="0.01"
              value={formData.harga_jual}
              onChange={(e) => handleInputChange('harga_jual', parseFloat(e.target.value) || 0)}
              className={errors.harga_jual ? 'border-red-500' : ''}
              placeholder="0.00"
            />
            {errors.harga_jual && (
              <p className="text-red-500 text-xs">{errors.harga_jual}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_opname" className="text-sm font-medium">
              Current Stock
            </Label>
            <Input
              id="stok_opname"
              type="number"
              min="0"
              value={formData.stok_opname}
              onChange={(e) => handleInputChange('stok_opname', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_minimum" className="text-sm font-medium">
              Minimum Stock
            </Label>
            <Input
              id="stok_minimum"
              type="number"
              min="0"
              value={formData.stok_minimum}
              onChange={(e) => handleInputChange('stok_minimum', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_awal" className="text-sm font-medium">
              Initial Stock
            </Label>
            <Input
              id="stok_awal"
              type="number"
              min="0"
              value={formData.stok_awal}
              onChange={(e) => handleInputChange('stok_awal', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_masuk" className="text-sm font-medium">
              Stock In
            </Label>
            <Input
              id="stok_masuk"
              type="number"
              min="0"
              value={formData.stok_masuk}
              onChange={(e) => handleInputChange('stok_masuk', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_keluar" className="text-sm font-medium">
              Stock Out
            </Label>
            <Input
              id="stok_keluar"
              type="number"
              min="0"
              value={formData.stok_keluar}
              onChange={(e) => handleInputChange('stok_keluar', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">
            {isEditing ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

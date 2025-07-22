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
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useProductCodeGenerator } from '@/hooks/useProductCodeGenerator';
import { RefreshCw, Lock, Unlock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    stok_keluar: 0,
    kunci_harga: false, // field baru
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useUnits();
  const { generatedCode, isGenerating, regenerateCode } = useProductCodeGenerator();

  // Ambil data groups dari database
  const { data: groups = [], isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Tambahkan useEffect untuk generate kode produk berdasarkan tipe/group
  useEffect(() => {
    const generateProductCodeByGroup = async () => {
      // Cari group yang dipilih
      const selectedGroup = groups.find((g: any) => g.name === formData.jenis);
      if (!selectedGroup || !selectedGroup.code) return;
      const prefix = selectedGroup.code;
      // Query produk dengan prefix kode ini
      const { data: productsWithPrefix, error } = await supabase
        .from('products')
        .select('kode')
        .ilike('kode', `${prefix}%`);
      if (error) return;
      // Cari angka terbesar di belakang prefix
      let maxNumber = 0;
      (productsWithPrefix || []).forEach((p: any) => {
        const match = p.kode.match(new RegExp(`^${prefix}(\\d+)$`));
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) maxNumber = number;
        }
      });
      const nextNumber = maxNumber + 1;
      const newCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, kode: newCode }));
    };
    if (formData.jenis && groups.length > 0 && !isEditing) {
      generateProductCodeByGroup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jenis, groups, isEditing]);

  // Auto-fill product code for new products
  useEffect(() => {
    if (!isEditing && generatedCode && !formData.kode) {
      setFormData(prev => ({ ...prev, kode: generatedCode }));
      console.log('Auto-filled product code:', generatedCode);
    }
  }, [generatedCode, isEditing, formData.kode]);

  // Debug logging untuk melihat data kategori dan unit
  useEffect(() => {
    console.log('ProductForm - Categories data:', categories);
    console.log('ProductForm - Units data:', units);
    console.log('ProductForm - Units loading:', unitsLoading);
    console.log('ProductForm - Units error:', unitsError);
  }, [categories, units, unitsLoading, unitsError]);

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
        stok_keluar: initialData.stok_keluar || 0,
        kunci_harga: initialData.kunci_harga || false,
      });
    }
    setErrors({});
  }, [initialData]);

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleRegenerateCode = () => {
    if (!isEditing) {
      regenerateCode();
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
      // Validasi category_id: pastikan valid atau undefined untuk "no-category"
      const submitData = {
        ...formData,
        category_id: formData.category_id === 'no-category' || formData.category_id === '' ? undefined : formData.category_id
      };
      console.log('Submitting product data:', submitData);
      onSubmit(submitData);
    }
  };

  // Handler untuk menampilkan error jika ada masalah loading kategori atau unit
  if (categoriesError) {
    console.error('Error loading categories:', categoriesError);
  }
  if (unitsError) {
    console.error('Error loading units:', unitsError);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-medium">
              Nama Produk <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama"
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              className={`h-8${errors.nama ? ' border-red-500' : ''}`}
              placeholder="Masukkan nama produk"
            />
            {errors.nama && (
              <p className="text-red-500 text-xs">{errors.nama}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kode" className="text-sm font-medium">
              Kode Produk <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="kode"
                type="text"
                value={formData.kode}
                onChange={() => {}}
                className={`h-8${errors.kode ? ' border-red-500' : ''}`}
                placeholder={isEditing ? "Enter product code" : "Auto-generated code"}
                readOnly={true}
              />
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateCode}
                  disabled={isGenerating}
                  className="px-3 h-8"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            {errors.kode && (
              <p className="text-red-500 text-xs">{errors.kode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenis" className="text-sm font-medium">
              Kelompok <span className="text-red-500">*</span>
              {groupsLoading && <span className="text-blue-500 text-xs ml-2">(Memuat...)</span>}
              {groupsError && <span className="text-red-500 text-xs ml-2">(Gagal memuat kelompok)</span>}
            </Label>
            <Select
              value={formData.jenis}
              onValueChange={(value) => {
                handleInputChange('jenis', value);
                // Kode akan auto-generate via useEffect
              }}
              disabled={groupsLoading}
            >
              <SelectTrigger className={`h-8${groupsError ? ' border-red-500' : ''}`}>
                <SelectValue placeholder={
                  groupsLoading ? 'Memuat kelompok...' :
                  groupsError ? 'Gagal memuat kelompok' :
                  'Pilih kelompok'
                } />
              </SelectTrigger>
              <SelectContent className="bg-white z-50 max-h-60 overflow-y-auto">
                {groups && groups.length > 0 ? (
                  groups.map((group: any) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  !groupsLoading && (
                    <SelectItem value="debug-info" disabled>
                      Debug: {groups ? `${groups.length} types found` : 'Groups is null/undefined'}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.jenis && (
              <p className="text-red-500 text-xs">{errors.jenis}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="satuan" className="text-sm font-medium">
              Satuan <span className="text-red-500">*</span>
              {unitsLoading && <span className="text-blue-500 text-xs ml-2">(Memuat...)</span>}
              {unitsError && <span className="text-red-500 text-xs ml-2">(Gagal memuat satuan)</span>}
            </Label>
            <Select
              value={formData.satuan}
              onValueChange={(value) => {
                console.log('Unit selected:', value);
                handleInputChange('satuan', value);
              }}
              disabled={unitsLoading}
            >
              <SelectTrigger className={`${unitsError ? 'border-red-500' : ''} h-8`}>
                <SelectValue placeholder={
                  unitsLoading ? "Memuat satuan..." : 
                  unitsError ? "Gagal memuat satuan" :
                  "Pilih satuan"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white z-50 max-h-60 overflow-y-auto">
                {units && units.length > 0 ? (
                  units.map((unit) => {
                    console.log('Rendering unit:', unit);
                    return (
                      <SelectItem key={unit.id} value={unit.name}>
                        {unit.name}
                      </SelectItem>
                    );
                  })
                ) : (
                  !unitsLoading && (
                    <SelectItem value="debug-info" disabled>
                      Debug: {units ? `${units.length} units found` : 'Units is null/undefined'}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            
            {unitsError && (
              <p className="text-red-500 text-xs">
                Gagal Memuat Unit. Unit harus di atur lewat Unit Data Management
                Error: {unitsError.message || 'Unknown error'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-sm font-medium">
              Kategori
              {categoriesLoading && <span className="text-blue-500 text-xs ml-2">(Memuat...)</span>}
              {categoriesError && <span className="text-red-500 text-xs ml-2">(Gagal memuat kategori)</span>}
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => {
                console.log('Category selected:', value);
                handleInputChange('category_id', value);
              }}
              disabled={categoriesLoading}
            >
              <SelectTrigger className={`${categoriesError ? 'border-red-500' : ''} h-8`}>
                <SelectValue placeholder={
                  categoriesLoading ? "Memuat kategori..." : 
                  categoriesError ? "Gagal memuat kategori" :
                  "Pilih kategori"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white z-50 max-h-60 overflow-y-auto">
                <SelectItem value="no-category">No Category</SelectItem>
                {categories && categories.length > 0 ? (
                  categories.map((category) => {
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {category.category_name}
                      </SelectItem>
                    );
                  })
                ) : (
                  !categoriesLoading && (
                    <SelectItem value="debug-info" disabled>
                      Debug: {categories ? `${categories.length} categories found` : 'Categories is null/undefined'}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            
            {categoriesError && (
              <p className="text-red-500 text-xs">
                Gagal memuat kategori produk. Kategori produk harus dikelola melalui Manajemen Data Kategori Produk.
                Error: {categoriesError.message || 'Unknown error'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga_beli" className="text-sm font-medium">
              Harga Beli
            </Label>
            <Input
              id="harga_beli"
              type="number"
              min="0"
              value={formData.harga_beli === 0 ? '' : formData.harga_beli}
              onChange={(e) => handleInputChange('harga_beli', e.target.value === '' ? '' : parseFloat(e.target.value))}
              className={`h-8${errors.harga_beli ? ' border-red-500' : ''}`}
              placeholder="IDR 00,00"
            />
            {errors.harga_beli && (
              <p className="text-red-500 text-xs">{errors.harga_beli}</p>
            )}
          </div>

          <div className="grid grid-cols-10 gap-1">
            {/* Kolom 1-4: Harga Jual (lebih lebar lagi) */}
            <div className="col-span-9 space-y-2">
              <Label htmlFor="harga_jual" className="text-sm font-medium">
                Harga Jual
              </Label>
              <Input
                id="harga_jual"
                type="number"
                min="0"
                value={formData.harga_jual === 0 ? '' : formData.harga_jual}
                onChange={(e) =>
                  handleInputChange(
                    'harga_jual',
                    e.target.value === '' ? '' : parseFloat(e.target.value)
                  )
                }
                className={`h-8${errors.harga_jual ? ' border-red-500' : ''} `}
                placeholder="IDR 00,00"
              />
              {errors.harga_jual && (
                <p className="text-red-500 text-xs">{errors.harga_jual}</p>
              )}
            </div>

            {/* Kolom 7: Kunci Harga (gembok) */}
            <div className="flex items-end">
              <div className="flex items-center gap-1 mb-1 ml-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('kunci_harga', !formData.kunci_harga)}
                  className={`p-1 rounded transition-colors ${
                    formData.kunci_harga 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={formData.kunci_harga ? 'Buka Kunci Harga' : 'Kunci Harga'}
                >
                  {formData.kunci_harga ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_opname" className="text-sm font-medium">
              Stok Opname
            </Label>
            <Input
              id="stok_opname"
              type="number"
              min="0"
              value={formData.stok_opname === 0 ? '' : formData.stok_opname}
              onChange={(e) => handleInputChange('stok_opname', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="h-8"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_minimum" className="text-sm font-medium">
              Stok Minimum
            </Label>
            <Input
              id="stok_minimum"
              type="number"
              min="0"
              value={formData.stok_minimum === 0 ? '' : formData.stok_minimum}
              onChange={(e) => handleInputChange('stok_minimum', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="h-8"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_awal" className="text-sm font-medium">
            Stok Awal
            </Label>
            <Input
              id="stok_awal"
              type="number"
              min="0"
              value={formData.stok_awal === 0 ? '' : formData.stok_awal}
              onChange={(e) => handleInputChange('stok_awal', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="h-8"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_masuk" className="text-sm font-medium">
              Stok Masuk
            </Label>
            <Input
              id="stok_masuk"
              type="number"
              min="0"
              value={formData.stok_masuk === 0 ? '' : formData.stok_masuk}
              onChange={(e) => handleInputChange('stok_masuk', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="h-8"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok_keluar" className="text-sm font-medium">
              Stok Keluar
            </Label>
            <Input
              id="stok_keluar"
              type="number"
              min="0"
              value={formData.stok_keluar === 0 ? '' : formData.stok_keluar}
              onChange={(e) => handleInputChange('stok_keluar', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="h-8"
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
      {categories && categories.length === 0 && !categoriesLoading && (
        <p className="text-xs text-amber-600">Tidak ada kategori produk ditemukan. Silakan tambahkan kategori produk terlebih dahulu di menu Master Data &gt; Kategori Produk.</p>
      )}
    </div>
  );
};

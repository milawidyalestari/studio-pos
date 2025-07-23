import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadSelect,
} from "@/components/ui/select";
import { Product } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useProductCodeGenerator } from '@/hooks/useProductCodeGenerator';
import { RefreshCw, Lock, Unlock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ReactSelect from 'react-select';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ProductForm: React.FC<ProductFormProps & { initialMaterials?: string[] }> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  initialMaterials = [],
}) => {
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    jenis: '',
    satuan: '',
    harga_beli: 0,
    harga_jual: 0,
    category_id: '',
    kunci_harga: false, // field baru
    bahan_id: '', // field baru untuk bahan
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

  // Ambil data bahan/materials dari database
  const { data: materials = [], isLoading: materialsLoading, error: materialsError } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('id, nama');
      if (error) throw error;
      return data || [];
    },
  });

  // State untuk multi-select bahan
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const selectRef = useRef<any>(null);

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

  // Saat edit, isi bahan terpilih jika ada
  useEffect(() => {
    if (initialData && initialData.bahan_id) {
      // Jika initialData.bahan_id adalah array, map ke format react-select
      if (Array.isArray(initialData.bahan_id)) {
        setSelectedMaterials(
          initialData.bahan_id.map((id: string) => {
            const mat = materials.find((m: any) => m.id === id);
            return mat ? { value: mat.id, label: mat.nama } : null;
          }).filter(Boolean)
        );
      } else if (typeof initialData.bahan_id === 'string') {
        // Jika hanya satu id
        const mat = materials.find((m: any) => m.id === initialData.bahan_id);
        setSelectedMaterials(mat ? [{ value: mat.id, label: mat.nama }] : []);
      }
    }
  }, [initialData, materials]);

  // Saat edit produk, set selectedMaterials dari initialMaterials
  useEffect(() => {
    if (isEditing && initialMaterials.length > 0 && materials.length > 0) {
      setSelectedMaterials(
        initialMaterials
          .map(id => {
            const mat = materials.find((m: any) => m.id === id);
            return mat ? { value: mat.id, label: mat.nama } : null;
          })
          .filter(Boolean)
      );
      // Paksa focus lalu blur agar layout normal
      setTimeout(() => {
        if (selectRef.current && selectRef.current.focus) {
          selectRef.current.focus();
          selectRef.current.blur();
        }
      }, 100);
    }
    if (!isEditing) {
      setSelectedMaterials([]);
    }
  }, [isEditing, initialMaterials, materials]);

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
        category_id: initialData.category_id || '',
        kunci_harga: initialData.kunci_harga || false,
        bahan_id: initialData.bahan_id || '', // Initialize bahan_id
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

  // Handler untuk multi-select bahan agar tidak error readonly array
  const handleMaterialsChange = (newValue: any, _actionMeta: any) => {
    setSelectedMaterials(Array.isArray(newValue) ? Array.from(newValue) : []);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.kode.trim()) {
      newErrors.kode = 'Kode produk wajib diisi';
    }
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama produk wajib diisi';
    }
    if (!formData.jenis.trim()) {
      newErrors.jenis = 'Kelompok produk wajib diisi';
    }
    if (!formData.satuan.trim()) {
      newErrors.satuan = 'Satuan wajib diisi';
    }
    if (formData.harga_beli < 0) {
      newErrors.harga_beli = 'Harga beli tidak boleh negatif';
    }
    if (formData.harga_jual < 0) {
      newErrors.harga_jual = 'Harga jual tidak boleh negatif';
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
        category_id: !formData.category_id || formData.category_id === 'no-category' ? null : formData.category_id,
        bahan_id: !formData.bahan_id ? null : formData.bahan_id,
      };
      // Hapus property yang nilainya string kosong agar tidak error UUID
      Object.keys(submitData).forEach(
        (key) => (submitData[key] === '' || submitData[key] === undefined) && delete submitData[key]
      );
      onSubmit({ ...submitData, materialIds: selectedMaterials.map(m => m.value) });
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

          {/* Dropdown Bahan multi-select */}
          <div className="space-y-2">
            <Label htmlFor="bahan_id" className="text-sm font-medium">Bahan</Label>
            <ReactSelect
              ref={selectRef}
              isMulti
              isLoading={materialsLoading}
              options={materials.map((mat: any) => ({ value: mat.id, label: mat.nama }))}
              value={selectedMaterials}
              onChange={handleMaterialsChange}
              placeholder="Pilih bahan"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 32,
                  height: 32,
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem', // text-sm
                  backgroundColor: 'white',
                  color: '#334155', // text-slate-700
                  borderColor: '#e5e7eb', // border-gray-200
                  boxShadow: 'none',
                  alignItems: 'center',
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: 20,
                  minHeight: 20,
                  alignItems: 'center',
                  padding: '0 4px',
                  boxSizing: 'border-box',
                }),
                multiValue: (base) => ({
                  ...base,
                  height: 24,
                  minHeight: 24,
                  display: 'flex',
                  alignItems: 'top',
                  marginTop: 4,
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  paddingTop: 6,
                  paddingBottom: 0,
                  backgroundColor: '#f1f5f9', // bg-slate-100
                  color: '#334155', // text-slate-700
                  fontSize: '0.875rem',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  lineHeight: 1.2,
                  fontSize: '0.75rem',
                  padding: '0 4px',
                  alignItems : 'top',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#64748b', // text-slate-400
                  padding: 4,
                  ':hover': { backgroundColor: '#e2e8f0', color: '#334155' },
                }),
                input: (base) => ({
                  ...base,
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  color: '#334155',
                }),
                placeholder: (base) => ({
                  ...base,
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  color: '#64748b',// text-slate-400
                  paddingLeft : '4px',
                  alignItems : 'center',
                }),
                menu: (base) => ({
                  ...base,
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                }),
              }}
            />
            {materialsError && (
              <p className="text-red-500 text-xs">Gagal memuat bahan</p>
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
            <div className="flex items-end gap-2">
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
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">
            {isEditing ? 'Update Produk' : 'Simpan Produk'}
          </Button>
        </div>
      </form>
      {categories && categories.length === 0 && !categoriesLoading && (
        <p className="text-xs text-amber-600">Tidak ada kategori produk ditemukan. Silakan tambahkan kategori produk terlebih dahulu di menu Master Data &gt; Kategori Produk.</p>
      )}
    </div>
  );
};

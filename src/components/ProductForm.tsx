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
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { materialData?: Array<{material_id: string, quantity_per_unit: number}> }) => void;
  onCancel: () => void;
  isEditing: boolean;
  materials?: any[]; // Tambahan: materials dari parent
}

export const ProductForm: React.FC<ProductFormProps & { 
  initialMaterials?: string[];
  initialMaterialData?: Array<{material_id: string, quantity_per_unit: number}>;
}> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  initialMaterials = [],
  initialMaterialData = [],
  materials: materialsProp // Tambahan
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

  // Ambil data bahan/materials dari database (hanya jika tidak ada materialsProp)
  const { data: materialsFromQuery = [], isLoading: materialsLoading, error: materialsError } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('id, nama');
      if (error) throw error;
      return data || [];
    },
    enabled: !materialsProp || materialsProp.length === 0, // Hanya query jika tidak ada materialsProp
  });

  // Gunakan materialsProp jika tersedia, jika tidak gunakan data dari query
  const materials = materialsProp && materialsProp.length > 0 ? materialsProp : materialsFromQuery;

  // State untuk multi-select bahan
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [materialQuantities, setMaterialQuantities] = useState<Record<string, number>>({});
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

  // Inisialisasi selectedMaterials dan materialQuantities dari initialMaterials dan initialMaterialData (untuk editing)
  useEffect(() => {
    if (isEditing && initialMaterials.length > 0 && materials.length > 0) {
      const selectedMats = initialMaterials
          .map(id => {
            const mat = materials.find((m: any) => m.id === id);
            return mat ? { value: mat.id, label: mat.nama } : null;
          })
        .filter(Boolean);
      setSelectedMaterials(selectedMats);
      // Inisialisasi materialQuantities dari initialMaterialData
      const quantities: Record<string, number> = {};
      initialMaterialData.forEach(item => {
        quantities[item.material_id] = item.quantity_per_unit;
      });
      setMaterialQuantities(quantities);
      console.log('Initialized selectedMaterials for editing:', selectedMats);
      console.log('Initialized materialQuantities for editing:', quantities);
    }
    // Jangan reset state pada mode tambah produk!
  }, [isEditing, initialMaterials, initialMaterialData, materials]);

  // Debug logging untuk melihat data kategori dan unit
  useEffect(() => {
    console.log('ProductForm - Categories data:', categories);
    console.log('ProductForm - Units data:', units);
    console.log('ProductForm - Units loading:', unitsLoading);
    console.log('ProductForm - Units error:', unitsError);
    console.log('ProductForm - Materials data:', materials);
    console.log('ProductForm - Materials loading:', materialsLoading);
    console.log('ProductForm - Materials error:', materialsError);
    console.log('ProductForm - MaterialsProp:', materialsProp);
  }, [categories, units, unitsLoading, unitsError, materials, materialsLoading, materialsError, materialsProp]);

  useEffect(() => {
    if (initialData) {
      // Cek apakah formData sudah sama dengan initialData, jika ya jangan setFormData
      if (
        formData.kode !== (initialData.kode || '') ||
        formData.nama !== (initialData.nama || '') ||
        formData.jenis !== (initialData.jenis || '') ||
        formData.satuan !== (initialData.satuan || '') ||
        formData.harga_beli !== (initialData.harga_beli || 0) ||
        formData.harga_jual !== (initialData.harga_jual || 0) ||
        formData.category_id !== (initialData.category_id || '') ||
        formData.kunci_harga !== (initialData.kunci_harga || false) ||
        formData.bahan_id !== (initialData.bahan_id || '')
      ) {
        setFormData({
          kode: initialData.kode || '',
          nama: initialData.nama || '',
          jenis: initialData.jenis || '',
          satuan: initialData.satuan || '',
          harga_beli: initialData.harga_beli || 0,
          harga_jual: initialData.harga_jual || 0,
          category_id: initialData.category_id || '',
          kunci_harga: initialData.kunci_harga || false,
          bahan_id: initialData.bahan_id || '',
        });
      }
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
    const materialsArray = Array.isArray(newValue) ? Array.from(newValue) : [];
    setSelectedMaterials(materialsArray);
    // Update quantities untuk bahan yang baru ditambahkan
    const newQuantities = { ...materialQuantities };
    materialsArray.forEach((material: any) => {
      if (!newQuantities[material.value]) {
        newQuantities[material.value] = 0; // Default quantity = 0 (placeholder)
      }
      // Jika edit mode dan bahan sudah ada di initialMaterialData, gunakan nilai yang ada
      if (isEditing && initialMaterialData.length > 0) {
        const existingData = initialMaterialData.find(item => item.material_id === material.value);
        if (existingData) {
          newQuantities[material.value] = existingData.quantity_per_unit;
        }
      }
    });
    // Hapus quantities untuk bahan yang dihapus
    Object.keys(newQuantities).forEach(materialId => {
      if (!materialsArray.find((m: any) => m.value === materialId)) {
        delete newQuantities[materialId];
      }
    });
    setMaterialQuantities(newQuantities);
    console.log('Materials changed:', materialsArray);
    console.log('Material quantities:', newQuantities);
  };

  const handleQuantityChange = (materialId: string, quantity: number) => {
    setMaterialQuantities(prev => ({
      ...prev,
      [materialId]: Math.max(0, quantity) // Minimum 0 (allow empty/placeholder)
    }));
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
    e.stopPropagation();
    if (validateForm()) {
      const materialData = selectedMaterials.map((material: any) => ({
        material_id: material.value,
        quantity_per_unit: materialQuantities[material.value] || (isEditing ? 1 : 0)
      }));
      console.log('Submitting form with materialData:', materialData);
      const submitData = {
        ...formData,
        category_id: !formData.category_id || formData.category_id === 'no-category' ? null : formData.category_id,
        bahan_id: !formData.bahan_id ? null : formData.bahan_id,
        materialData: materialData
      };
      Object.keys(submitData).forEach(
        (key) => (submitData[key] === '' || submitData[key] === undefined) && delete submitData[key]
      );
      console.log('Final submitData:', submitData);
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

  //styling dropdown
  const styles = {
    valueContainer: (base: any) => ({
      ...base,
      minHeight: '32px', // h-8
      height: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '2px',
      padding: '0px 8px',
    }),
    multiValue: (base: any) => ({
      ...base,
      minHeight: 20,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      backgroundColor: '#f1f5f9',
      color: '#334155',
      fontSize: '0.5rem',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      fontSize: '0.8rem',
      padding: '0 6px',
      lineHeight: 1.2,
    }),
    control: (base: any, state: any) => ({
      ...base,
      minHeight: '28px',
      borderRadius: '0.4rem', // rounded-lg
      borderColor: state.isFocused ? '#0a0a0a' : '#E2E8F0', // hitam pas fokus
      boxShadow: state.isFocused ? '0 0 0 1px #0a0a0a' : 'none',
      '&:hover': {
        borderColor: '#E2E8F0',
      },
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      display: 'none',
    }),
    indicatorSeparator: (base: any) => ({
      ...base,
      display: 'none',
    }),
    clearIndicator: (base: any) => ({
      ...base,
      padding:'2px 10px 0px 0px',
      svg: {
        width: 16,
        height: 16,
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      minHeight: 28,
      height: 32,
      width: 'auto',
      padding:'0px 20px',
      fontSize: '0.875rem',
      fontWeight: 400,
      borderRadius: '0.2rem',
      margin: '0px 4px 4px',
      backgroundColor: (state.isFocused || state.isSelected) ? '#F1F5F9 !important' : '#ffffff !important',
      display: 'flex',
      alignItems: 'center',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#0a0a0a', // warna abu-abu (tw slate-400)
      fontSize: '0.875rem',
      fontWeight: 400,
      opacity: 1,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 250, // misal 120px, sesuaikan dengan kebutuhan
      scrollbarWidth: 'none',        // Firefox
      msOverflowStyle: 'none',       // IE and Edge
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.4rem',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      opacity: 0,
      transform: 'scale(0.97)',
      animation: 'fadeZoomIn 300ms cubic-bezier(0.16,1,0.3,1) forwards',
      transformOrigin: 'top center',
    }),
  };
  



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

          {/* Dropdown Bahan multi-select dengan quantity */}
          <div className="space-y-2">
            <Label htmlFor="bahan_id" className="text-sm font-medium">Bahan</Label>
            <ReactSelect
              ref={selectRef}
              isMulti
              isLoading={materialsLoading}
              options={materials.map((mat: any) => ({ 
                value: mat.id, 
                label: mat.nama || mat.name || `${mat.kode} - ${mat.nama}` 
              }))}
              value={selectedMaterials}
              onChange={handleMaterialsChange}
              placeholder="Pilih bahan"
              classNamePrefix="bahan-grid"
              styles={styles}
              menuPlacement="top"
              menuShouldScrollIntoView={false}
              closeMenuOnScroll={false}
            />
            {/* Quantity inputs untuk setiap bahan yang dipilih */}
            {selectedMaterials.length > 0 && (
              <div className="space-y-2 mt-3">
                <Label className="text-sm font-medium">Jumlah Bahan per Unit Produk</Label>
                {selectedMaterials.map((material: any) => (
                  <div key={material.value} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-[120px]">
                      {material.label}:
                    </span>
                                         <Input
                       type="number"
                       min="0.1"
                       step="0.1"
                       value={materialQuantities[material.value] > 0 ? materialQuantities[material.value] : ''}
                       onChange={(e) => handleQuantityChange(material.value, parseFloat(e.target.value) || 0)}
                       className="h-8 w-20"
                       placeholder="1"
                     />
                    <span className="text-xs text-gray-500">
                      unit per produk
                    </span>
                  </div>
                ))}
              </div>
            )}
            {errors.bahan_id && (
              <p className="text-red-500 text-xs">{errors.bahan_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1">
            {/* Kolom 1-4: Harga Jual (lebih lebar lagi) */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="harga_jual" className="text-sm font-medium">
                Harga Jual
              </Label>
              <div className="relative">
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
                  className={`h-8 pr-8${errors.harga_jual ? ' border-red-500' : ''}`}
                  placeholder="IDR 00,00"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('kunci_harga', !formData.kunci_harga)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors bg-white ${
                    formData.kunci_harga 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={formData.kunci_harga ? 'Buka Kunci Harga' : 'Kunci Harga'}
                  style={{ zIndex: 2 }}
                >
                  {formData.kunci_harga ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.harga_jual && (
                <p className="text-red-500 text-xs">{errors.harga_jual}</p>
              )}
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

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUnits } from '@/hooks/useUnits';
import { useMaterials } from '@/hooks/useMaterials';
import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useUnits();
  const { refetch } = useMaterials();
  
  const [addForm, setAddForm] = useState({
    kode: '',
    nama: '',
    satuan: '',
    lebar_maksimum: '',
    stok_awal: '',
    stok_masuk: '',
    stok_keluar: '',
    stok_akhir: '',
    stok_opname: '',
    stok_aktif: false,
    stok_minimum: '',
    kategori: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);

  // Fungsi untuk generate kode otomatis
  const generateKodeBahan = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('kode')
      .order('kode', { ascending: false })
      .limit(1);
    let nextNumber = 1;
    if (data && data.length > 0 && data[0].kode) {
      const match = data[0].kode.match(/^BHN(\d{4})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const newKode = `BHN${nextNumber.toString().padStart(4, '0')}`;
    setAddForm(prev => ({ ...prev, kode: newKode }));
  };

  // Reset form dan generate kode saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setAddForm({
        kode: '',
        nama: '',
        satuan: '',
        lebar_maksimum: '',
        stok_awal: '',
        stok_masuk: '',
        stok_keluar: '',
        stok_akhir: '',
        stok_opname: '',
        stok_aktif: false,
        stok_minimum: '',
        kategori: '',
      });
      setErrors({});
      generateKodeBahan();
    }
  }, [isOpen]);

  // Ambil data kategori dari Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, category_name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleAddFormChange = (key: string, value: string | boolean) => {
    setAddForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newErrors: Record<string, string> = {};
    if (!addForm.kode.trim()) newErrors.kode = 'Kode wajib diisi';
    if (!addForm.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!addForm.satuan.trim()) newErrors.satuan = 'Satuan wajib diisi';
    if (!addForm.kategori) newErrors.kategori = 'Kategori wajib diisi';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setAddLoading(true);
    const payload = {
      kode: addForm.kode,
      nama: addForm.nama,
      satuan: addForm.satuan,
      lebar_maksimum: addForm.lebar_maksimum ? parseFloat(addForm.lebar_maksimum) : null,
      harga_per_meter: 0,
      stok_awal: addForm.stok_awal ? parseInt(addForm.stok_awal) : 0,
      stok_masuk: addForm.stok_masuk ? parseInt(addForm.stok_masuk) : 0,
      stok_keluar: addForm.stok_keluar ? parseInt(addForm.stok_keluar) : 0,
      stok_akhir: addForm.stok_akhir ? parseInt(addForm.stok_akhir) : 0,
      stok_opname: addForm.stok_opname ? parseInt(addForm.stok_opname) : 0,
      stok_aktif: !!addForm.stok_aktif,
      stok_minimum: addForm.stok_minimum ? parseInt(addForm.stok_minimum) : 0,
      kategori: addForm.kategori,
    };

    const { data: inserted, error } = await supabase.from('materials').insert([payload]).select();
    setAddLoading(false);
    
    if (error) {
      toast({ title: 'Error', description: 'Gagal menambah item', variant: 'destructive' });
    } else {
      // Catat mutasi stok awal jika ada
      if (payload.stok_awal > 0 && inserted && inserted[0]) {
        await supabase.from('inventory_movements').insert({
          material_id: inserted[0].id,
          tanggal: dayjs().toISOString(),
          tipe_mutasi: 'stok_awal',
          jumlah: payload.stok_awal,
          keterangan: 'Input stok awal',
          user_id: null,
        });
      }
      toast({ title: 'Success', description: 'Item berhasil ditambahkan' });
      onClose();
      refetch();
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-6 border rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-2">Tambah Bahan/Item Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama <span className="text-red-500">*</span></label>
              <Input 
                value={addForm.nama} 
                onChange={e => handleAddFormChange('nama', e.target.value)} 
                className={`h-8${errors.nama ? ' border-red-500' : ''}`} 
                placeholder="Masukan nama stok" 
              />
              {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Kode <span className="text-red-500">*</span></label>
              <Input 
                value={addForm.kode} 
                readOnly 
                className={`h-8 text-gray-400 bg-gray-50`} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Lebar Maksimum</label>
              <Input 
                type="number" 
                value={addForm.lebar_maksimum} 
                onChange={e => handleAddFormChange('lebar_maksimum', e.target.value)} 
                className={`h-8${errors.lebar_maksimum ? ' border-red-500' : ''}`} 
                placeholder="Maksimum ukuran cetak" 
              />
              {errors.lebar_maksimum && <p className="text-red-500 text-xs mt-1">{errors.lebar_maksimum}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Satuan <span className="text-red-500">*</span></label>
                <Select
                  value={addForm.satuan}
                  onValueChange={value => handleAddFormChange('satuan', value)}
                  disabled={unitsLoading || !!unitsError}
                >
                  <SelectTrigger className={`h-8${errors.satuan ? ' border-red-500' : ''}`}>
                    <SelectValue placeholder={unitsLoading ? 'Memuat...' : unitsError ? 'Gagal memuat satuan' : 'Pilih satuan'} />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.satuan && <p className="text-red-500 text-xs mt-1">{errors.satuan}</p>}
                {unitsError && <p className="text-red-500 text-xs mt-1">Gagal memuat satuan</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Kategori <span className="text-red-500">*</span></label>
                <Select
                  value={addForm.kategori || ''}
                  onValueChange={value => handleAddFormChange('kategori', value)}
                >
                  <SelectTrigger className={`h-8${errors.kategori ? ' border-red-500' : ''}`}>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.category_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kategori && <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stok Awal</label>
              <Input 
                type="number" 
                value={addForm.stok_awal} 
                onChange={e => handleAddFormChange('stok_awal', e.target.value)} 
                className="h-8" 
                placeholder="0" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stok Akhir</label>
              <Input 
                type="number" 
                value={addForm.stok_akhir} 
                onChange={e => handleAddFormChange('stok_akhir', e.target.value)} 
                className="h-8" 
                placeholder="0" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stok Masuk</label>
              <Input 
                type="number" 
                value={addForm.stok_masuk} 
                onChange={e => handleAddFormChange('stok_masuk', e.target.value)} 
                className="h-8" 
                placeholder="0" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stok Keluar</label>
              <Input 
                type="number" 
                value={addForm.stok_keluar} 
                onChange={e => handleAddFormChange('stok_keluar', e.target.value)} 
                className="h-8" 
                placeholder="0" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stok Minimum</label>
              <Input 
                type="number" 
                value={addForm.stok_minimum} 
                onChange={e => handleAddFormChange('stok_minimum', e.target.value)} 
                className="h-8" 
                placeholder="0" 
              />
            </div>
            <div className="flex flex-col items-end justify-end pr-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="stok_aktif" className="text-sm font-medium select-none">
                  Stok Aktif?
                </label>
                <input
                  type="checkbox"
                  id="stok_aktif"
                  checked={!!addForm.stok_aktif}
                  onChange={e => handleAddFormChange('stok_aktif', e.target.checked)}
                  className="accent-blue-600 h-4 w-4"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 italic">
                *hanya aktifkan untuk barang satuan
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={addLoading} className="bg-[#0050C8] hover:bg-[#003a9b]">
              {addLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockModal; 
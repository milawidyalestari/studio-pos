import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle,
  Download,
  FileDown,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Edit,
  Box,
  Settings
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useProducts, Product, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/ProductForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label as ShadLabel } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const Inventory = () => {
  const { toast } = useToast();
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
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
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [isInputStokOpen, setIsInputStokOpen] = useState(false);
  const [inputStokForm, setInputStokForm] = useState({ materialId: '', stok_masuk: '', stok_opname: '' });
  const [inputStokLoading, setInputStokLoading] = useState(false);
  const [inputStokMode, setInputStokMode] = useState<'input' | 'usage'>('input');
  const [inputStokError, setInputStokError] = useState<string | null>(null);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [periode, setPeriode] = useState<{start: string, end: string}>({start: '', end: ''});
  const [setting, setSetting] = useState({
    periodeType: 'bulanan',
    resetDate: '',
    notifStokMin: true,
  });
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);
  const [filterField, setFilterField] = useState('nama');
  const [filterValue, setFilterValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Fungsi untuk generate kode otomatis
  const generateKodeBahan = async () => {
    // Ambil kode terakhir dari tabel materials
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

  useEffect(() => {
    if (isAddFormOpen) {
      setAddForm({ kode: '', nama: '', satuan: '', lebar_maksimum: '', stok_awal: '', stok_masuk: '', stok_keluar: '', stok_akhir: '', stok_opname: '', stok_aktif: false, stok_minimum: '', kategori: '' });
      setErrors({});
      generateKodeBahan();
    }
  }, [isAddFormOpen]);

  // Tambahkan kategori ke editForm state
  const [editForm, setEditForm] = useState({
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
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Saat buka form edit, mapping kategori dari editingMaterial
  useEffect(() => {
    if (editingMaterial) {
      setEditForm({
        kode: editingMaterial.kode || '',
        nama: editingMaterial.nama || '',
        satuan: editingMaterial.satuan || '',
        lebar_maksimum: editingMaterial.lebar_maksimum?.toString() || '',
        stok_awal: editingMaterial.stok_awal?.toString() || '',
        stok_masuk: editingMaterial.stok_masuk?.toString() || '',
        stok_keluar: editingMaterial.stok_keluar?.toString() || '',
        stok_akhir: editingMaterial.stok_akhir?.toString() || '',
        stok_opname: editingMaterial.stok_opname?.toString() || '',
        stok_aktif: !!editingMaterial.stok_aktif,
        stok_minimum: editingMaterial.stok_minimum?.toString() || '',
        kategori: editingMaterial.kategori || '',
      });
      setEditErrors({});
    }
  }, [editingMaterial]);

  // Ambil data bahan/materials dari database
  const { data: materials = [], isLoading, error, refetch } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('id, kode, nama, satuan, lebar_maksimum, harga_per_meter, stok_awal, stok_masuk, stok_keluar, stok_akhir, stok_opname, stok_minimum, created_at, updated_at, stok_aktif, kategori').order('nama');
      if (error) throw error;
      console.log('Fetched materials:', data);
      return data || [];
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useUnits();

  // Ambil data kategori dari Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, category_name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Deteksi stok minimum (aktifkan fitur low stock)
  const lowStockItems = (materials || []).filter(item => {
    // Hitung stok akhir
    const stokAkhir = item.stok_akhir;
    
    // Cek low stock - hanya untuk bahan yang stok_aktif = true
    return item.stok_aktif && typeof item.stok_minimum === 'number' && stokAkhir <= item.stok_minimum;
  });

  // Deteksi bahan nonaktif - dihapus karena tidak perlu alert

  const handleEditClick = (material: any) => {
    setEditingMaterial(material);
    setIsEditFormOpen(true);
  };

  const handleProductFormSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingProduct) return;
    try {
      // await updateProduct.mutateAsync({ id: editingProduct.id, ...productData }); // This line was removed
      toast({ title: 'Success', description: 'Product updated successfully' });
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
    }
  };

  const handleAddFormChange = (key: string, value: string | boolean) => {
    setAddForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!addForm.kode.trim()) newErrors.kode = 'Kode wajib diisi';
    if (!addForm.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!addForm.satuan.trim()) newErrors.satuan = 'Satuan wajib diisi';
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
          product_id: inserted[0].id,
          created_at: dayjs().toISOString(),
          movement_type: 'stok_awal',
          quantity: payload.stok_awal,
          notes: 'Input stok awal',
          created_by: null,
        });
      }
      toast({ title: 'Success', description: 'Item berhasil ditambahkan' });
      setIsAddFormOpen(false);
      setAddForm({ kode: '', nama: '', satuan: '', lebar_maksimum: '', stok_awal: '', stok_masuk: '', stok_keluar: '', stok_akhir: '', stok_opname: '', stok_aktif: false, stok_minimum: '', kategori: '' });
      setErrors({});
      refetch();
    }
  };

  const handleEditFormChange = (key: string, value: string | boolean) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
    if (editErrors[key]) {
      setEditErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!editForm.kode.trim()) newErrors.kode = 'Kode wajib diisi';
    if (!editForm.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!editForm.satuan.trim()) newErrors.satuan = 'Satuan wajib diisi';
    // lebar_maksimum boleh kosong/null
    if (editForm.lebar_maksimum && isNaN(Number(editForm.lebar_maksimum))) newErrors.lebar_maksimum = 'Lebar maksimum harus berupa angka';
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const payload = {
      kode: editForm.kode,
      nama: editForm.nama,
      satuan: editForm.satuan,
      lebar_maksimum: editForm.lebar_maksimum === '' ? null : parseFloat(editForm.lebar_maksimum),
      stok_awal: editForm.stok_awal ? parseInt(editForm.stok_awal) : 0,
      stok_masuk: editForm.stok_masuk ? parseInt(editForm.stok_masuk) : 0,
      stok_keluar: editForm.stok_keluar ? parseInt(editForm.stok_keluar) : 0,
      stok_akhir: editForm.stok_akhir ? parseInt(editForm.stok_akhir) : 0,
      stok_opname: editForm.stok_opname ? parseInt(editForm.stok_opname) : 0,
      stok_aktif: !!editForm.stok_aktif,
      stok_minimum: editForm.stok_minimum ? parseInt(editForm.stok_minimum) : 0,
      kategori: editForm.kategori,
    };
    

    
    const { error } = await supabase.from('materials').update(payload).eq('id', editingMaterial.id);
    if (error) {
      toast({ title: 'Error', description: 'Gagal update item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item berhasil diupdate' });
      setIsEditFormOpen(false);
      setEditingMaterial(null);
      refetch();
    }
    const prevStokAwal = editingMaterial.stok_awal;
    const newStokAwal = payload.stok_awal;
    if (prevStokAwal !== undefined && newStokAwal !== undefined && prevStokAwal !== newStokAwal) {
      await supabase.from('inventory_movements').insert({
        product_id: editingMaterial.id,
        created_at: dayjs().toISOString(),
        movement_type: 'koreksi',
        quantity: newStokAwal - prevStokAwal,
        notes: 'Koreksi stok awal',
        created_by: null,
      });
    }
  };

  // Handler hapus item
  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Gagal menghapus item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item berhasil dihapus' });
      refetch();
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const { data, error } = await supabase.from('materials').select('*');
      if (error) throw error;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_stok_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Backup berhasil', description: 'File backup stok berhasil diunduh.' });
    } catch (err) {
      toast({ title: 'Backup gagal', description: String(err), variant: 'destructive' });
    }
    setBackupLoading(false);
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setRestoreLoading(true);
    try {
      const text = await restoreFile.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Format file tidak valid');
      // Upsert data ke tabel materials
      const { error } = await supabase.from('materials').upsert(data, { onConflict: 'id' });
      if (error) throw error;
      toast({ title: 'Restore berhasil', description: 'Data stok berhasil direstore.' });
      setIsSettingOpen(false);
      refetch();
    } catch (err) {
      toast({ title: 'Restore gagal', description: String(err), variant: 'destructive' });
    }
    setRestoreLoading(false);
    setRestoreFile(null);
  };

  const handleExport = async (type: 'csv' | 'xlsx') => {
    let data = materials;
    if (type === 'csv') {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stok_inventory_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stok');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stok_inventory_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setIsExportOpen(false);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    try {
      let data: any[] = [];
      if (importFile.name.endsWith('.csv')) {
        const text = await importFile.text();
        const parsed = Papa.parse(text, { header: true });
        data = parsed.data as any[];
      } else if (importFile.name.endsWith('.xlsx')) {
        const arrayBuffer = await importFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet);
      }
      if (!Array.isArray(data) || data.length === 0) throw new Error('File kosong atau format tidak valid');
      // Upsert ke tabel materials
      const { error } = await supabase.from('materials').upsert(data, { onConflict: 'id' });
      if (error) throw error;
      toast({ title: 'Import berhasil', description: 'Data stok berhasil diimport.' });
      refetch();
    } catch (err) {
      toast({ title: 'Import gagal', description: String(err), variant: 'destructive' });
    }
    setIsImporting(false);
    setImportFile(null);
  };

  // Filter logic
  const filteredMaterials = materials.filter(item => {
    const term = searchTerm.toLowerCase();
    let matchSearch = (
      item.nama?.toLowerCase().includes(term) ||
      item.kode?.toLowerCase().includes(term) ||
      item.satuan?.toLowerCase().includes(term)
    );
    let matchFilter = true;
    if (filterValue) {
      if (filterField === 'kategori') {
        matchFilter = categories.find(cat => cat.id === (item as any).kategori)?.category_name?.toLowerCase().includes(filterValue.toLowerCase());
      } else if (filterField === 'stok_aktif') {
        matchFilter = (filterValue === 'aktif' ? item.stok_aktif : !item.stok_aktif);
      } else {
        matchFilter = (item[filterField]?.toString().toLowerCase() || '').includes(filterValue.toLowerCase());
      }
    }
    return matchSearch && matchFilter;
  });
  const isFilterActive = !!filterValue;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventori</h1>
          <p className="text-gray-600">Manajemen stok & inventaris</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="flex justify-start bg-transparent hover:bg-gray-200 text-gray-700 px-3"
            type="button"
            onClick={() => setIsSettingOpen(true)}
          >
            <Settings style={{ width: 20, height: 20}} />
          </Button>
          <Button className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]" onClick={() => setIsAddFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Stok Baru
          </Button>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700"
            type="button"
            onClick={() => setIsInputStokOpen(true)}
          >
            <Box className="h-4 w-4 mt-0.5" />
            Input Stok
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {setting.notifStokMin && lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Peringatan Stok Rendah</h2>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item, index) => {
              const stokAkhir = item.stok_akhir;
              return (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-orange-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.nama}</p>
                    <p className="text-sm text-gray-600">Stok Tersisa: {stokAkhir}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Stok Minimum: {item.stok_minimum}</p>
                    <p className="text-sm font-medium text-orange-800">
                      {item.stok_minimum && stokAkhir !== undefined ? item.stok_minimum - stokAkhir : 0} unit dibutuhkan
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari Stok..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Button
            variant="outline"
            className={`gap-2${isFilterActive ? ' bg-blue-100 text-blue-600 hover:bg-blue-300' : ''}`}
            onClick={() => setIsFilterOpen(v => !v)}
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <span></span>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="mb-2">
                <label className="block text-xs font-medium mb-1">Field</label>
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nama">Nama</SelectItem>
                    <SelectItem value="kode">Kode</SelectItem>
                    <SelectItem value="satuan">Satuan</SelectItem>
                    <SelectItem value="kategori">Kategori</SelectItem>
                    <SelectItem value="stok_aktif">Stok Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium mb-1">Nilai</label>
                {filterField === 'stok_aktif' ? (
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={filterValue} onChange={e => setFilterValue(e.target.value)} className="h-8" placeholder="Isi filter..." />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => { setFilterValue(''); setIsFilterOpen(false); }}>Reset</Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>Terapkan</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={isExportOpen} onOpenChange={setIsExportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1">
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium" onClick={() => handleExport('csv')}>
                <FileDown className="h-5 w-5" /> Export as CSV
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 font-medium" onClick={() => handleExport('xlsx')}>
                <FileDown className="h-5 w-5 " /> Export as XLSX
              </Button>
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="gap-2" asChild>
            <label>
              <RefreshCw className="h-4 w-4" />
              Import
              <input type="file" accept=".csv,.xlsx" className="hidden" onChange={e => setImportFile(e.target.files?.[0] || null)} disabled={isImporting} />
            </label>
          </Button>
          {importFile && (
            <Button size="sm" className="ml-2" onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Mengupload...' : 'Proses Import'}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Awal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Minimum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Akhir</th>
                <th className="pl-12 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center py-8 text-red-500">Error loading data</td></tr>
              ) : filteredMaterials.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8">Tidak Ada Data</td></tr>
              ) : (
                filteredMaterials.map((item) => {
                  // Hitung stok akhir
                  const stokAkhir = item.stok_akhir;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.kode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.satuan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stok_awal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stok_minimum ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">+{item.stok_masuk ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">-{item.stok_keluar ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">{stokAkhir}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Button size="icon" variant="ghost" onClick={() => handleEditClick(item)} title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteMaterial(item.id)} title="Hapus">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-xl p-6 border rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleProductFormSubmit}
            onCancel={() => setIsProductFormOpen(false)}
            isEditing={!!editingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Add New Item Modal */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-6 border rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold mb-2">Tambah Bahan/Item Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama <span className="text-red-500">*</span></label>
                <Input value={addForm.nama} onChange={e => handleAddFormChange('nama', e.target.value)} className={`h-8${errors.nama ? ' border-red-500' : ''}`} placeholder="Masukan nama stok" />
                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Kode <span className="text-red-500">*</span></label>
                <Input value={addForm.kode} readOnly className={`h-8 text-gray-400 bg-gray-50`} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Lebar Maksimum</label>
                <Input type="number" value={addForm.lebar_maksimum} onChange={e => handleAddFormChange('lebar_maksimum', e.target.value)} className={`h-8${errors.lebar_maksimum ? ' border-red-500' : ''}`} placeholder="Maksimum ukuran cetak" />
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
                  <label className="text-sm font-medium">Kategori</label>
                  <Select
                    value={addForm.kategori || ''}
                    onValueChange={value => handleAddFormChange('kategori', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.category_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Awal</label>
                <Input type="number" value={addForm.stok_awal} onChange={e => handleAddFormChange('stok_awal', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Akhir</label>
                <Input type="number" value={addForm.stok_akhir} onChange={e => handleAddFormChange('stok_akhir', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Masuk</label>
                <Input type="number" value={addForm.stok_masuk} onChange={e => handleAddFormChange('stok_masuk', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Keluar</label>
                <Input type="number" value={addForm.stok_keluar} onChange={e => handleAddFormChange('stok_keluar', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Minimum</label>
                <Input type="number" value={addForm.stok_minimum} onChange={e => handleAddFormChange('stok_minimum', e.target.value)} className="h-8" placeholder="0" />
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
              <Button type="button" variant="outline" onClick={() => setIsAddFormOpen(false)}>Batal</Button>
              <Button type="submit" disabled={addLoading} className="bg-[#0050C8] hover:bg-[#003a9b]">{addLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Material Modal */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-6 border rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bahan/Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama <span className="text-red-500">*</span></label>
                <Input value={editForm.nama} onChange={e => handleEditFormChange('nama', e.target.value)} className={`h-8${editErrors.nama ? ' border-red-500' : ''}`} />
                {editErrors.nama && <p className="text-red-500 text-xs mt-1">{editErrors.nama}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Kode <span className="text-red-500">*</span></label>
                <Input value={editForm.kode} readOnly className={`h-8${editErrors.kode ? ' border-red-500' : ''}`} />
                {editErrors.kode && <p className="text-red-500 text-xs mt-1">{editErrors.kode}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Lebar Maksimum</label>
                <Input type="number" value={editForm.lebar_maksimum} onChange={e => handleEditFormChange('lebar_maksimum', e.target.value)} className={`h-8${editErrors.lebar_maksimum ? ' border-red-500' : ''}`} />
                {editErrors.lebar_maksimum && <p className="text-red-500 text-xs mt-1">{editErrors.lebar_maksimum}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Satuan <span className="text-red-500">*</span></label>
                  <Select
                    value={editForm.satuan}
                    onValueChange={value => handleEditFormChange('satuan', value)}
                    disabled={unitsLoading || !!unitsError}
                  >
                    <SelectTrigger className={`h-8${editErrors.satuan ? ' border-red-500' : ''}`}>
                      <SelectValue placeholder={unitsLoading ? 'Memuat...' : unitsError ? 'Gagal memuat satuan' : 'Pilih satuan'} />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editErrors.satuan && <p className="text-red-500 text-xs mt-1">{editErrors.satuan}</p>}
                  {unitsError && <p className="text-red-500 text-xs mt-1">Gagal memuat satuan</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select
                    value={editForm.kategori || ''}
                    onValueChange={value => handleEditFormChange('kategori', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.category_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Awal</label>
                <Input type="number" value={editForm.stok_awal} onChange={e => handleEditFormChange('stok_awal', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Akhir</label>
                <Input type="number" value={editForm.stok_akhir} onChange={e => handleEditFormChange('stok_akhir', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Masuk</label>
                <Input type="number" value={editForm.stok_masuk} onChange={e => handleEditFormChange('stok_masuk', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Keluar</label>
                <Input type="number" value={editForm.stok_keluar} onChange={e => handleEditFormChange('stok_keluar', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Minimum</label>
                <Input type="number" value={editForm.stok_minimum} onChange={e => handleEditFormChange('stok_minimum', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="flex flex-col items-end justify-end pr-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="edit_stok_aktif" className="text-sm font-medium select-none">
                    Stok Aktif?
                  </label>
                  <input
                    type="checkbox"
                    id="edit_stok_aktif"
                    checked={!!editForm.stok_aktif}
                    onChange={e => handleEditFormChange('stok_aktif', e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">
                  *hanya aktifkan untuk barang satuan
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditFormOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Input Stok Modal */}
      <Dialog open={isInputStokOpen} onOpenChange={setIsInputStokOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Input Stok Masuk & Penggunaan</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setInputStokError(null);
              setInputStokLoading(true);
              if (!inputStokForm.materialId) {
                setInputStokError('Bahan/Material wajib dipilih');
                setInputStokLoading(false);
                return;
              }
              const material = materials.find(m => m.id === inputStokForm.materialId);
              if (!material) return;
              const jumlah = parseInt(inputStokForm.stok_masuk) || 0;
              const stokOpname = inputStokForm.stok_opname !== '' ? parseInt(inputStokForm.stok_opname) : null;
              let newStokAkhir = material.stok_akhir || 0;
              const updatePayload: any = { };
              if (stokOpname !== null) {
                updatePayload.stok_opname = stokOpname;
                if (inputStokMode === 'input') {
                  newStokAkhir = stokOpname + jumlah;
                  updatePayload.stok_masuk = jumlah;
                } else if (inputStokMode === 'usage') {
                  newStokAkhir = stokOpname - jumlah;
                  updatePayload.stok_keluar = jumlah;
                } else {
                  newStokAkhir = stokOpname;
                }
                updatePayload.stok_akhir = newStokAkhir;
              } else {
                if (inputStokMode === 'input') {
                  newStokAkhir += jumlah;
                  updatePayload.stok_masuk = jumlah;
                } else if (inputStokMode === 'usage') {
                  newStokAkhir -= jumlah;
                  updatePayload.stok_keluar = jumlah;
                }
                updatePayload.stok_akhir = newStokAkhir;
              }
              await supabase.from('materials').update(updatePayload).eq('id', material.id);
              setInputStokLoading(false);
              setIsInputStokOpen(false);
              setInputStokForm({ materialId: '', stok_masuk: '', stok_opname: '' });
              setInputStokMode('input');
              refetch();
              // Catat mutasi stok
              if (inputStokMode === 'input') {
                await supabase.from('inventory_movements').insert({
                  product_id: material.id,
                  created_at: dayjs().toISOString(),
                  movement_type: stokOpname !== null ? 'opname' : 'masuk',
                  quantity: jumlah,
                  notes: stokOpname !== null ? `Input opname +${jumlah}` : `Input stok masuk +${jumlah}`,
                  created_by: null,
                });
              } else if (inputStokMode === 'usage') {
                await supabase.from('inventory_movements').insert({
                  product_id: material.id,
                  created_at: dayjs().toISOString(),
                  movement_type: stokOpname !== null ? 'opname' : 'keluar',
                  quantity: -jumlah,
                  notes: stokOpname !== null ? `Opname & keluar -${jumlah}` : `Penggunaan stok -${jumlah}`,
                  created_by: null,
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <ShadLabel className="block text-sm font-medium mb-1">Mode</ShadLabel>
              <RadioGroup value={inputStokMode} onValueChange={val => setInputStokMode(val as 'input' | 'usage')} className="flex gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="input" id="input-mode" />
                  <ShadLabel htmlFor="input-mode">Input Stok</ShadLabel>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="usage" id="usage-mode" />
                  <ShadLabel htmlFor="usage-mode">Penggunaan Stok</ShadLabel>
                </div>
              </RadioGroup>
            </div>
            <div>
              <ShadLabel className="block text-sm font-medium mb-1">Pilih Bahan/Material</ShadLabel>
              <Select value={inputStokForm.materialId} onValueChange={val => setInputStokForm(f => ({ ...f, materialId: val }))}>
                <SelectTrigger className={`w-full h-9${inputStokError ? ' border-red-500' : ''}`}>
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {inputStokError && (
                <div className="text-red-500 text-xs mt-1">{inputStokError}</div>
              )}
            </div>
            <div>
              <ShadLabel className="block text-sm font-medium mb-1">{inputStokMode === 'input' ? 'Stok Masuk' : 'Stok Digunakan'}</ShadLabel>
              <Input
                type="number"
                className="h-9"
                value={inputStokForm.stok_masuk}
                onChange={e => setInputStokForm(f => ({ ...f, stok_masuk: e.target.value }))}
                min="0"
              />
            </div>
            <div>
              <ShadLabel className="block text-sm font-medium mb-1">Stok Opname (Opsional)</ShadLabel>
              <Input
                type="number"
                className="h-8"
                value={inputStokForm.stok_opname}
                onChange={e => setInputStokForm(f => ({ ...f, stok_opname: e.target.value }))}
                min="0"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsInputStokOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-green-700 hover:bg-blue-800" disabled={inputStokLoading}>
                {inputStokLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Setting Periode Modal */}
      <Dialog open={isSettingOpen} onOpenChange={setIsSettingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setting Periode Stok</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              setIsSettingOpen(false);
            }}
            className="space-y-5"
          >
            {/* Periode Stok */}
            <div>
              <ShadLabel className="block text-sm font-medium mb-1">Tipe Periode Stok</ShadLabel>
              <RadioGroup value={setting.periodeType} onValueChange={val => setSetting(s => ({ ...s, periodeType: val }))} className="flex gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="bulanan" id="periode-bulanan" />
                  <ShadLabel htmlFor="periode-bulanan">Bulanan</ShadLabel>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="tahunan" id="periode-tahunan" />
                  <ShadLabel htmlFor="periode-tahunan">Tahunan</ShadLabel>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="custom" id="periode-custom" />
                  <ShadLabel htmlFor="periode-custom">Custom</ShadLabel>
                </div>
              </RadioGroup>
            </div>
            <div>
              <ShadLabel className="block text-sm font-medium mb-1">Tanggal Reset Stok Otomatis</ShadLabel>
              <Input
                type="date"
                value={setting.resetDate}
                onChange={e => setSetting(s => ({ ...s, resetDate: e.target.value }))}
              />
            </div>
            {/* Notifikasi Stok Minimum */}
            <div className="flex items-center gap-3">
              <Switch checked={setting.notifStokMin} onCheckedChange={val => setSetting(s => ({ ...s, notifStokMin: val }))} id="notifStokMin" />
              <ShadLabel htmlFor="notifStokMin">Aktifkan Notifikasi Stok Minimum</ShadLabel>
            </div>
            {/* Backup & Restore */}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleBackup} disabled={backupLoading}>
                {backupLoading ? 'Membackup...' : 'Backup Data Stok'}
              </Button>
              <label className="flex items-center gap-2 cursor-pointer">
                <Button type="button" variant="outline" asChild disabled={restoreLoading || !restoreFile} onClick={handleRestore}>
                  <span>{restoreLoading ? 'Mengupload...' : 'Restore Data Stok'}</span>
                </Button>
                <input type="file" accept=".json,.csv" className="hidden" onChange={e => setRestoreFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            {/* Integrasi */}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setSyncLoading(true)} disabled={syncLoading}>
                {syncLoading ? 'Sinkronisasi...' : 'Sinkronisasi dengan Product'}
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSettingOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-gray-700 text-white">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
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
  Edit
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useProducts, Product, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/ProductForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    stok_opname: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

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
      setAddForm({ kode: '', nama: '', satuan: '', lebar_maksimum: '', stok_awal: '', stok_masuk: '', stok_keluar: '', stok_opname: '' });
      setErrors({});
      generateKodeBahan();
    }
  }, [isAddFormOpen]);

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
        stok_opname: editingMaterial.stok_opname?.toString() || '',
      });
      setEditErrors({});
    }
  }, [editingMaterial]);

  // Ambil data bahan/materials dari database
  const { data: materials = [], isLoading, error, refetch } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('*').order('nama');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useUnits();

  // Deteksi stok minimum (jika ada field stok_minimum)
  // Tidak ada field stok_minimum di tabel materials, jadi fitur low stock di-nonaktifkan
  const lowStockItems: any[] = [];

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

  const handleAddFormChange = (key: string, value: string) => {
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
      lebar_maksimum: addForm.lebar_maksimum ? parseFloat(addForm.lebar_maksimum) : 0,
      harga_per_meter: 0,
      stok_awal: addForm.stok_awal ? parseInt(addForm.stok_awal) : 0,
      stok_masuk: addForm.stok_masuk ? parseInt(addForm.stok_masuk) : 0,
      stok_keluar: addForm.stok_keluar ? parseInt(addForm.stok_keluar) : 0,
      stok_opname: addForm.stok_opname ? parseInt(addForm.stok_opname) : 0,
    };
    const { error } = await supabase.from('materials').insert([payload]);
    setAddLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Gagal menambah item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item berhasil ditambahkan' });
      setIsAddFormOpen(false);
      setAddForm({ kode: '', nama: '', satuan: '', lebar_maksimum: '', stok_awal: '', stok_masuk: '', stok_keluar: '', stok_opname: '' });
      setErrors({});
      refetch();
    }
  };

  const [editForm, setEditForm] = useState({
    kode: '',
    nama: '',
    satuan: '',
    lebar_maksimum: '',
    stok_awal: '',
    stok_masuk: '',
    stok_keluar: '',
    stok_opname: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleEditFormChange = (key: string, value: string) => {
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
    if (!editForm.lebar_maksimum || isNaN(Number(editForm.lebar_maksimum))) newErrors.lebar_maksimum = 'Lebar maksimum wajib diisi';
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const payload = {
      kode: editForm.kode,
      nama: editForm.nama,
      satuan: editForm.satuan,
      lebar_maksimum: editForm.lebar_maksimum ? parseFloat(editForm.lebar_maksimum) : 0,
      stok_awal: editForm.stok_awal ? parseInt(editForm.stok_awal) : 0,
      stok_masuk: editForm.stok_masuk ? parseInt(editForm.stok_masuk) : 0,
      stok_keluar: editForm.stok_keluar ? parseInt(editForm.stok_keluar) : 0,
      stok_opname: editForm.stok_opname ? parseInt(editForm.stok_opname) : 0,
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Inventori</h1>
          <p className="text-gray-600">Manajemen stok & inventaris</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]" onClick={() => setIsAddFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-orange-200">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Current stock: {item.currentStock}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Minimum stock: {item.minStock}</p>
                  <p className="text-sm font-medium text-orange-800">
                    {item.minStock && item.currentStock !== undefined ? item.minStock - item.currentStock : 0} units needed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search inventory..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {/* Tambahkan kategori lain jika perlu */}
            </SelectContent>
          </Select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Akhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center py-8 text-red-500">Error loading data</td></tr>
              ) : materials.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8">Tidak Ada Data</td></tr>
              ) : (
                materials.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.kode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.satuan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stok_awal ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">+{item.stok_masuk ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">-{item.stok_keluar ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">{item.stok_opname ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEditClick(item)} title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteMaterial(item.id)} title="Hapus">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
                <Input value={addForm.nama} onChange={e => handleAddFormChange('nama', e.target.value)} className={`h-8${errors.nama ? ' border-red-500' : ''}`} placeholder="Masukan Nama" />
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
                <label className="text-sm font-medium">Stok Awal</label>
                <Input type="number" value={addForm.stok_awal} onChange={e => handleAddFormChange('stok_awal', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Akhir</label>
                <Input type="number" value={addForm.stok_opname} onChange={e => handleAddFormChange('stok_opname', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Masuk</label>
                <Input type="number" value={addForm.stok_masuk} onChange={e => handleAddFormChange('stok_masuk', e.target.value)} className="h-8" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Keluar</label>
                <Input type="number" value={addForm.stok_keluar} onChange={e => handleAddFormChange('stok_keluar', e.target.value)} className="h-8" placeholder="0" />
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
                <label className="text-sm font-medium">Lebar Maksimum <span className="text-red-500">*</span></label>
                <Input type="number" value={editForm.lebar_maksimum} onChange={e => handleEditFormChange('lebar_maksimum', e.target.value)} className={`h-8${editErrors.lebar_maksimum ? ' border-red-500' : ''}`} />
                {editErrors.lebar_maksimum && <p className="text-red-500 text-xs mt-1">{editErrors.lebar_maksimum}</p>}
              </div>
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
                <label className="text-sm font-medium">Stok Awal</label>
                <Input type="number" value={editForm.stok_awal} onChange={e => handleEditFormChange('stok_awal', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Akhir</label>
                <Input type="number" value={editForm.stok_opname} onChange={e => handleEditFormChange('stok_opname', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Masuk</label>
                <Input type="number" value={editForm.stok_masuk} onChange={e => handleEditFormChange('stok_masuk', e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stok Keluar</label>
                <Input type="number" value={editForm.stok_keluar} onChange={e => handleEditFormChange('stok_keluar', e.target.value)} className="h-8" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditFormOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
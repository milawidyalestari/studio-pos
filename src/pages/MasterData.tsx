import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Eye,
  Settings,
  Users,
  Package,
  Truck,
  CreditCard,
  Layers,
  Tag,
  Scale
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Sample data for each module
const sampleProducts = [
  { kode: 'PRD001', jenis: 'Vinyl', nama: 'Vinyl Glossy', satuan: 'Roll', hargaBeli: 45000, hargaJual: 60000, stokAwal: 50, stokMasuk: 10, stokKeluar: 5, stokOpname: 55 },
  { kode: 'PRD002', jenis: 'Banner', nama: 'Banner Frontlite', satuan: 'Roll', hargaBeli: 35000, hargaJual: 50000, stokAwal: 30, stokMasuk: 5, stokKeluar: 8, stokOpname: 27 },
  { kode: 'PRD003', jenis: 'Sticker', nama: 'Sticker Chromo', satuan: 'Pack', hargaBeli: 15000, hargaJual: 25000, stokAwal: 100, stokMasuk: 20, stokKeluar: 15, stokOpname: 105 },
];

const sampleSuppliers = [
  { kode: 'SUP001', nama: 'PT Vinyl Indonesia', kontak: '021-12345678', email: 'info@vinylindonesia.com', whatsapp: '081234567890' },
  { kode: 'SUP002', nama: 'CV Banner Jaya', kontak: '021-87654321', email: 'sales@bannerjaya.com', whatsapp: '081987654321' },
  { kode: 'SUP003', nama: 'Toko Sticker Murah', kontak: '021-11223344', email: 'order@stickermurah.com', whatsapp: '081122334455' },
];

const sampleCustomers = [
  { kode: 'CUS001', nama: 'John Doe', whatsapp: '081234567890', level: 'Premium' },
  { kode: 'CUS002', nama: 'Jane Smith', whatsapp: '081987654321', level: 'Regular' },
  { kode: 'CUS003', nama: 'Bob Wilson', whatsapp: '081122334455', level: 'VIP' },
];

const sampleEmployees = [
  { kode: 'EMP001', nama: 'Ahmad Rizki', posisi: 'Manager', status: 'Active' },
  { kode: 'EMP002', nama: 'Siti Nurhaliza', posisi: 'Designer', status: 'Active' },
  { kode: 'EMP003', nama: 'Budi Santoso', posisi: 'Operator', status: 'Inactive' },
];

const sampleGroups = [
  { kode: 'GRP001', nama: 'Printing Materials' },
  { kode: 'GRP002', nama: 'Finishing Tools' },
  { kode: 'GRP003', nama: 'Design Services' },
];

const sampleCategories = [
  { kode: 'CAT001', kelompok: 'Printing Materials', kategori: 'Vinyl' },
  { kode: 'CAT002', kelompok: 'Printing Materials', kategori: 'Banner' },
  { kode: 'CAT003', kelompok: 'Finishing Tools', kategori: 'Laminating' },
];

const sampleUnits = [
  { kode: 'UNIT001', satuan: 'Roll' },
  { kode: 'UNIT002', satuan: 'Pack' },
  { kode: 'UNIT003', satuan: 'Meter' },
];

const samplePaymentTypes = [
  { tipe: 'Digital', jenisPembayaran: 'QRIS' },
  { tipe: 'Digital', jenisPembayaran: 'E-wallet' },
  { tipe: 'Card', jenisPembayaran: 'Debit Card' },
];

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view'

  const formatCurrency = (amount: number) => {
    return `IDR ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' ? 
      <Badge className="bg-green-100 text-green-800">Active</Badge> :
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      'VIP': 'bg-purple-100 text-purple-800',
      'Premium': 'bg-blue-100 text-blue-800',
      'Regular': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[level] || colors.Regular}>{level}</Badge>;
  };

  const handleAction = (action: string, item?: any) => {
    setModalType(action);
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const ActionButtons = ({ item, showView = true }: { item: any, showView?: boolean }) => (
    <div className="flex items-center space-x-1">
      {showView && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleAction('view', item)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleAction('edit', item)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleAction('delete', item)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const TableHeader = ({ title, icon: Icon, onAdd }: { title: string, icon: any, onAdd: () => void }) => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#0050C8]" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button onClick={onAdd} className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>
    </div>
  );

  const SearchAndFilter = () => (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button variant="outline" className="gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Modal for overlay modules
  const OverlayModal = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
          <p className="text-gray-600">Manage all foundational data for your business</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products & Services
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
        </TabsList>

        {/* Products & Services Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <TableHeader 
                title="Data Produk & Jasa" 
                icon={Package}
                onAdd={() => handleAction('add')}
              />
              <SearchAndFilter />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Opname</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleProducts.map((product) => (
                      <tr key={product.kode} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{product.kode}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{product.jenis}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{product.nama}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{product.satuan}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(product.hargaBeli)}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#0050C8]">{formatCurrency(product.hargaJual)}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{product.stokOpname}</td>
                        <td className="px-4 py-4">
                          <ActionButtons item={product} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Overlay Modules for Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('groups')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Layers className="h-8 w-8 text-[#0050C8]" />
                  <div>
                    <h3 className="font-semibold">Data Kelompok</h3>
                    <p className="text-sm text-gray-600">{sampleGroups.length} groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('categories')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-8 w-8 text-[#0050C8]" />
                  <div>
                    <h3 className="font-semibold">Data Kategori</h3>
                    <p className="text-sm text-gray-600">{sampleCategories.length} categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('units')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-8 w-8 text-[#0050C8]" />
                  <div>
                    <h3 className="font-semibold">Data Satuan</h3>
                    <p className="text-sm text-gray-600">{sampleUnits.length} units</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('payments')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-[#0050C8]" />
                  <div>
                    <h3 className="font-semibold">Jenis Non Tunai</h3>
                    <p className="text-sm text-gray-600">{samplePaymentTypes.length} types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <TableHeader 
                title="Data Supplier" 
                icon={Truck}
                onAdd={() => handleAction('add')}
              />
              <SearchAndFilter />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleSuppliers.map((supplier) => (
                      <tr key={supplier.kode} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{supplier.kode}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{supplier.nama}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{supplier.kontak}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{supplier.email}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{supplier.whatsapp}</td>
                        <td className="px-4 py-4">
                          <ActionButtons item={supplier} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <TableHeader 
                title="Data Pelanggan" 
                icon={Users}
                onAdd={() => handleAction('add')}
              />
              <SearchAndFilter />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level Pelanggan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleCustomers.map((customer) => (
                      <tr key={customer.kode} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.kode}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.nama}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.whatsapp}</td>
                        <td className="px-4 py-4">{getLevelBadge(customer.level)}</td>
                        <td className="px-4 py-4">
                          <ActionButtons item={customer} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <TableHeader 
                title="Data Karyawan" 
                icon={Users}
                onAdd={() => handleAction('add')}
              />
              <SearchAndFilter />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleEmployees.map((employee) => (
                      <tr key={employee.kode} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{employee.kode}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{employee.nama}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{employee.posisi}</td>
                        <td className="px-4 py-4">{getStatusBadge(employee.status)}</td>
                        <td className="px-4 py-4">
                          <ActionButtons item={employee} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal for overlay modules */}
      {isModalOpen && (
        <OverlayModal title={`Manage ${modalType}`}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Kode</Label>
              <Input id="code" placeholder="Enter code" />
            </div>
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" placeholder="Enter name" />
            </div>
            {modalType === 'categories' && (
              <div>
                <Label htmlFor="group">Kelompok</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleGroups.map((group) => (
                      <SelectItem key={group.kode} value={group.kode}>
                        {group.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {modalType === 'payments' && (
              <div>
                <Label htmlFor="type">Tipe</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-[#0050C8] hover:bg-[#003a9b]">
                Save
              </Button>
            </div>
          </div>
        </OverlayModal>
      )}
    </div>
  );
};

export default MasterData;
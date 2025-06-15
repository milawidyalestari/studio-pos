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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MasterDataOverlay, TableColumn, MasterDataItem } from '@/components/MasterDataOverlay';
import { useProductCategories, useCreateProductCategory, useUpdateProductCategory, useDeleteProductCategory } from '@/hooks/useProductCategories';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { ProductForm } from '@/components/ProductForm';
import { useToast } from '@/hooks/use-toast';

// Sample data for other modules (keeping existing data)
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

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Product hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  // Product Categories hooks
  const { data: productCategories = [], isLoading: categoriesLoading } = useProductCategories();
  const createCategoryMutation = useCreateProductCategory();
  const updateCategoryMutation = useUpdateProductCategory();
  const deleteCategoryMutation = useDeleteProductCategory();
  
  // Move useState calls inside the component
  const [sampleGroups, setSampleGroups] = useState([
    { id: '1', kode: 'GRP001', nama: 'Printing Materials' },
    { id: '2', kode: 'GRP002', nama: 'Finishing Tools' },
    { id: '3', kode: 'GRP003', nama: 'Design Services' },
  ]);

  const [sampleCategories, setSampleCategories] = useState([
    { id: '1', kode: 'CAT001', kelompok: 'Printing Materials', kategori: 'Vinyl' },
    { id: '2', kode: 'CAT002', kelompok: 'Printing Materials', kategori: 'Banner' },
    { id: '3', kode: 'CAT003', kelompok: 'Finishing Tools', kategori: 'Laminating' },
  ]);

  const [sampleUnits, setSampleUnits] = useState([
    { id: '1', kode: 'UNIT001', satuan: 'Roll' },
    { id: '2', kode: 'UNIT002', satuan: 'Pack' },
    { id: '3', kode: 'UNIT003', satuan: 'Meter' },
  ]);

  const [samplePaymentTypes, setSamplePaymentTypes] = useState([
    { id: '1', kode: 'PAY001', tipe: 'Digital', jenisPembayaran: 'QRIS' },
    { id: '2', kode: 'PAY002', tipe: 'Digital', jenisPembayaran: 'E-wallet' },
    { id: '3', kode: 'PAY003', tipe: 'Card', jenisPembayaran: 'Debit Card' },
  ]);
  
  const [overlayConfig, setOverlayConfig] = useState<{
    isOpen: boolean;
    type: string;
    title: string;
    columns: TableColumn[];
    data: MasterDataItem[];
    formFields: Array<{
      key: string;
      label: string;
      type: 'text' | 'select';
      options?: Array<{ value: string; label: string }>;
      required?: boolean;
    }>;
  }>({
    isOpen: false,
    type: '',
    title: '',
    columns: [],
    data: [],
    formFields: []
  });

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

  const handleAddProduct = () => {
    console.log('Opening product form for new product');
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    console.log('Opening product form for editing:', product);
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    console.log('Requesting product deletion:', id);
    setDeleteProductId(id);
  };

  const handleProductFormSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Submitting product form:', productData);
      
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          ...productData
        });
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProductMutation.mutateAsync(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (deleteProductId) {
      try {
        console.log('Confirming product deletion:', deleteProductId);
        await deleteProductMutation.mutateAsync(deleteProductId);
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        setDeleteProductId(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.jenis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOverlayOpen = (type: string) => {
    let config;
    
    switch (type) {
      case 'product-categories':
        console.log('Opening Product Categories with data:', productCategories);
        config = {
          isOpen: true,
          type: 'product-categories',
          title: 'Product Categories Management',
          columns: [
            { key: 'name', label: 'Category Name' },
            { key: 'description', label: 'Description' }
          ],
          data: productCategories.map(cat => ({
            id: cat.id,
            kode: cat.id, // Use id as kode for compatibility
            name: cat.name,
            description: cat.description || ''
          })),
          formFields: [
            { key: 'name', label: 'Category Name', type: 'text' as const, required: true },
            { key: 'description', label: 'Description', type: 'text' as const }
          ]
        };
        break;
      case 'groups':
        config = {
          isOpen: true,
          type: 'groups',
          title: 'Group Data Management',
          columns: [
            { key: 'kode', label: 'Code' },
            { key: 'nama', label: 'Name' }
          ],
          data: sampleGroups,
          formFields: [
            { key: 'kode', label: 'Code', type: 'text' as const, required: true },
            { key: 'nama', label: 'Name', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'categories':
        config = {
          isOpen: true,
          type: 'categories',
          title: 'Category Data Management',
          columns: [
            { key: 'kode', label: 'Code' },
            { key: 'kelompok', label: 'Group' },
            { key: 'kategori', label: 'Category' }
          ],
          data: sampleCategories,
          formFields: [
            { key: 'kode', label: 'Code', type: 'text' as const, required: true },
            { key: 'kelompok', label: 'Group', type: 'select' as const, required: true, options: sampleGroups.map(g => ({ value: g.nama, label: g.nama })) },
            { key: 'kategori', label: 'Category', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'units':
        config = {
          isOpen: true,
          type: 'units',
          title: 'Unit Data Management',
          columns: [
            { key: 'kode', label: 'Code' },
            { key: 'satuan', label: 'Unit' }
          ],
          data: sampleUnits,
          formFields: [
            { key: 'kode', label: 'Code', type: 'text' as const, required: true },
            { key: 'satuan', label: 'Unit', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'payments':
        config = {
          isOpen: true,
          type: 'payments',
          title: 'Non-Cash Payment Types',
          columns: [
            { key: 'kode', label: 'Code' },
            { key: 'tipe', label: 'Type' },
            { key: 'jenisPembayaran', label: 'Payment Method' }
          ],
          data: samplePaymentTypes,
          formFields: [
            { key: 'kode', label: 'Code', type: 'text' as const, required: true },
            { key: 'tipe', label: 'Type', type: 'select' as const, required: true, options: [
              { value: 'Digital', label: 'Digital' },
              { value: 'Card', label: 'Card' }
            ]},
            { key: 'jenisPembayaran', label: 'Payment Method', type: 'text' as const, required: true }
          ]
        };
        break;
      default:
        return;
    }
    
    setOverlayConfig(config);
  };

  const handleOverlayClose = () => {
    setOverlayConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleAdd = async (item: MasterDataItem) => {
    try {
      console.log('handleAdd called with type:', overlayConfig.type, 'item:', item);
      
      if (overlayConfig.type === 'product-categories') {
        console.log('Creating product category:', item);
        await createCategoryMutation.mutateAsync({
          name: item.name as string,
          description: item.description as string
        });
        toast({
          title: "Success",
          description: "Product category created successfully",
        });
      } else {
        // Handle other types with sample data
        const newItem = { ...item, id: Date.now().toString() };
        
        switch (overlayConfig.type) {
          case 'groups':
            setSampleGroups(prev => [...prev, newItem as { id: string; kode: string; nama: string; }]);
            break;
          case 'categories':
            setSampleCategories(prev => [...prev, newItem as { id: string; kode: string; kelompok: string; kategori: string; }]);
            break;
          case 'units':
            setSampleUnits(prev => [...prev, newItem as { id: string; kode: string; satuan: string; }]);
            break;
          case 'payments':
            setSamplePaymentTypes(prev => [...prev, newItem as { id: string; kode: string; tipe: string; jenisPembayaran: string; }]);
            break;
        }
        
        toast({
          title: "Success",
          description: "Item created successfully",
        });
      }
    } catch (error) {
      console.error('Error in handleAdd:', error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (item: MasterDataItem) => {
    try {
      console.log('handleEdit called with type:', overlayConfig.type, 'item:', item);
      
      if (overlayConfig.type === 'product-categories') {
        console.log('Updating product category:', item);
        await updateCategoryMutation.mutateAsync({
          id: item.id!,
          name: item.name as string,
          description: item.description as string
        });
        toast({
          title: "Success",
          description: "Product category updated successfully",
        });
      } else {
        // Handle other types with sample data
        switch (overlayConfig.type) {
          case 'groups':
            setSampleGroups(prev => prev.map(g => g.id === item.id ? item as { id: string; kode: string; nama: string; } : g));
            break;
          case 'categories':
            setSampleCategories(prev => prev.map(c => c.id === item.id ? item as { id: string; kode: string; kelompok: string; kategori: string; } : c));
            break;
          case 'units':
            setSampleUnits(prev => prev.map(u => u.id === item.id ? item as { id: string; kode: string; satuan: string; } : u));
            break;
          case 'payments':
            setSamplePaymentTypes(prev => prev.map(p => p.id === item.id ? item as { id: string; kode: string; tipe: string; jenisPembayaran: string; } : p));
            break;
        }
        
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      }
    } catch (error) {
      console.error('Error in handleEdit:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('handleDelete called with type:', overlayConfig.type, 'id:', id);
      
      if (overlayConfig.type === 'product-categories') {
        console.log('Deleting product category:', id);
        await deleteCategoryMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Product category deleted successfully",
        });
      } else {
        // Handle other types with sample data
        switch (overlayConfig.type) {
          case 'groups':
            setSampleGroups(prev => prev.filter(g => g.id !== id));
            break;
          case 'categories':
            setSampleCategories(prev => prev.filter(c => c.id !== id));
            break;
          case 'units':
            setSampleUnits(prev => prev.filter(u => u.id !== id));
            break;
          case 'payments':
            setSamplePaymentTypes(prev => prev.filter(p => p.id !== id));
            break;
        }
        
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleAction = (action: string, item?: any) => {
    // Handle other actions like view, edit, delete for main tables
    console.log('Action:', action, 'Item:', item);
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

  const ProductActionButtons = ({ product }: { product: Product }) => (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleEditProduct(product)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleDeleteProduct(product.id)}
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
                onAdd={handleAddProduct}
              />
              <SearchAndFilter />
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-12">Loading products...</div>
              ) : (
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
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{product.kode}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{product.jenis}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{product.nama}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{product.satuan}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(product.harga_beli || 0)}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-[#0050C8]">{formatCurrency(product.harga_jual || 0)}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{product.stok_opname}</td>
                          <td className="px-4 py-4">
                            <ProductActionButtons product={product} />
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                            {searchTerm ? 'No products found matching your search.' : 'No products available. Click "Add New" to create your first product.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overlay Modules for Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOverlayOpen('product-categories')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-[#0050C8]" />
                  <div>
                    <h3 className="font-semibold">Product Categories</h3>
                    <p className="text-sm text-gray-600">
                      {categoriesLoading ? 'Loading...' : `${productCategories.length} categories`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOverlayOpen('groups')}>
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

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOverlayOpen('categories')}>
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

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOverlayOpen('units')}>
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

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOverlayOpen('payments')}>
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

      {/* Product Form Dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleProductFormSubmit}
            onCancel={() => setIsProductFormOpen(false)}
            isEditing={!!editingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Master Data Overlay */}
      <MasterDataOverlay
        isOpen={overlayConfig.isOpen}
        onClose={handleOverlayClose}
        title={overlayConfig.title}
        columns={overlayConfig.columns}
        data={overlayConfig.data}
        formFields={overlayConfig.formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MasterData;

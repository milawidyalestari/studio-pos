import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts, Product, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/ProductForm';

const Inventory = () => {
  const { toast } = useToast();
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Ambil data produk dari database
  const { data: products = [], isLoading, error } = useProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Filter produk yang jenisnya 'Bahan'
  const inventory = products.filter((product: Product) => product.jenis === 'Bahan');

  // Deteksi stok minimum (jika ada field stok_minimum)
  const lowStockItems = inventory
    .filter(item => item.stok_opname !== undefined && item.stok_minimum !== undefined && item.stok_opname < item.stok_minimum)
    .map(item => ({
      name: item.nama,
      currentStock: item.stok_opname,
      minStock: item.stok_minimum
    }));

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleProductFormSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
      toast({ title: 'Success', description: 'Product updated successfully' });
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
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
          <Button className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center py-8 text-red-500">Error loading data</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8">No data</td></tr>
              ) : (
                inventory.map((item) => (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                      <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleProductFormSubmit}
            onCancel={() => setIsProductFormOpen(false)}
            isEditing={!!editingProduct}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
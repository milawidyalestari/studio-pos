
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Package, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ProductOverlayCards } from './ProductOverlayCards';
import { formatCurrency } from '@/utils/masterDataHelpers';
import { Product } from '@/hooks/useProducts';

interface ProductsTabProps {
  products: Product[];
  productsLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  sampleGroups: any[];
  sampleCategories: any[];
  sampleUnits: any[];
  samplePaymentTypes: any[];
  categoriesLoading: boolean;
  onOverlayOpen: (type: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  productsLoading,
  searchTerm,
  onSearchChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  sampleGroups,
  sampleCategories,
  sampleUnits,
  samplePaymentTypes,
  categoriesLoading,
  onOverlayOpen
}) => {
  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.jenis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProductActionButtons = ({ product }: { product: Product }) => (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onEditProduct(product)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onDeleteProduct(product.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <TableHeader 
            title="Data Produk & Jasa" 
            icon={Package}
            onAdd={onAddProduct}
          />
          <SearchAndFilter 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
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

      <ProductOverlayCards
        sampleGroups={sampleGroups}
        sampleCategories={sampleCategories}
        sampleUnits={sampleUnits}
        samplePaymentTypes={samplePaymentTypes}
        categoriesLoading={categoriesLoading}
        onOverlayOpen={onOverlayOpen}
      />
    </div>
  );
};

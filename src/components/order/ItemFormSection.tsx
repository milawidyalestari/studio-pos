
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { calculateProductPrice } from '@/services/productPricing';

interface OrderItem {
  id: string;
  productCode: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
}

interface ItemFormSectionProps {
  currentItem: OrderItem;
  updateCurrentItem: (field: string, value: any) => void;
  resetCurrentItem: () => void;
  editingItemId: string | null;
  onSave: () => void;
  onAddItem: () => void;
  isSaving: boolean;
  nextItemId: string;
}

const ItemFormSection = ({
  currentItem,
  updateCurrentItem,
  resetCurrentItem,
  editingItemId,
  onSave,
  onAddItem,
  isSaving,
  nextItemId
}: ItemFormSectionProps) => {
  const { data: products, isLoading: productsLoading } = useProducts();

  // Filter products by type for different select options
  const materials = products?.filter(p => p.jenis === 'Material') || [];
  const services = products?.filter(p => p.jenis === 'Service') || [];

  const handleProductSelect = (productCode: string) => {
    const selectedProduct = products?.find(p => p.kode === productCode);
    if (selectedProduct) {
      updateCurrentItem('productCode', productCode);
      updateCurrentItem('item', selectedProduct.nama);
      console.log('Selected product:', selectedProduct);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Items</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="idItem" className="text-sm font-medium">ID Item</Label>
          <Input
            id="idItem"
            value={editingItemId ? currentItem.id : nextItemId}
            onChange={(e) => updateCurrentItem('id', e.target.value)}
            placeholder="ID Item"
            className="mt-1 bg-gray-50"
            readOnly={!editingItemId}
          />
        </div>
        <div>
          <Label htmlFor="product" className="text-sm font-medium">Produk/Material</Label>
          <Select 
            value={currentItem.productCode} 
            onValueChange={handleProductSelect}
            disabled={productsLoading}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={productsLoading ? "Loading..." : "Pilih Produk"} />
            </SelectTrigger>
            <SelectContent>
              {materials.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">Materials</div>
                  {materials.map((product) => (
                    <SelectItem key={product.id} value={product.kode}>
                      {product.nama} - {product.satuan} (IDR {product.harga_jual?.toLocaleString('id-ID')})
                    </SelectItem>
                  ))}
                </>
              )}
              {services.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">Services</div>
                  {services.map((product) => (
                    <SelectItem key={product.id} value={product.kode}>
                      {product.nama} - {product.satuan} (IDR {product.harga_jual?.toLocaleString('id-ID')})
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="item" className="text-sm font-medium">Deskripsi Item</Label>
        <Input
          id="item"
          value={currentItem.item}
          onChange={(e) => updateCurrentItem('item', e.target.value)}
          placeholder="Deskripsi item"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="panjang" className="text-sm font-medium">Ukuran (P mm)</Label>
          <Input
            id="panjang"
            type="number"
            value={currentItem.ukuran.panjang}
            onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, panjang: e.target.value })}
            placeholder="Panjang"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lebar" className="text-sm font-medium">Ukuran (L mm)</Label>
          <Input
            id="lebar"
            type="number"
            value={currentItem.ukuran.lebar}
            onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, lebar: e.target.value })}
            placeholder="Lebar"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium">Kuantitas</Label>
          <Input
            id="quantity"
            type="number"
            value={currentItem.quantity}
            onChange={(e) => updateCurrentItem('quantity', e.target.value)}
            placeholder="Kuantitas"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="finishing" className="text-sm font-medium">Finishing</Label>
          <Select value={currentItem.finishing} onValueChange={(value) => updateCurrentItem('finishing', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pilih Finishing" />
            </SelectTrigger>
            <SelectContent>
              {services.filter(s => s.nama.toLowerCase().includes('finishing') || 
                                  s.nama.toLowerCase().includes('laminating') ||
                                  s.nama.toLowerCase().includes('cutting') ||
                                  s.nama.toLowerCase().includes('mounting')).map((service) => (
                <SelectItem key={service.id} value={service.kode}>
                  {service.nama} (IDR {service.harga_jual?.toLocaleString('id-ID')})
                </SelectItem>
              ))}
              <SelectItem value="none">Tanpa Finishing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={resetCurrentItem}>Reset</Button>
        {editingItemId ? (
          <Button 
            type="button" 
            onClick={onSave} 
            className="bg-[#0050C8] hover:bg-[#003a9b]"
            disabled={isSaving}
          >
            Update Item
          </Button>
        ) : (
          <Button type="button" onClick={onAddItem} className="bg-[#0050C8] hover:bg-[#003a9b]">Add Item</Button>
        )}
      </div>
    </div>
  );
};

export default ItemFormSection;

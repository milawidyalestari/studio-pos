import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProducts, Product } from '@/hooks/useProducts';
import { calculateProductPrice } from '@/services/productPricing';
import { formatCurrency } from '@/services/masterData';
import ProductSelectionModal from './ProductSelectionModal';

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
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const [showMaterialSelectionModal, setShowMaterialSelectionModal] = useState(false);

  // Filter products by type for different select options
  const materials = products?.filter(p => p.jenis === 'Material') || [];
  const services = products?.filter(p => p.jenis === 'Service') || [];
  const allProducts = products || [];

  const selectedProduct = products?.find(p => p.kode === currentItem.productCode);

  const handleProductSelect = (productCode: string) => {
    const selectedProduct = products?.find(p => p.kode === productCode);
    if (selectedProduct) {
      updateCurrentItem('productCode', productCode);
      updateCurrentItem('item', selectedProduct.nama);
      console.log('Selected product:', selectedProduct);
    }
  };

  const handleItemSelection = (product: Product) => {
    updateCurrentItem('productCode', product.kode);
    updateCurrentItem('item', product.nama);
    console.log('Selected item from modal:', product);
  };

  const handleMaterialSelection = (product: Product) => {
    updateCurrentItem('productCode', product.kode);
    updateCurrentItem('item', product.nama);
    console.log('Selected material from modal:', product);
  };

  // Calculate unit price and total price
  const calculatePrices = () => {
    if (!selectedProduct || !currentItem.quantity) return { unitPrice: 0, totalPrice: 0 };

    const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
    const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
    const quantity = parseInt(currentItem.quantity) || 0;

    let unitPrice = selectedProduct.harga_jual || 0;
    let totalPrice = calculateProductPrice(selectedProduct, quantity, panjang, lebar);

    // Add finishing cost if selected
    if (currentItem.finishing && currentItem.finishing !== 'none') {
      const finishingService = products?.find(p => p.kode === currentItem.finishing);
      if (finishingService) {
        totalPrice += (finishingService.harga_jual || 0) * quantity;
      }
    }

    return { unitPrice, totalPrice };
  };

  const { unitPrice, totalPrice } = calculatePrices();
  const dimensionTotal = (parseFloat(currentItem.ukuran.panjang) || 0) * (parseFloat(currentItem.ukuran.lebar) || 0);

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Items</h3>
      
      {/* Row 1: Kode Item & Nama Item */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="kodeItem" className="text-sm font-medium">Kode Item</Label>
          <Input
            id="kodeItem"
            value={editingItemId ? currentItem.id : nextItemId}
            onChange={(e) => updateCurrentItem('id', e.target.value)}
            placeholder="Kode Item"
            className="mt-1 bg-gray-50"
            readOnly={!editingItemId}
          />
        </div>
        <div>
          <Label htmlFor="namaItem" className="text-sm font-medium">Nama Item</Label>
          <div className="flex mt-1">
            <Input
              id="namaItem"
              value={selectedProduct?.nama || ''}
              className="bg-blue-50 border-blue-200"
              readOnly
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-1 px-2"
              onClick={() => setShowItemSelectionModal(true)}
            >
              ?
            </Button>
            <Button type="button" variant="outline" size="sm" className="ml-1 px-2">
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Nama Pesanan */}
      <div className="mb-4">
        <Label htmlFor="namaPesanan" className="text-sm font-medium">Nama Pesanan</Label>
        <Input
          id="namaPesanan"
          value={currentItem.item}
          onChange={(e) => updateCurrentItem('item', e.target.value)}
          placeholder="Masukkan nama pesanan"
          className="mt-1"
        />
      </div>

      {/* Row 3: Jumlah Pesanan & Dimensi */}
      <div className="flex gap-4 mb-4">
        <div className="w-1/4">
          <Label htmlFor="jumlahPesanan" className="text-sm font-medium">Jml Pesanan</Label>
          <Input
            id="jumlahPesanan"
            type="number"
            value={currentItem.quantity}
            onChange={(e) => updateCurrentItem('quantity', e.target.value)}
            placeholder="1"
            className="mt-1"
          />
        </div>
        <div className="flex-1 flex items-end gap-1">
          <div className="flex-1">
            <Label htmlFor="dimensiP" className="text-sm font-medium">Dimensi</Label>
            <Input
              id="dimensiP"
              type="number"
              value={currentItem.ukuran.panjang}
              onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, panjang: e.target.value })}
              placeholder="P"
              className="mt-1"
            />
          </div>
          <span className="text-sm pb-2">x</span>
          <div className="flex-1">
            <Label htmlFor="dimensiL" className="text-sm font-medium invisible">L</Label>
            <Input
              id="dimensiL"
              type="number"
              value={currentItem.ukuran.lebar}
              onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, lebar: e.target.value })}
              placeholder="L"
              className="mt-1"
            />
          </div>
          <span className="text-sm pb-2">=</span>
          <div className="flex-1">
            <Label className="text-sm font-medium invisible">Total</Label>
            <Input
              value={dimensionTotal.toFixed(0)}
              className="mt-1 bg-gray-50"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Row 4: Harga */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="hargaSatuan" className="text-sm font-medium">Harga @</Label>
          <Input
            id="hargaSatuan"
            value={formatCurrency(unitPrice)}
            className="mt-1 bg-yellow-50"
            readOnly
          />
        </div>
        <div className="flex items-end">
          <span className="text-sm mb-2">=</span>
        </div>
        <div>
          <Label htmlFor="totalHarga" className="text-sm font-medium invisible">Total</Label>
          <Input
            id="totalHarga"
            value={formatCurrency(totalPrice)}
            className="mt-1 bg-green-100 font-semibold"
            readOnly
          />
        </div>
      </div>

      {/* Row 5: Kode Bahan & Nama Bahan */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="kodeBahan" className="text-sm font-medium">Kode Bahan</Label>
          <div className="flex mt-1">
            <Input
              id="kodeBahan"
              value={currentItem.productCode}
              className="bg-blue-50 border-blue-200"
              readOnly
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-1 px-2"
              onClick={() => setShowMaterialSelectionModal(true)}
            >
              ?
            </Button>
            <Button type="button" variant="outline" size="sm" className="ml-1 px-2">
              +
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="namaBahan" className="text-sm font-medium">Nama Bahan</Label>
          <Input
            id="namaBahan"
            value={selectedProduct?.nama || ''}
            className="mt-1 bg-blue-50 border-blue-200"
            readOnly
          />
        </div>
      </div>

      {/* Row 6: Product Selection */}
      <div className="mb-4">
        <Label htmlFor="product" className="text-sm font-medium">Pilih Produk/Material</Label>
        <Select 
          value={currentItem.productCode} 
          onValueChange={handleProductSelect}
          disabled={productsLoading}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={productsLoading ? "Loading..." : "Pilih Produk"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {materials.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">Materials</div>
                {materials.map((product) => (
                  <SelectItem key={product.id} value={product.kode} className="bg-white hover:bg-gray-50">
                    {product.kode} - {product.nama} - {product.satuan} ({formatCurrency(product.harga_jual || 0)})
                  </SelectItem>
                ))}
              </>
            )}
            {services.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">Services</div>
                {services.map((product) => (
                  <SelectItem key={product.id} value={product.kode} className="bg-white hover:bg-gray-50">
                    {product.kode} - {product.nama} - {product.satuan} ({formatCurrency(product.harga_jual || 0)})
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Row 7: Finishing */}
      <div className="mb-4">
        <Label htmlFor="finishing" className="text-sm font-medium">Finishing</Label>
        <Select value={currentItem.finishing} onValueChange={(value) => updateCurrentItem('finishing', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Pilih Finishing" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {services.filter(s => s.nama.toLowerCase().includes('finishing') || 
                                s.nama.toLowerCase().includes('laminating') ||
                                s.nama.toLowerCase().includes('cutting') ||
                                s.nama.toLowerCase().includes('mounting')).map((service) => (
              <SelectItem key={service.id} value={service.kode} className="bg-white hover:bg-gray-50">
                {service.nama} ({formatCurrency(service.harga_jual || 0)})
              </SelectItem>
            ))}
            <SelectItem value="none" className="bg-white hover:bg-gray-50">Tanpa Finishing</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Product Selection Modals */}
      <ProductSelectionModal
        open={showItemSelectionModal}
        onClose={() => setShowItemSelectionModal(false)}
        onSelectProduct={handleItemSelection}
        title="Pilih Item"
        filterType="all"
      />

      <ProductSelectionModal
        open={showMaterialSelectionModal}
        onClose={() => setShowMaterialSelectionModal(false)}
        onSelectProduct={handleMaterialSelection}
        title="Pilih Bahan/Material"
        filterType="Material"
      />
    </div>
  );
};

export default ItemFormSection;

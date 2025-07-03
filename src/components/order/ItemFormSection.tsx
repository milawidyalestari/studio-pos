import React, { useState, useEffect } from 'react';
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
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  notes?: string;
}

interface ItemFormSectionProps {
  currentItem: OrderItem;
  updateCurrentItem: (field: string, value: string | number | { panjang: string; lebar: string }) => void;
  resetCurrentItem: () => void;
  editingItemId: string | null;
  onSave: () => void;
  onAddItem: () => void;
  onUpdateItem: () => void;
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
  onUpdateItem,
  isSaving,
  nextItemId
}: ItemFormSectionProps) => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const [showMaterialSelectionModal, setShowMaterialSelectionModal] = useState(false);

  // State untuk snapshot data awal item
  const [initialItemData, setInitialItemData] = useState<typeof currentItem | null>(null);
  const [hasItemUnsavedChanges, setHasItemUnsavedChanges] = useState(false);

  // Set snapshot saat mulai edit item
  useEffect(() => {
    if (editingItemId) {
      setInitialItemData(currentItem);
    } else {
      setInitialItemData(null);
    }
  }, [editingItemId]);

  // Deteksi perubahan nyata pada item
  useEffect(() => {
    if (!editingItemId || !initialItemData) {
      setHasItemUnsavedChanges(false);
      return;
    }
    setHasItemUnsavedChanges(JSON.stringify(currentItem) !== JSON.stringify(initialItemData));
  }, [currentItem, editingItemId, initialItemData]);

  // Filter products by type for different select options
  const materials = products?.filter(p => p.jenis === 'Material') || [];
  const services = products?.filter(p => p.jenis === 'Service') || [];
  const allProducts = products || [];

  const selectedProduct = products?.find(p => p.kode === currentItem.bahan);

  const handleProductSelect = (productCode: string) => {
    const selectedProduct = products?.find(p => p.kode === productCode);
    if (selectedProduct) {
      updateCurrentItem('bahan', productCode);
      updateCurrentItem('item', selectedProduct.nama);
      console.log('Selected product:', selectedProduct);
    }
  };

  const handleItemSelection = (product: Product) => {
    updateCurrentItem('bahan', product.kode);
    updateCurrentItem('item', product.nama);
    console.log('Selected item from modal:', product);
  };

  const handleMaterialSelection = (product: Product) => {
    updateCurrentItem('bahan', product.kode);
    updateCurrentItem('item', product.nama);
    console.log('Selected material from modal:', product);
  };

  // Calculate unit price and total price
  const calculatePrices = () => {
    if (!selectedProduct || !currentItem.quantity) return { unitPrice: 0, totalPrice: 0 };

    const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
    const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
    const quantity = parseInt(currentItem.quantity) || 0;

    const unitPrice = selectedProduct.harga_jual || 0;
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
    <div className="border rounded-lg p-3 mb-4">
      {/* Row 1: Kode Item & Nama Item */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <Label htmlFor="kodeItem" className="text-sm font-medium">Nama Item</Label>
          <Input
              id="namaItem"
              value={selectedProduct?.nama || ''}
              className="bg-blue-50 border-blue-200 h-8"
              readOnly
            />
        </div>
        
        <div>
          <Label htmlFor="namaItem" className="text-sm font-medium">Kode Item</Label>
        <div className="flex mt-0">
          <Input
            id="kodeItem"
            value={selectedProduct?.kode || (editingItemId ? currentItem.id : nextItemId)}
            onChange={(e) => updateCurrentItem('id', e.target.value)}
            placeholder="Kode Item"
            className=" bg-gray-50 h-8"
            readOnly
          />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-1 px-2 h-8"
              onClick={() => setShowItemSelectionModal(true)}
            >
              ?
            </Button>
            <Button type="button" variant="outline" size="sm" className="ml-1 px-2 h-8">
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Row 5: Kode Bahan & Nama Bahan */}
      <div className="grid grid-cols-2 gap-4 mb-2">
      <div>
          <Label htmlFor="namaBahan" className="text-sm font-medium">Nama Bahan</Label>
          <Input
            id="namaBahan"
            value={selectedProduct?.nama || ''}
            className="mt-1 bg-blue-50 border-blue-200 h-8"
            readOnly
          />
        </div>
        <div>
          <Label htmlFor="kodeBahan" className="text-sm font-medium">Kode Bahan</Label>
          <div className="flex mt-1">
            <Input
              id="kodeBahan"
              value={currentItem.bahan}
              className="bg-gray-50 h-8"
              readOnly
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-1 px-2 h-8"
              onClick={() => setShowMaterialSelectionModal(true)}
            >
              ?
            </Button>
            <Button type="button" variant="outline" size="sm" className="ml-1 px-2 h-8">
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Row 3: Jumlah Pesanan & Dimensi */}
      <div className="flex gap-4 mb-3">
        <div className="w-1/4">
          <Label htmlFor="jumlahPesanan" className="text-sm font-medium">Jml Pesanan</Label>
          <Input
            id="jumlahPesanan"
            type="number"
            value={currentItem.quantity}
            onChange={(e) => updateCurrentItem('quantity', e.target.value)}
            placeholder="1"
            className="mt-1 h-8"
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
              className="mt-1 h-8"
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
              className="mt-1 h-8"
            />
          </div>
          <span className="text-sm pb-2">=</span>
          <div>
          <Label htmlFor="hargaSatuan" className="text-sm font-medium">Harga @</Label>
          <Input
            id="hargaSatuan"
            value={formatCurrency(unitPrice)}
            className="mt-1 bg-gray-50 h-8"
            readOnly
          />
        </div>
        </div>
      </div>

      {/* Row 4: Harga */}
      <div className="grid grid-cols-3">
        <div className="flex items-end bg-white mr-4"></div>
        <div className="flex items-end bg-white mr-4">
        <Label className="text-sm font-medium text-right block w-full mb-3">Total Harga</Label>
        </div>
        <div>
            <Input
              id="totalHarga"
              value={formatCurrency(totalPrice)}
              className="mt-0 bg-green-100 font-semibold h-8"
              readOnly
            />
          </div>
      </div>

      {/* Row 7: Finishing */}
      <div className="mb-2">
        <Label htmlFor="finishing" className="text-sm font-medium">Finishing</Label>
        <Select value={currentItem.finishing} onValueChange={(value) => updateCurrentItem('finishing', value)}>
          <SelectTrigger className="mt-1 h-8">
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

      {/* Notes: pindahkan ke sini */}
      <div className="mb-1">
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <textarea
          id="notes"
          value={currentItem.notes || ''}
          onChange={e => updateCurrentItem('notes', e.target.value)}
          placeholder="Order notes..."
          className="mt-1 h-16 resize-none w-full border rounded-md p-2"
        />
      </div>

      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={resetCurrentItem}>Reset</Button>
        {editingItemId ? (
          <Button 
            type="button" 
            onClick={onUpdateItem} 
            className={
              isSaving || !hasItemUnsavedChanges
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0050C8] hover:bg-[#003a9b] text-white"
            }
            disabled={isSaving || !hasItemUnsavedChanges}
          >
            Update Item
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={onAddItem} 
            className="bg-[#0050C8] hover:bg-[#003a9b]"
            disabled={!currentItem.item}
          >
            Add Item
          </Button>
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

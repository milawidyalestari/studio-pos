import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProducts, Product, useCreateProduct } from '@/hooks/useProducts';
import { calculateProductPrice } from '@/services/productPricing';
import { formatCurrency } from '@/services/masterData';
import ProductSelectionModal from './ProductSelectionModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductForm } from '@/components/ProductForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface OrderItem {
  id: string;
  item: string; // kode item
  bahan: string; // kode bahan
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  notes?: string;
  // Tambahkan field jika ingin simpan nama item/bahan secara eksplisit
  // itemName?: string;
  // bahanName?: string;
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
  onOpenAddStockModal?: () => void;
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
  nextItemId,
  onOpenAddStockModal
}: ItemFormSectionProps) => {
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const [showMaterialSelectionModal, setShowMaterialSelectionModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  // State untuk snapshot data awal item
  const [initialItemData, setInitialItemData] = useState<typeof currentItem | null>(null);
  const [hasItemUnsavedChanges, setHasItemUnsavedChanges] = useState(false);

  // Tambahkan state untuk input manual finishing
  const [customFinishing, setCustomFinishing] = useState('');
  const [isCustomFinishingSelected, setIsCustomFinishingSelected] = useState(false);

  // Query data bahan/materials dari tabel materials
  const { data: materials = [], isLoading: materialsLoading, error: materialsError, refetch: refetchMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('id, kode, nama, satuan, stok_akhir, stok_opname, lebar_maksimum');
      if (error) throw error;
      return data || [];
    },
  });

  const createProduct = useCreateProduct();

  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto';
      notesRef.current.style.height = notesRef.current.scrollHeight + 'px';
    }
  }, [currentItem.notes]);

  // Set snapshot saat mulai edit item
  useEffect(() => {
    if (editingItemId) {
      setInitialItemData(currentItem);
    } else {
      setInitialItemData(null);
    }
  }, [editingItemId]);

  // Reset customFinishing when not editing (when editingItemId becomes null)
  useEffect(() => {
    if (!editingItemId) {
      setCustomFinishing('');
      setIsCustomFinishingSelected(false);
    }
  }, [editingItemId]);

  // Initialize customFinishing when editing an item with custom finishing
  useEffect(() => {
    if (editingItemId && currentItem.finishing) {
      const isCustomFinishing = !["Lembaran", "FL", "F.Lipet", "Potong Press", "Cutting", "Laminating"].includes(currentItem.finishing);
      if (isCustomFinishing) {
        setCustomFinishing(currentItem.finishing);
        setIsCustomFinishingSelected(true);
      } else {
        setCustomFinishing('');
        setIsCustomFinishingSelected(false);
      }
    }
  }, [editingItemId, currentItem.finishing]);

  // Deteksi perubahan nyata pada item
  useEffect(() => {
    if (!editingItemId || !initialItemData) {
      setHasItemUnsavedChanges(false);
      return;
    }
    setHasItemUnsavedChanges(JSON.stringify(currentItem) !== JSON.stringify(initialItemData));
  }, [currentItem, editingItemId, initialItemData]);

  // Filter products by type for different select options
  const services = products?.filter(p => p.jenis === 'Service') || [];
  const allProducts = products || [];

  // Cari produk item dan bahan secara independen
  const selectedItemProduct = products?.find(p => p.kode === currentItem.item);
  const selectedMaterial = materials.find((m: any) => m.kode === currentItem.bahan);

  const handleProductSelect = (productCode: string) => {
    const selectedProduct = products?.find(p => p.kode === productCode);
    if (selectedProduct) {
      updateCurrentItem('bahan', productCode);
      updateCurrentItem('item', selectedProduct.nama);
      console.log('Selected product:', selectedProduct);
    }
  };

  const handleItemSelection = (product: Product) => {
    updateCurrentItem('item', product.kode);
    // Jika ingin simpan nama item: updateCurrentItem('itemName', product.nama);
    // Tidak mengubah bahan
    // console.log('Selected item from modal:', product);
  };

  const handleMaterialSelection = (material: any) => {
    updateCurrentItem('bahan', material.kode);
  };

  // Calculate unit price and total price
  const calculatePrices = () => {
    // Gunakan produk item untuk harga
    if (!selectedItemProduct || !currentItem.quantity) return { unitPrice: 0, totalPrice: 0 };

    const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
    const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
    const quantity = parseInt(currentItem.quantity) || 0;

    // Ambil data material dari hasil query (materials)
    const material = materials.find((m: any) => m.kode === currentItem.bahan);
    const lebarMaksimum = material?.lebar_maksimum;
    const materialForPricing = lebarMaksimum ? { lebar_maksimum: lebarMaksimum } : undefined;

    const unitPrice = selectedItemProduct.harga_jual || 0;
    let totalPrice = calculateProductPrice(selectedItemProduct, quantity, panjang, lebar, materialForPricing);

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
           {/* Notes: pindahkan ke sini */}
           <div className="mb-1">
        <Label htmlFor="notes" className="text-sm font-medium">Deskripsi <span className='text-red-500'>*</span></Label>
        <textarea
          id="notes"
          ref={notesRef}
          value={currentItem.notes || ''}
          onChange={e => updateCurrentItem('notes', e.target.value)}
          placeholder="Deskripsi Order..."
          className="text-sm font-semibold mt-1 w-full border rounded-md py-2 px-3 resize-none overflow-hidden"
          rows={1}
        />
      </div>
      
      {/* Row 1: Kode Item & Nama Item */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <Label htmlFor="kodeItem" className="text-sm font-medium">Nama Item</Label>
          <Input
              id="namaItem"
              value={selectedItemProduct?.nama || ''}
              className="bg-blue-50 border-blue-200 h-8"
              readOnly
            />
        </div>
        
        <div>
          <Label htmlFor="namaItem" className="text-sm font-medium">Kode Item <span className='text-red-500'>*</span></Label>
        <div className="flex mt-0">
          <Input
            id="kodeItem"
            value={selectedItemProduct?.kode || (editingItemId ? currentItem.id : nextItemId)}
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
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-1 px-2 h-8"
              onClick={() => setShowProductForm(true)}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Row 5: Kode Bahan & Nama Bahan */}
      <div className="grid grid-cols-2 gap-4 mb-2">
      <div>
          <Label htmlFor="namaBahan" className="text-sm font-medium">Nama Bahan </Label>
          <Input
            id="namaBahan"
            value={selectedMaterial?.nama || ''}
            className="mt-1 bg-blue-50 border-blue-200 h-8"
            readOnly
          />
        </div>
        <div>
          <Label htmlFor="kodeBahan" className="text-sm font-medium">Kode Bahan <span className='text-red-500'>*</span></Label>
          <div className="flex mt-1">
            <Input
              id="kodeBahan"
              value={selectedMaterial?.kode || currentItem.bahan}
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
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-1 px-2 h-8"
              onClick={() => onOpenAddStockModal?.()}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Row 3: Jumlah Pesanan & Dimensi */}
      <div className="flex gap-4 mb-3">
        <div className="w-1/4">
          <Label htmlFor="jumlahPesanan" className="text-sm font-medium">Jml Pesanan <span className='text-red-500'>*</span> </Label>
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
        <Label className="text-sm font-medium text-right block w-full mb-2">Total Harga</Label>
        </div>
        <div>
            <Input
              id="totalHarga"
              value={formatCurrency(totalPrice)}
              className="bg-green-100 font-semibold h-8"
              readOnly
            />
          </div>
      </div>

      {/* Row 7: Finishing */}
      <div className="mb-4">
        <Label htmlFor="finishing" className="text-sm font-medium">Finishing</Label>
        <Select
          value={["Lembaran", "FL", "F.Lipet", "Potong Press", "Cutting", "Laminating"].includes(currentItem.finishing) ? currentItem.finishing : (currentItem.finishing && currentItem.finishing !== '' ? 'custom' : '')}
          onValueChange={(value) => {
            if (["Lembaran", "FL", "F.Lipet", "Potong Press", "Cutting", "Laminating"].includes(value)) {
              setCustomFinishing('');
              setIsCustomFinishingSelected(false);
              updateCurrentItem('finishing', value);
            } else if (value === 'custom') {
              setIsCustomFinishingSelected(true);
              setCustomFinishing(currentItem.finishing && !["Lembaran", "FL", "F.Lipet", "Potong Press", "Cutting", "Laminating"].includes(currentItem.finishing) ? currentItem.finishing : '');
              updateCurrentItem('finishing', currentItem.finishing && !["Lembaran", "FL", "F.Lipet", "Potong Press", "Cutting", "Laminating"].includes(currentItem.finishing) ? currentItem.finishing : '');
            } else {
              setCustomFinishing('');
              setIsCustomFinishingSelected(false);
              updateCurrentItem('finishing', '');
            }
          }}
        >
        <SelectTrigger className="mt-1 h-8">
            <SelectValue placeholder="Pilih Finishing" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Lembaran">Lembaran</SelectItem>
            <SelectItem value="FL">FL</SelectItem>
            <SelectItem value="F.Lipet">F.Lipet</SelectItem>
            <SelectItem value="Potong Press">Potong Press</SelectItem>
            <SelectItem value="Cutting">Cutting</SelectItem>
            <SelectItem value="Laminating">Laminating</SelectItem>
            <SelectItem value="custom">Lainnya (isi manual)</SelectItem>
          </SelectContent>
        </Select>
        {(isCustomFinishingSelected || (!["Lembaran", "FL", "F.Lipet", "Potong Press", "Cutting", "Laminating"].includes(currentItem.finishing) && currentItem.finishing !== '')) && (
          <Input
            className="mt-2 h-8 border-blue-600"
            placeholder="Isi finishing manual..."
            value={customFinishing}
            onChange={e => {
              setCustomFinishing(e.target.value);
              updateCurrentItem('finishing', e.target.value);
            }}
          />
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={resetCurrentItem}>Cancel</Button>
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
            Tambah
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
        items={materials}
        filterType={undefined}
      />

      {/* Overlay ProductForm */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-2xl">
          <ProductForm
            initialData={null}
            initialMaterials={[]}
            initialMaterialData={[]}
            isEditing={false}
            materials={materials}
            onSubmit={async (data) => {
              try {
                const { materialData, ...productData } = data;
                
                // Buat produk terlebih dahulu
                const createdProduct = await createProduct.mutateAsync(productData);
                
                // Jika ada materialData, simpan ke tabel product_materials
                if (materialData && materialData.length > 0 && createdProduct) {
                  const inserts = materialData.map((item: any) => ({
                    product_id: createdProduct.id,
                    material_id: item.material_id,
                    quantity_per_unit: item.quantity_per_unit > 0 ? item.quantity_per_unit : 1
                  }));
                  
                  const { error: materialError } = await supabase
                    .from('product_materials')
                    .insert(inserts);
                    
                  if (materialError) {
                    console.error('Error saving material relations:', materialError);
                    throw materialError;
                  }
                }
                
                  setShowProductForm(false);
                  refetchProducts();
                  refetchMaterials();
              } catch (error) {
                console.error('Error creating product:', error);
                  // TODO: tampilkan error toast jika perlu
                }
            }}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ItemFormSection;

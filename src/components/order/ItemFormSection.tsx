
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: string;
  bahan: string;
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
}

const ItemFormSection = ({
  currentItem,
  updateCurrentItem,
  resetCurrentItem,
  editingItemId,
  onSave,
  onAddItem,
  isSaving
}: ItemFormSectionProps) => {
  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Items</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="idItem" className="text-sm font-medium">ID Item</Label>
          <Input
            id="idItem"
            value={currentItem.id}
            onChange={(e) => updateCurrentItem('id', e.target.value)}
            placeholder="ID Item"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="bahan" className="text-sm font-medium">Material</Label>
          <Select value={currentItem.bahan} onValueChange={(value) => updateCurrentItem('bahan', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vinyl">Vinyl</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="sticker">Sticker</SelectItem>
              <SelectItem value="canvas">Canvas</SelectItem>
              <SelectItem value="paper">Paper</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="item" className="text-sm font-medium">Item</Label>
        <Input
          id="item"
          value={currentItem.item}
          onChange={(e) => updateCurrentItem('item', e.target.value)}
          placeholder="Item description"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="panjang" className="text-sm font-medium">Size (L mm)</Label>
          <Input
            id="panjang"
            type="number"
            value={currentItem.ukuran.panjang}
            onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, panjang: e.target.value })}
            placeholder="Length"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lebar" className="text-sm font-medium">Size (W mm)</Label>
          <Input
            id="lebar"
            type="number"
            value={currentItem.ukuran.lebar}
            onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, lebar: e.target.value })}
            placeholder="Width"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={currentItem.quantity}
            onChange={(e) => updateCurrentItem('quantity', e.target.value)}
            placeholder="Quantity"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="finishing" className="text-sm font-medium">Finishing</Label>
          <Select value={currentItem.finishing} onValueChange={(value) => updateCurrentItem('finishing', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Finishing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="laminating">Laminating</SelectItem>
              <SelectItem value="cutting">Cutting</SelectItem>
              <SelectItem value="mounting">Mounting</SelectItem>
              <SelectItem value="grommets">Grommets</SelectItem>
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

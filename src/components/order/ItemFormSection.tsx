
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalItemSearch } from '@/hooks/useGlobalItems';
import { GlobalItem } from '@/services/itemService';

interface OrderItem {
  id: string;
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  globalItemCode?: string; // Reference to the persistent item
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
  const [open, setOpen] = useState(false);
  const [selectedGlobalItem, setSelectedGlobalItem] = useState<GlobalItem | null>(null);
  const { searchTerm, setSearchTerm, searchResults, isSearching } = useGlobalItemSearch();

  // Update search term when item name changes
  useEffect(() => {
    if (currentItem.item && currentItem.item.length > 2) {
      setSearchTerm(currentItem.item);
    }
  }, [currentItem.item, setSearchTerm]);

  const handleGlobalItemSelect = (globalItem: GlobalItem) => {
    setSelectedGlobalItem(globalItem);
    updateCurrentItem('item', globalItem.name);
    updateCurrentItem('globalItemCode', globalItem.item_code);
    
    // Pre-fill with standard values if available
    if (globalItem.bahan) {
      updateCurrentItem('bahan', globalItem.bahan);
    }
    if (globalItem.standard_finishing) {
      updateCurrentItem('finishing', globalItem.standard_finishing);
    }
    if (globalItem.standard_panjang && globalItem.standard_lebar) {
      updateCurrentItem('ukuran', {
        panjang: globalItem.standard_panjang.toString(),
        lebar: globalItem.standard_lebar.toString()
      });
    }
    
    setOpen(false);
    console.log('Selected global item:', globalItem.item_code, globalItem.name);
  };

  const handleItemNameChange = (value: string) => {
    updateCurrentItem('item', value);
    // Clear global item selection if user types something different
    if (selectedGlobalItem && value !== selectedGlobalItem.name) {
      setSelectedGlobalItem(null);
      updateCurrentItem('globalItemCode', '');
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Items</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="idItem" className="text-sm font-medium">Order Item ID</Label>
          <Input
            id="idItem"
            value={editingItemId ? currentItem.id : nextItemId}
            onChange={(e) => updateCurrentItem('id', e.target.value)}
            placeholder="Order Item ID"
            className="mt-1 bg-gray-50"
            readOnly={!editingItemId}
          />
          <p className="text-xs text-gray-500 mt-1">Sequential ID for this order</p>
        </div>
        <div>
          <Label htmlFor="globalItemCode" className="text-sm font-medium">
            Global Item Code 
            {currentItem.globalItemCode && (
              <span className="text-green-600 ml-2">
                <Info className="h-3 w-3 inline mr-1" />
                {currentItem.globalItemCode}
              </span>
            )}
          </Label>
          <Input
            id="globalItemCode"
            value={currentItem.globalItemCode || 'Will be assigned'}
            className="mt-1 bg-gray-50"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Persistent ID across all orders</p>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="item" className="text-sm font-medium">Item Name</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between mt-1"
            >
              {currentItem.item || "Select or type item name..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search items or type new name..."
                value={currentItem.item}
                onValueChange={handleItemNameChange}
              />
              <CommandEmpty>
                {currentItem.item ? "Type to create new item" : "Start typing to search..."}
              </CommandEmpty>
              {searchResults.length > 0 && (
                <CommandGroup heading="Existing Items">
                  {searchResults.map((globalItem) => (
                    <CommandItem
                      key={globalItem.id}
                      onSelect={() => handleGlobalItemSelect(globalItem)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedGlobalItem?.id === globalItem.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{globalItem.name}</span>
                        <span className="text-xs text-gray-500">
                          {globalItem.item_code} • {globalItem.bahan || 'No material'} • {globalItem.standard_finishing || 'No finishing'}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
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

      <div className="mb-4">
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

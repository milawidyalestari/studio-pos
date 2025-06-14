
import { useState, useEffect } from 'react';
import { OrderItem } from '@/types/order';
import { calculateItemPrice } from '@/services/masterData';
import { createOrGetGlobalItem } from '@/services/itemService';
import { useToast } from '@/hooks/use-toast';
import { generateNextItemId } from '@/utils/orderCalculations';

const initialCurrentItem = {
  id: '',
  bahan: '',
  item: '',
  ukuran: { panjang: '', lebar: '' },
  quantity: '',
  finishing: '',
  globalItemCode: ''
};

export const useOrderItems = () => {
  const { toast } = useToast();
  const [currentItem, setCurrentItem] = useState(initialCurrentItem);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    const total = orderList.reduce((sum, item) => sum + item.subTotal, 0);
    setTotalPrice(total);
  }, [orderList]);

  useEffect(() => {
    if (editingItemId) {
      // Trigger unsaved changes when editing
    }
  }, [currentItem, editingItemId]);

  const updateCurrentItem = (field: string, value: any) => {
    setCurrentItem(prev => {
      if (field === 'ukuran') {
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetCurrentItem = () => {
    setCurrentItem(initialCurrentItem);
    setEditingItemId(null);
  };

  const addToOrderList = async () => {
    if (!currentItem.item || !currentItem.ukuran.panjang || !currentItem.ukuran.lebar || !currentItem.quantity) {
      return;
    }

    const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
    const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
    const quantity = parseInt(currentItem.quantity) || 0;
    
    let subTotal = 0;
    if (panjang > 0 && lebar > 0 && quantity > 0) {
      subTotal = calculateItemPrice(panjang, lebar, quantity, currentItem.bahan, currentItem.finishing);
    }

    let globalItemCode = currentItem.globalItemCode;
    if (!globalItemCode) {
      try {
        const globalItem = await createOrGetGlobalItem({
          name: currentItem.item,
          bahan: currentItem.bahan,
          panjang: panjang,
          lebar: lebar,
          finishing: currentItem.finishing
        });
        
        if (globalItem) {
          globalItemCode = globalItem.item_code;
          console.log('Created/found global item:', globalItemCode);
        }
      } catch (error) {
        console.error('Error creating global item:', error);
        toast({
          title: "Warning",
          description: "Item added but global tracking may be affected.",
          variant: "destructive",
        });
      }
    }

    const itemId = generateNextItemId(orderList);

    const newOrderItem: OrderItem = {
      ...currentItem,
      id: itemId,
      subTotal,
      globalItemCode
    };

    setOrderList(prev => [...prev, newOrderItem]);
    resetCurrentItem();
  };

  const deleteFromOrderList = (itemId: string) => {
    setOrderList(prev => {
      const newList = prev.filter(item => item.id !== itemId);
      return newList.map((item, index) => ({
        ...item,
        id: (index + 1).toString().padStart(3, '0')
      }));
    });
  };

  const editOrderItem = (item: OrderItem) => {
    setCurrentItem(item);
    setEditingItemId(item.id);
    deleteFromOrderList(item.id);
  };

  const saveEditingItem = async () => {
    if (editingItemId && currentItem.item && currentItem.ukuran.panjang && currentItem.ukuran.lebar && currentItem.quantity) {
      const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
      const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
      const quantity = parseInt(currentItem.quantity) || 0;
      
      let subTotal = 0;
      if (panjang > 0 && lebar > 0 && quantity > 0) {
        subTotal = calculateItemPrice(panjang, lebar, quantity, currentItem.bahan, currentItem.finishing);
      }

      let globalItemCode = currentItem.globalItemCode;
      if (!globalItemCode) {
        try {
          const globalItem = await createOrGetGlobalItem({
            name: currentItem.item,
            bahan: currentItem.bahan,
            panjang: panjang,
            lebar: lebar,
            finishing: currentItem.finishing
          });
          
          if (globalItem) {
            globalItemCode = globalItem.item_code;
          }
        } catch (error) {
          console.error('Error creating global item:', error);
        }
      }

      const updatedItem: OrderItem = {
        ...currentItem,
        id: editingItemId,
        subTotal,
        globalItemCode
      };

      setOrderList(prev => [...prev, updatedItem]);
      resetCurrentItem();
    }
  };

  const resetItems = () => {
    setOrderList([]);
    resetCurrentItem();
    setTotalPrice(0);
  };

  return {
    currentItem,
    orderList,
    totalPrice,
    editingItemId,
    updateCurrentItem,
    resetCurrentItem,
    addToOrderList,
    deleteFromOrderList,
    editOrderItem,
    saveEditingItem,
    resetItems,
    generateNextItemId: () => generateNextItemId(orderList)
  };
};

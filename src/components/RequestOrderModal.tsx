
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateItemPrice, formatCurrency } from '@/services/masterData';
import { useToast } from '@/hooks/use-toast';
import { generateOrderNumber, saveOrderToDatabase } from '@/services/orderService';
import CustomerInfoSection from './order/CustomerInfoSection';
import ItemFormSection from './order/ItemFormSection';
import OrderListSection from './order/OrderListSection';
import ServiceCostSection from './order/ServiceCostSection';
import PriceSummarySection from './order/PriceSummarySection';
import OrderActionButtons from './order/OrderActionButtons';

interface OrderItem {
  id: string;
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  subTotal: number;
}

interface RequestOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const RequestOrderModal = ({ open, onClose, onSubmit }: RequestOrderModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    orderNumber: generateOrderNumber(),
    customer: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: new Date().toTimeString().slice(0, 5),
    estimasi: '',
    estimasiWaktu: '',
    outdoor: false,
    laserPrinting: false,
    mugNota: false,
    jasaDesain: '',
    biayaLain: '',
    subTotal: '',
    discount: 0,
    ppn: 10,
    paymentType: '',
    bank: '',
    admin: '',
    desainer: '',
    komputer: '',
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    id: '',
    bahan: '',
    item: '',
    ukuran: { panjang: '', lebar: '' },
    quantity: '',
    finishing: ''
  });

  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const total = orderList.reduce((sum, item) => sum + item.subTotal, 0);
    setTotalPrice(total);
  }, [orderList]);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  useEffect(() => {
    if (editingItemId) {
      setHasUnsavedChanges(true);
    }
  }, [currentItem, editingItemId]);

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCurrentItem = (field: string, value: any) => {
    setCurrentItem(prev => {
      if (field === 'ukuran') {
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetCurrentItem = () => {
    setCurrentItem({
      id: '',
      bahan: '',
      item: '',
      ukuran: { panjang: '', lebar: '' },
      quantity: '',
      finishing: ''
    });
    setEditingItemId(null);
  };

  const addToOrderList = () => {
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

    const newOrderItem: OrderItem = {
      ...currentItem,
      id: currentItem.id || Date.now().toString(),
      subTotal
    };

    setOrderList(prev => [...prev, newOrderItem]);
    resetCurrentItem();
  };

  const deleteFromOrderList = (itemId: string) => {
    setOrderList(prev => prev.filter(item => item.id !== itemId));
  };

  const editOrderItem = (item: OrderItem) => {
    setCurrentItem(item);
    setEditingItemId(item.id);
    deleteFromOrderList(item.id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingItemId && currentItem.item && currentItem.ukuran.panjang && currentItem.ukuran.lebar && currentItem.quantity) {
        const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
        const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
        const quantity = parseInt(currentItem.quantity) || 0;
        
        let subTotal = 0;
        if (panjang > 0 && lebar > 0 && quantity > 0) {
          subTotal = calculateItemPrice(panjang, lebar, quantity, currentItem.bahan, currentItem.finishing);
        }

        const updatedItem: OrderItem = {
          ...currentItem,
          id: editingItemId,
          subTotal
        };

        setOrderList(prev => [...prev, updatedItem]);
        resetCurrentItem();
      }
      
      const finalOrderData = {
        ...formData,
        items: orderList,
        totalPrice: formatCurrency(totalPrice)
      };
      
      await saveOrderToDatabase(finalOrderData);
      onSubmit(finalOrderData);
      setHasUnsavedChanges(false);
      resetForm();
      onClose();
      
      toast({
        title: "Order saved successfully",
        description: "The order has been saved to the database.",
      });
      
      console.log('Order saved and submitted:', finalOrderData);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error saving order",
        description: "There was an error saving the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReceipt = () => {
    console.log('Print Receipt clicked - functionality to be implemented');
  };

  const resetForm = () => {
    setFormData({
      orderNumber: generateOrderNumber(),
      customer: '',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toTimeString().slice(0, 5),
      estimasi: '',
      estimasiWaktu: '',
      outdoor: false,
      laserPrinting: false,
      mugNota: false,
      jasaDesain: '',
      biayaLain: '',
      subTotal: '',
      discount: 0,
      ppn: 10,
      paymentType: '',
      bank: '',
      admin: '',
      desainer: '',
      komputer: '',
      notes: ''
    });
    setOrderList([]);
    resetCurrentItem();
    setTotalPrice(0);
    setHasUnsavedChanges(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePrintReceipt();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Request Order {formData.orderNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 border-r flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <CustomerInfoSection 
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                    />
                    <ItemFormSection
                      currentItem={currentItem}
                      updateCurrentItem={updateCurrentItem}
                      resetCurrentItem={resetCurrentItem}
                      editingItemId={editingItemId}
                      onSave={handleSave}
                      onAddItem={addToOrderList}
                      isSaving={isSaving}
                    />
                  </div>
                </ScrollArea>
              </div>

              <div className="w-1/2 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <OrderListSection
                      orderList={orderList}
                      onEditItem={editOrderItem}
                      onDeleteItem={deleteFromOrderList}
                    />
                    <ServiceCostSection
                      formData={formData}
                      totalPrice={totalPrice}
                      onFormDataChange={handleFormDataChange}
                    />
                  </div>
                </ScrollArea>

                <PriceSummarySection
                  formData={formData}
                  totalPrice={totalPrice}
                  onFormDataChange={handleFormDataChange}
                />
              </div>
            </div>

            <OrderActionButtons
              onNew={resetForm}
              onSave={handleSave}
              onSubmit={handlePrintReceipt}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestOrderModal;

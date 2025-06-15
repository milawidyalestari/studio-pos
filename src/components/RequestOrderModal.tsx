
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/services/productPricing';
import { useToast } from '@/hooks/use-toast';
import { generateOrderNumber } from '@/services/orderService';
import { useOrders } from '@/hooks/useOrders';
import { useProducts, Product } from '@/hooks/useProducts';
import { calculateProductPrice } from '@/services/productPricing';
import CustomerInfoSection from './order/CustomerInfoSection';
import ItemFormSection from './order/ItemFormSection';
import OrderListSection from './order/OrderListSection';
import ServiceCostSection from './order/ServiceCostSection';
import PriceSummarySection from './order/PriceSummarySection';
import OrderActionButtons from './order/OrderActionButtons';
import { Order } from '@/types';

interface OrderItem {
  id: string;
  productCode: string;
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
  editingOrder?: Order | null;
}

const RequestOrderModal = ({ open, onClose, onSubmit, editingOrder }: RequestOrderModalProps) => {
  const { toast } = useToast();
  const { createOrder, isCreatingOrder } = useOrders();
  const { data: products } = useProducts();
  
  const [formData, setFormData] = useState({
    orderNumber: generateOrderNumber(),
    customer: '',
    customerId: '',
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
    productCode: '',
    item: '',
    ukuran: { panjang: '', lebar: '' },
    quantity: '',
    finishing: ''
  });

  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const generateNextItemId = () => {
    const nextNumber = orderList.length + 1;
    return nextNumber.toString().padStart(3, '0');
  };

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
      productCode: '',
      item: '',
      ukuran: { panjang: '', lebar: '' },
      quantity: '',
      finishing: ''
    });
    setEditingItemId(null);
  };

  const calculateItemSubTotal = (item: typeof currentItem): number => {
    if (!products || !item.productCode || !item.quantity) return 0;

    const product = products.find(p => p.kode === item.productCode);
    if (!product) return 0;

    const panjang = parseFloat(item.ukuran.panjang) || 0;
    const lebar = parseFloat(item.ukuran.lebar) || 0;
    const quantity = parseInt(item.quantity) || 0;

    let subtotal = calculateProductPrice(product, quantity, panjang, lebar);

    // Add finishing cost if selected
    if (item.finishing && item.finishing !== 'none') {
      const finishingService = products.find(p => p.kode === item.finishing);
      if (finishingService) {
        subtotal += (finishingService.harga_jual || 0) * quantity;
      }
    }

    return subtotal;
  };

  const addToOrderList = () => {
    if (!currentItem.item || !currentItem.quantity || !currentItem.productCode) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const subTotal = calculateItemSubTotal(currentItem);
    const itemId = generateNextItemId();

    const newOrderItem: OrderItem = {
      ...currentItem,
      id: itemId,
      subTotal
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

  const calculateOrderTotal = (items: OrderItem[], jasaDesain: number = 0, biayaLain: number = 0, discount: number = 0, ppn: number = 10) => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    const subtotal = itemsTotal + jasaDesain + biayaLain;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * ppn) / 100;
    const total = afterDiscount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  };

  const handleSave = async () => {
    try {
      if (editingItemId && currentItem.item && currentItem.quantity && currentItem.productCode) {
        const subTotal = calculateItemSubTotal(currentItem);

        const updatedItem: OrderItem = {
          ...currentItem,
          id: editingItemId,
          subTotal
        };

        setOrderList(prev => [...prev, updatedItem]);
        resetCurrentItem();
      }
      
      const totals = calculateOrderTotal(
        orderList,
        parseFloat(formData.jasaDesain) || 0,
        parseFloat(formData.biayaLain) || 0,
        formData.discount || 0,
        formData.ppn || 10
      );

      const orderData = {
        order_number: formData.orderNumber,
        customer_id: formData.customerId || null,
        customer_name: formData.customer,
        tanggal: formData.tanggal,
        waktu: formData.waktu || null,
        estimasi: formData.estimasi || null,
        estimasi_waktu: formData.estimasiWaktu || null,
        outdoor: formData.outdoor || false,
        laser_printing: formData.laserPrinting || false,
        mug_nota: formData.mugNota || false,
        jasa_desain: parseFloat(formData.jasaDesain) || 0,
        biaya_lain: parseFloat(formData.biayaLain) || 0,
        sub_total: totals.subtotal,
        discount: formData.discount || 0,
        ppn: formData.ppn || 10,
        total_amount: totals.total,
        payment_type: formData.paymentType || null,
        bank: formData.bank || null,
        komputer: formData.komputer || null,
        notes: formData.notes || null,
        status: 'pending' as const
      };

      const items = orderList.map((item) => ({
        item_name: item.item,
        bahan: item.productCode || null,
        panjang: parseFloat(item.ukuran?.panjang) || null,
        lebar: parseFloat(item.ukuran?.lebar) || null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0
      }));

      createOrder({ orderData, items });
      
      onSubmit({
        ...formData,
        items: orderList,
        totalPrice: formatCurrency(totals.total)
      });
      
      setHasUnsavedChanges(false);
      resetForm();
      onClose();
      
      console.log('Order saved and submitted successfully');
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handlePrintReceipt = () => {
    console.log('Print Receipt clicked - functionality to be implemented');
  };

  const resetForm = () => {
    setFormData({
      orderNumber: generateOrderNumber(),
      customer: '',
      customerId: '',
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

  // Pre-fill form with editing order data
  useEffect(() => {
    if (editingOrder && open) {
      setFormData({
        orderNumber: editingOrder.orderNumber,
        customer: editingOrder.customer,
        customerId: '', // We'll need to map this properly if editing existing orders
        tanggal: new Date(editingOrder.date).toISOString().split('T')[0],
        waktu: new Date().toTimeString().slice(0, 5),
        estimasi: editingOrder.estimatedDate,
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
        desainer: editingOrder.designer?.name || '',
        komputer: '',
        notes: ''
      });
      
      // Set order items if available
      const mockItems = editingOrder.items.map((item, index) => ({
        id: (index + 1).toString().padStart(3, '0'),
        bahan: 'vinyl',
        item: item,
        ukuran: { panjang: '1000', lebar: '500' },
        quantity: '1',
        finishing: 'laminating',
        subTotal: 50000
      }));
      
      setOrderList(mockItems);
    } else if (!editingOrder && open) {
      // Reset form for new order
      resetForm();
    }
  }, [editingOrder, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            {editingOrder ? `Edit Order ${formData.orderNumber}` : `Request Order ${formData.orderNumber}`}
          </DialogTitle>
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
                      isSaving={isCreatingOrder}
                      nextItemId={generateNextItemId()}
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
              isSaving={isCreatingOrder}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestOrderModal;

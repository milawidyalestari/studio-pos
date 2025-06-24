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
import { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];
type PaymentType = Database['public']['Enums']['payment_type'];

const initialFormData = {
  orderNumber: '',
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
  paymentType: '' as PaymentType | '',
  bank: '',
  admin: '',
  desainer: '',
  komputer: '',
  notes: '',
  status: 'Design' as OrderStatus,
};

type FormData = typeof initialFormData;

interface OrderItem {
  id: string;
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  subTotal: number;
}

type SubmittedOrderData = FormData & {
  items: OrderItem[];
  totalPrice: string;
}

interface RequestOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (orderData: SubmittedOrderData) => void;
  editingOrder?: Order | null;
}

const RequestOrderModal = ({ open, onClose, onSubmit, editingOrder }: RequestOrderModalProps) => {
  const { toast } = useToast();
  const { createOrder, isCreatingOrder, updateOrder, isUpdatingOrder } = useOrders();
  const { data: products } = useProducts();
  
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    orderNumber: generateOrderNumber(),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormDataChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCurrentItem = (field: keyof typeof currentItem, value: any) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
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

  const calculateItemSubTotal = (item: typeof currentItem): number => {
    if (!products || !item.bahan || !item.quantity) return 0;

    const product = products.find(p => p.kode === item.bahan);
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
    if (!currentItem.item || !currentItem.quantity || !currentItem.bahan) {
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
      if (editingItemId && currentItem.item && currentItem.quantity && currentItem.bahan) {
        const subTotal = calculateItemSubTotal(currentItem);

        const updatedItem: OrderItem = {
          ...currentItem,
          id: editingItemId,
          subTotal
        };

        setOrderList(prev => [...prev, updatedItem].sort((a, b) => a.id.localeCompare(b.id)));
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
        status: formData.status
      };

      const items = orderList.map((item) => ({
        item_name: item.item,
        bahan: item.bahan || null,
        panjang: parseFloat(item.ukuran?.panjang) || null,
        lebar: parseFloat(item.ukuran?.lebar) || null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0
      }));

      if (editingOrder) {
        updateOrder({ orderId: editingOrder.id, orderData, items });
      } else {
        createOrder({ orderData: { ...orderData, order_number: formData.orderNumber }, items });
      }
      
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
      ...initialFormData,
      orderNumber: generateOrderNumber(),
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
        notes: '',
        status: editingOrder.status
      });
      
      // Set order items if available
      const mockItems = editingOrder.items.map((item, index) => ({
        id: (index + 1).toString().padStart(3, '0'),
        bahan: 'vinyl', // This is a mock, replace with actual data if available
        item: item,
        ukuran: { panjang: '1000', lebar: '500' }, // mock data
        quantity: '1', // mock data
        finishing: 'laminating', // mock data
        subTotal: 50000 // mock data
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
                      isSaving={isCreatingOrder || isUpdatingOrder}
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
              isSaving={isCreatingOrder || isUpdatingOrder}
              hasUnsavedChanges={hasUnsavedChanges}
            >
              <div className="flex items-center gap-2 mr-2">
                <select
                  id="status"
                  value={formData.status}
                  onChange={e => handleFormDataChange('status', e.target.value as OrderStatus)}
                  className="border rounded-md p-2 min-w-[120px]"
                >
                  <option value="Design">Design</option>
                  <option value="Cek File">Cek File</option>
                  <option value="Konfirmasi">Konfirmasi</option>
                  <option value="Export">Export</option>
                  <option value="Done">Done</option>
                  <option value="Proses Cetak">Proses Cetak</option>
                </select>
              </div>
            </OrderActionButtons>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestOrderModal;

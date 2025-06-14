
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/services/masterData';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { useOrderForm } from '@/hooks/useOrderForm';
import { useOrderItems } from '@/hooks/useOrderItems';
import { calculateOrderTotal } from '@/utils/orderCalculations';
import CustomerInfoSection from './order/CustomerInfoSection';
import ItemFormSection from './order/ItemFormSection';
import OrderListSection from './order/OrderListSection';
import ServiceCostSection from './order/ServiceCostSection';
import PriceSummarySection from './order/PriceSummarySection';
import OrderActionButtons from './order/OrderActionButtons';
import { Order } from '@/types';

interface RequestOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
  editingOrder?: Order | null;
}

const RequestOrderModal = ({ open, onClose, onSubmit, editingOrder }: RequestOrderModalProps) => {
  const { toast } = useToast();
  const { createOrder, isCreatingOrder } = useOrders();
  
  const {
    formData,
    hasUnsavedChanges,
    handleFormDataChange,
    resetForm,
    setHasUnsavedChanges
  } = useOrderForm();

  const {
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
    generateNextItemId
  } = useOrderItems();

  const handleSave = async () => {
    try {
      if (editingItemId) {
        await saveEditingItem();
      }
      
      const totals = calculateOrderTotal(
        orderList,
        parseFloat(formData.jasaDesain) || 0,
        parseFloat(formData.biayaLain) || 0,
        formData.discount || 0,
        formData.ppn || 10
      );

      const uniqueOrderNumber = `${formData.orderNumber}-${Date.now().toString().slice(-4)}`;

      const orderData = {
        order_number: uniqueOrderNumber,
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
        bahan: item.bahan || null,
        panjang: parseFloat(item.ukuran?.panjang) || null,
        lebar: parseFloat(item.ukuran?.lebar) || null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0,
        global_item_code: item.globalItemCode || null
      }));

      createOrder({ orderData, items });
      
      onSubmit({
        ...formData,
        items: orderList,
        totalPrice: formatCurrency(totals.total)
      });
      
      setHasUnsavedChanges(false);
      handleReset();
      onClose();
      
      console.log('Order saved and submitted successfully');
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handlePrintReceipt = () => {
    console.log('Print Receipt clicked - functionality to be implemented');
  };

  const handleReset = () => {
    resetForm();
    resetItems();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePrintReceipt();
  };

  useEffect(() => {
    if (editingOrder && open) {
      handleFormDataChange('orderNumber', editingOrder.orderNumber);
      handleFormDataChange('customer', editingOrder.customer);
      handleFormDataChange('tanggal', new Date(editingOrder.date).toISOString().split('T')[0]);
      handleFormDataChange('waktu', new Date().toTimeString().slice(0, 5));
      handleFormDataChange('estimasi', editingOrder.estimatedDate);
      handleFormDataChange('estimasiWaktu', '');
      handleFormDataChange('outdoor', false);
      handleFormDataChange('laserPrinting', false);
      handleFormDataChange('mugNota', false);
      handleFormDataChange('jasaDesain', '');
      handleFormDataChange('biayaLain', '');
      handleFormDataChange('subTotal', '');
      handleFormDataChange('discount', 0);
      handleFormDataChange('ppn', 10);
      handleFormDataChange('paymentType', '');
      handleFormDataChange('bank', '');
      handleFormDataChange('admin', '');
      handleFormDataChange('desainer', editingOrder.designer?.name || '');
      handleFormDataChange('komputer', '');
      handleFormDataChange('notes', '');
      
      // Reset items for demo - in real app would load from order
      resetItems();
    } else if (!editingOrder && open) {
      handleReset();
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
                      onSave={saveEditingItem}
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
              onNew={handleReset}
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

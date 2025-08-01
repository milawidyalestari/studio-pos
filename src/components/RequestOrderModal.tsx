import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/services/productPricing';
import { useToast } from '@/hooks/use-toast';
import { generateOrderNumber, fetchNextOrderNumber } from '@/services/orderService';
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
import { useOrderStatus, OrderStatus as DBOrderStatus } from '@/hooks/useOrderStatus';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';
import { usePrintOverlay } from '@/hooks/usePrintOverlay';
import { PrintOverlay } from '@/components/PrintOverlay';
import { mapOrderItemsWithNames } from '@/utils/productMapping';
import { useQuery } from '@tanstack/react-query';
import AddStockModal from '@/components/AddStockModal';

type PaymentType = string;

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
  status_id: null as number | null,
  downPayment: '',
  pelunasan: '',
  taxChecked: false,
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
  notes?: string;
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
  onReopen?: (editingOrder?: Order | null) => void;
}

// Helper to safely parse and format a date string, defaulting to today if missing/invalid
function safeDateString(dateValue: unknown): string {
  const today = new Date().toISOString().split('T')[0];
  if (!dateValue) return today;
  const d = new Date(dateValue as string);
  return isNaN(d.getTime()) ? today : d.toISOString().split('T')[0];
}

const RequestOrderModal = ({ open, onClose, onSubmit, editingOrder, onReopen }: RequestOrderModalProps) => {
  const { toast } = useToast();
  const { createOrder, isCreatingOrder, updateOrder, isUpdatingOrder } = useOrders();
  const { data: products } = useProducts();
  // Tambahkan query untuk materials
  const { data: materials = [], refetch: refetchMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('id, kode, nama, satuan, lebar_maksimum');
      if (error) throw error;
      return data || [];
    },
  });
  const { statuses, loading: statusesLoading } = useOrderStatus();
  const {
    isOpen: isPrintOverlayOpen,
    printType,
    printData,
    closePrintOverlay,
    handlePrint,
    printReceipt,
    openPrintOverlay,
  } = usePrintOverlay();
  
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    orderNumber: '',
  });
  const [orderNumberLoading, setOrderNumberLoading] = useState(false);

  const [currentItem, setCurrentItem] = useState({
    id: '',
    bahan: '',
    item: '',
    ukuran: { panjang: '', lebar: '' },
    quantity: '',
    finishing: 'Lembaran'
  });

  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [admins, setAdmins] = useState<Employee[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasEditChanges, setHasEditChanges] = useState(false);
  const [initialFormDataSnapshot, setInitialFormDataSnapshot] = useState<FormData | null>(null);
  const [hasFormDataChanges, setHasFormDataChanges] = useState(false);
  const [hasItemsAdded, setHasItemsAdded] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [shouldReopenModal, setShouldReopenModal] = useState(false);
  const [tempFormData, setTempFormData] = useState<FormData | null>(null);
  const [tempOrderList, setTempOrderList] = useState<OrderItem[]>([]);
  const [tempEditingOrder, setTempEditingOrder] = useState<Order | null>(null);
  const [isRestoringData, setIsRestoringData] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasItemFormChanges, setHasItemFormChanges] = useState(false);
  const [hasPostConfirmationChanges, setHasPostConfirmationChanges] = useState(false);
  const [wasConfirmedBeforePrint, setWasConfirmedBeforePrint] = useState(false);

  const generateNextItemId = () => {
    const nextNumber = orderList.length + 1;
    return nextNumber.toString().padStart(3, '0');
  };

  useEffect(() => {
    const total = orderList.reduce((sum, item) => sum + item.subTotal, 0);
    setTotalPrice(total);
    
    // Set hasItemsAdded berdasarkan apakah ada item di orderList
    if (orderList.length > 0 && !isEditMode) {
      setHasItemsAdded(true);
    }
  }, [orderList, isEditMode]);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  useEffect(() => {
    if (editingItemId) {
      setHasUnsavedChanges(true);
    }
  }, [currentItem, editingItemId]);

  // Reset isConfirmed when there are changes
  useEffect(() => {
    if (hasUnsavedChanges || hasEditChanges || hasFormDataChanges || hasItemsAdded || hasItemFormChanges) {
      setIsConfirmed(false);
    }
  }, [hasUnsavedChanges, hasEditChanges, hasFormDataChanges, hasItemsAdded, hasItemFormChanges]);

  // Track changes after confirmation for specific fields
  useEffect(() => {
    if (isConfirmed) {
      const hasJasaDesainChanged = formData.jasaDesain !== initialFormDataSnapshot?.jasaDesain;
      const hasBiayaLainChanged = formData.biayaLain !== initialFormDataSnapshot?.biayaLain;
      const hasSubTotalChanged = totalPrice !== (initialFormDataSnapshot ? 
        calculateOrderTotal(
          orderList,
          parseFloat(initialFormDataSnapshot.jasaDesain) || 0,
          parseFloat(initialFormDataSnapshot.biayaLain) || 0,
          initialFormDataSnapshot.discount || 0,
          initialFormDataSnapshot.ppn || 10,
          initialFormDataSnapshot.taxChecked
        ).total : 0);
      const hasAdminChanged = formData.admin !== initialFormDataSnapshot?.admin;
      const hasDesainerChanged = formData.desainer !== initialFormDataSnapshot?.desainer;
      const hasKomputerChanged = formData.komputer !== initialFormDataSnapshot?.komputer;

      const hasRelevantChanges = hasJasaDesainChanged || hasBiayaLainChanged || hasSubTotalChanged || 
                                hasAdminChanged || hasDesainerChanged || hasKomputerChanged;
      
      setHasPostConfirmationChanges(hasRelevantChanges);
    } else {
      setHasPostConfirmationChanges(false);
    }
  }, [
    isConfirmed, 
    formData.jasaDesain, 
    formData.biayaLain, 
    formData.admin, 
    formData.desainer, 
    formData.komputer,
    totalPrice,
    orderList,
    initialFormDataSnapshot
  ]);

  // Detect changes in item form
  useEffect(() => {
    const hasChanges = currentItem.item || currentItem.bahan || currentItem.quantity || currentItem.finishing || 
                      currentItem.ukuran.panjang || currentItem.ukuran.lebar;
    setHasItemFormChanges(!!hasChanges);
  }, [currentItem]);

  // Deteksi perubahan pada customer, date, service costs, dan order action
  useEffect(() => {
    if (isEditMode && initialFormDataSnapshot) {
      const hasCustomerChanged = formData.customer !== initialFormDataSnapshot.customer;
      const hasDateChanged = formData.tanggal !== initialFormDataSnapshot.tanggal;
      const hasAdminChanged = formData.admin !== initialFormDataSnapshot.admin;
      const hasDesainerChanged = formData.desainer !== initialFormDataSnapshot.desainer;
      const hasStatusChanged = formData.status_id !== initialFormDataSnapshot.status_id;
      const hasJasaDesainChanged = formData.jasaDesain !== initialFormDataSnapshot.jasaDesain;
      const hasBiayaLainChanged = formData.biayaLain !== initialFormDataSnapshot.biayaLain;
      const hasDiscountChanged = formData.discount !== initialFormDataSnapshot.discount;
      const hasPpnChanged = formData.ppn !== initialFormDataSnapshot.ppn;
      const hasPaymentTypeChanged = formData.paymentType !== initialFormDataSnapshot.paymentType;
      const hasBankChanged = formData.bank !== initialFormDataSnapshot.bank;
      const hasKomputerChanged = formData.komputer !== initialFormDataSnapshot.komputer;
      const hasNotesChanged = formData.notes !== initialFormDataSnapshot.notes;
      const hasOutdoorChanged = formData.outdoor !== initialFormDataSnapshot.outdoor;
      const hasLaserPrintingChanged = formData.laserPrinting !== initialFormDataSnapshot.laserPrinting;
      const hasMugNotaChanged = formData.mugNota !== initialFormDataSnapshot.mugNota;
      const hasEstimasiChanged = formData.estimasi !== initialFormDataSnapshot.estimasi;
      const hasEstimasiWaktuChanged = formData.estimasiWaktu !== initialFormDataSnapshot.estimasiWaktu;
      const hasDownPaymentChanged = formData.downPayment !== initialFormDataSnapshot.downPayment;
      const hasPelunasanChanged = formData.pelunasan !== initialFormDataSnapshot.pelunasan;
      const hasTaxCheckedChanged = formData.taxChecked !== initialFormDataSnapshot.taxChecked;
      setHasFormDataChanges(
        hasCustomerChanged || hasDateChanged || hasAdminChanged || hasDesainerChanged || 
        hasStatusChanged || hasJasaDesainChanged || hasBiayaLainChanged || hasDiscountChanged || 
        hasPpnChanged || hasPaymentTypeChanged || hasBankChanged || hasKomputerChanged || 
        hasNotesChanged || hasOutdoorChanged || hasLaserPrintingChanged || hasMugNotaChanged ||
        hasEstimasiChanged || hasEstimasiWaktuChanged || hasDownPaymentChanged || hasPelunasanChanged || hasTaxCheckedChanged
      );
    } else {
      setHasFormDataChanges(false);
    }
  }, [
    formData.customer, formData.tanggal, formData.admin, formData.desainer, formData.status_id,
    formData.jasaDesain, formData.biayaLain, formData.discount, formData.ppn, formData.paymentType,
    formData.bank, formData.komputer, formData.notes, formData.outdoor, formData.laserPrinting,
    formData.mugNota, formData.estimasi, formData.estimasiWaktu, formData.downPayment, formData.pelunasan, formData.taxChecked,
    isEditMode, initialFormDataSnapshot
  ]);

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
      finishing: 'Lembaran'
    });
    setEditingItemId(null);
    setHasItemFormChanges(false);
  };

  const calculateItemSubTotal = (item: typeof currentItem): number => {
    if (!products || !item.item || !item.quantity) return 0;

    // Cari produk berdasarkan kode item, bukan bahan
    const product = products.find(p => p.kode === item.item);
    if (!product) return 0;

    const panjang = parseFloat(item.ukuran.panjang as string) || 0;
    const lebar = parseFloat(item.ukuran.lebar as string) || 0;
    const quantity = parseInt(item.quantity) || 0;

    // Ambil data material dari tabel materials (lebar_maksimum)
    const material = materials.find((m: any) => m.kode === item.bahan);
    const lebarMaksimum = material?.lebar_maksimum;
    const materialForPricing = lebarMaksimum ? { lebar_maksimum: lebarMaksimum } : undefined;

    let subtotal = calculateProductPrice(product, quantity, panjang, lebar, materialForPricing);

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

    // Pastikan ukuran tetap string
    const panjangStr = currentItem.ukuran.panjang ? String(currentItem.ukuran.panjang) : '';
    const lebarStr = currentItem.ukuran.lebar ? String(currentItem.ukuran.lebar) : '';
    const newOrderItem: OrderItem = {
      ...currentItem,
      id: itemId,
      ukuran: {
        panjang: panjangStr,
        lebar: lebarStr,
      },
      subTotal
    };

    setOrderList(prev => [...prev, newOrderItem]);
    setHasItemsAdded(true);
    resetCurrentItem();
    setHasItemFormChanges(false);
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
    // Pastikan ukuran tetap string
    setCurrentItem({ ...item, id: item.id, ukuran: { panjang: String(item.ukuran.panjang), lebar: String(item.ukuran.lebar) } });
    setEditingItemId(item.id);
    // Tidak menghapus item dari order list, biarkan tetap ada untuk visual feedback
  };

  const calculateOrderTotal = (
    items: OrderItem[],
    jasaDesain?: number,
    biayaLain?: number,
    discount?: number,
    ppn?: number,
    taxChecked?: boolean
  ) => {
    let itemsTotal = items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    let total = itemsTotal;

    if (typeof jasaDesain !== 'undefined' && Number(jasaDesain) > 0) {
      total += Number(jasaDesain);
    }
    if (typeof biayaLain !== 'undefined' && Number(biayaLain) > 0) {
      total += Number(biayaLain);
    }

    let discountAmount = 0;
    if (typeof discount !== 'undefined' && Number(discount) > 0) {
      discountAmount = total * (Number(discount) / 100);
      total -= discountAmount;
    }

    let taxAmount = 0;
    const isTaxChecked = typeof taxChecked === 'string' ? taxChecked === 'true' : Boolean(taxChecked);
    if (isTaxChecked && typeof ppn !== 'undefined' && Number(ppn) > 0) {
      taxAmount = total * (Number(ppn) / 100);
      total += taxAmount;
    }

    return {
      subtotal: itemsTotal,
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

        // Update item yang ada secara langsung tanpa mengubah urutan
        setOrderList(prev => 
          prev.map(item => item.id === editingItemId ? updatedItem : item)
        );
        resetCurrentItem();
      }
      
      const totals = calculateOrderTotal(
        orderList,
        parseFloat(formData.jasaDesain) || 0,
        parseFloat(formData.biayaLain) || 0,
        formData.discount || 0,
        formData.ppn || 10,
        formData.taxChecked
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
        ppn: formData.taxChecked ? (formData.ppn || 10) : null,
        total_amount: totals.total,
        payment_type: formData.paymentType || null,
        bank: formData.bank || null,
        komputer: formData.komputer || null,
        notes: (editingOrder && 'notes' in editingOrder && editingOrder.notes) ? String(editingOrder.notes) : '',
        status_id: formData.status_id,
        admin_id: formData.admin || null,
        desainer_id: formData.desainer || null,
        down_payment: parseFloat(formData.downPayment) || null,
        pelunasan: parseFloat(formData.pelunasan) || null,
        tax_checked: formData.taxChecked || false,
      } as any; // Use type assertion to bypass strict typing for now

      // Saat mapping orderItems untuk insert/update ke supabase
      const items = orderList.map((item) => ({
        item_name: item.item,
        bahan: item.bahan || null,
        panjang: item.ukuran?.panjang ? parseFloat(item.ukuran.panjang) : null,
        lebar: item.ukuran?.lebar ? parseFloat(item.ukuran.lebar) : null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0,
        description: item.notes || null
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
      setHasEditChanges(false);
      setHasFormDataChanges(false);
      setHasItemsAdded(false);
      setInitialFormDataSnapshot(null);
      resetForm();
      onClose();
      
      console.log('Order saved and submitted successfully');
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleConfirm = async () => {
    try {
      let updatedOrderList = orderList;
      
      if (editingItemId && currentItem.item && currentItem.quantity && currentItem.bahan) {
        const subTotal = calculateItemSubTotal(currentItem);

        const updatedItem: OrderItem = {
          ...currentItem,
          id: editingItemId,
          subTotal
        };

        // Update item yang ada secara langsung tanpa mengubah urutan
        updatedOrderList = orderList.map(item => item.id === editingItemId ? updatedItem : item);
        setOrderList(updatedOrderList);
        resetCurrentItem();
      }
      
      const totals = calculateOrderTotal(
        updatedOrderList,
        parseFloat(formData.jasaDesain) || 0,
        parseFloat(formData.biayaLain) || 0,
        formData.discount || 0,
        formData.ppn || 10,
        formData.taxChecked
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
        ppn: formData.taxChecked ? (formData.ppn || 10) : null,
        total_amount: totals.total,
        payment_type: formData.paymentType || null,
        bank: formData.bank || null,
        komputer: formData.komputer || null,
        notes: (editingOrder && 'notes' in editingOrder && editingOrder.notes) ? String(editingOrder.notes) : '',
        status_id: formData.status_id,
        admin_id: formData.admin || null,
        desainer_id: formData.desainer || null,
        down_payment: parseFloat(formData.downPayment) || null,
        pelunasan: parseFloat(formData.pelunasan) || null,
        tax_checked: formData.taxChecked || false,
      } as any; // Use type assertion to bypass strict typing for now

      // Saat mapping orderItems untuk insert/update ke supabase
      const items = updatedOrderList.map((item) => ({
        item_name: item.item,
        bahan: item.bahan || null,
        panjang: item.ukuran?.panjang ? parseFloat(item.ukuran.panjang) : null,
        lebar: item.ukuran?.lebar ? parseFloat(item.ukuran.lebar) : null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0,
        description: item.notes || null
      }));

      if (editingOrder) {
        updateOrder({ orderId: editingOrder.id, orderData, items });
      } else {
        createOrder({ orderData: { ...orderData, order_number: formData.orderNumber }, items });
      }
      
      onSubmit({
        ...formData,
        items: updatedOrderList,
        totalPrice: formatCurrency(totals.total)
      });
      
      setHasUnsavedChanges(false);
      setHasEditChanges(false);
      setHasFormDataChanges(false);
      setHasItemsAdded(false);
      setIsConfirmed(true); // Set confirmed state
      // Save snapshot after confirmation for tracking post-confirmation changes
      setInitialFormDataSnapshot({ ...formData });
      setHasPostConfirmationChanges(false);
      // Don't close modal after confirmation
      
      console.log('Order confirmed successfully');
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const handlePrintReceipt = async () => {
    // Map order items to include product names
    const mappedOrderList = mapOrderItemsWithNames(orderList, products || []);
    
    // Untuk printOrderList dan mapping lain yang butuh string:
    const printOrderList = mappedOrderList.map(item => ({
      id: item.id,
      item: item.itemName || item.item, // Use name instead of code
      quantity: parseInt(item.quantity) || 0,
      subTotal: item.subTotal,
      ukuran: {
        panjang: item.ukuran?.panjang ? String(item.ukuran.panjang) : '',
        lebar: item.ukuran?.lebar ? String(item.ukuran.lebar) : '',
      },
    }));

    const orderData = {
      orderNumber: formData.orderNumber,
      customerName: formData.customer,
      totalAmount: totalPrice,
      outdoor: formData.outdoor,
      laserPrinting: formData.laserPrinting,
      mugNota: formData.mugNota,
    };

    // Open print overlay
    printReceipt({ orderList: printOrderList, orderData });
  };

  const handlePrintSPK = async () => {
    // Use a fresh state read to ensure we get the latest orderList
    const currentOrderList = orderList;
    
    // Map order items to include product names
    const mappedOrderList = mapOrderItemsWithNames(currentOrderList, products || []);
    
    // Untuk printOrderList dan mapping lain yang butuh string:
    const printOrderList = mappedOrderList.map(item => ({
      id: item.id,
      item: item.itemName || item.item, // Use name instead of code
      quantity: parseInt(item.quantity) || 0,
      subTotal: item.subTotal,
      description: item.notes || '', // Add description from notes
      finishing: item.finishing || '', // Add finishing data
      ukuran: {
        panjang: item.ukuran?.panjang ? String(item.ukuran.panjang) : '',
        lebar: item.ukuran?.lebar ? String(item.ukuran.lebar) : '',
      },
    }));

    // Get designer name from ID
    const designer = employees.find(emp => emp.id === formData.desainer);
    const designerName = designer?.nama || 'Belum ditugaskan';
    
    const orderData = {
      orderNumber: formData.orderNumber,
      customerName: formData.customer,
      totalAmount: totalPrice,
      outdoor: formData.outdoor,
      laserPrinting: formData.laserPrinting,
      mugNota: formData.mugNota,
      estimasi: formData.estimasi,
      estimasiWaktu: formData.estimasiWaktu,
      komputer: formData.komputer || '???',
      desainer: designerName,
    };

    // Save current form data and order list before closing
    // Use the latest confirmed orderList state
    console.log('Saving data before print overlay:', { formData, currentOrderList, editingOrder, isConfirmed });
    setTempFormData({ ...formData });
    setTempOrderList([...currentOrderList]); // Create new array to ensure fresh state
    setTempEditingOrder(editingOrder || null);
    // Save the current confirmation state
    setWasConfirmedBeforePrint(isConfirmed);
    // Set flag to reopen modal when print overlay closes
    setShouldReopenModal(true);
    // Close Request Order modal and open print overlay for SPK
    onClose();
    openPrintOverlay('spk', { orderList: printOrderList, orderData });
  };

  const handleReopenRequestOrderModal = () => {
    setShouldReopenModal(false);
    // Reopen the Request Order modal
    onClose(); // This will trigger the parent to reopen the modal
  };

  const resetForm = async () => {
    let defaultStatusId = null;
    const designStatus = statuses.find(s => s.name.toLowerCase() === 'design');
    if (designStatus) defaultStatusId = designStatus.id;
    setOrderNumberLoading(true);
    const num = await fetchNextOrderNumber();
    setFormData({
      ...initialFormData,
      orderNumber: num,
      status_id: defaultStatusId,
    });
    setOrderList([]);
    resetCurrentItem();
    setTotalPrice(0);
    setHasUnsavedChanges(false);
    setHasEditChanges(false);
    setHasFormDataChanges(false);
    setHasItemsAdded(false);
    setHasItemFormChanges(false);
    setInitialFormDataSnapshot(null);
    setIsConfirmed(false); // Reset confirmed state
    setOrderNumberLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePrintReceipt();
  };

  // Pre-fill form with editing order data
  useEffect(() => {
    // Skip this effect if we're restoring data from print overlay
    if (isRestoringData) return;
    
    if (editingOrder && open && !loadingEmployees && !loadingAdmins) {
      console.log('editingOrder:', editingOrder);
      if ('order_items' in editingOrder && editingOrder.order_items) {
        console.log('order_items:', editingOrder.order_items);
      }
      setIsEditMode(true);
      setHasEditChanges(false);
      const newFormData = {
        orderNumber: (editingOrder as any).order_number || editingOrder.orderNumber || '',
        customer: editingOrder.customer_name || editingOrder.customer || '',
        customerId: (editingOrder as Order & { customer_id?: string }).customer_id || '',
        tanggal: safeDateString(editingOrder.date),
        waktu: (editingOrder as any).waktu || new Date().toTimeString().slice(0, 5),
        estimasi: editingOrder.estimatedDate || (editingOrder as any).estimasi || '',
        estimasiWaktu: (editingOrder as any).estimasi_waktu || '',
        outdoor: (editingOrder as any).outdoor || false,
        laserPrinting: (editingOrder as any).laser_printing || false,
        mugNota: (editingOrder as any).mug_nota || false,
        jasaDesain: (editingOrder as any).jasa_desain?.toString() || '0',
        biayaLain: (editingOrder as any).biaya_lain?.toString() || '0',
        subTotal: '',
        discount: (editingOrder as any).discount || 0,
        ppn: (editingOrder as any).ppn || 10,
        paymentType: (editingOrder as any).payment_type || '',
        bank: (editingOrder as any).bank || '',
        admin: (editingOrder as any).admin_id || '',
        desainer: (editingOrder as any).desainer_id || '',
        komputer: (editingOrder as any).komputer || '',
        notes: (editingOrder as any).notes || '',
        status_id: (editingOrder as any).status || editingOrder.status || null,
        downPayment: (editingOrder as any).down_payment || '',
        pelunasan: (editingOrder as any).pelunasan || '',
        taxChecked: (editingOrder as any).tax_checked || false,
      };
      
      setFormData(newFormData);
      // Simpan snapshot data awal untuk perbandingan
      setInitialFormDataSnapshot(newFormData);
      
      // Set order items if available
      if ('order_items' in editingOrder && editingOrder.order_items) {
        const realItems = (editingOrder.order_items as any[]).map((item, index) => ({
          id: (index + 1).toString().padStart(3, '0'),
          bahan: item.bahan,
          item: item.item_name,
          ukuran: { panjang: String(item.panjang), lebar: String(item.lebar) },
          quantity: item.quantity?.toString() || '',
          finishing: item.finishing,
          subTotal: item.sub_total || 0,
          notes: item.description || ''
        }));
        setOrderList(realItems);
      }
      
      // Reset item form tanpa mereset order list
      resetCurrentItem();
    } else if (!editingOrder && open) {
      // Reset form for new order
      setIsEditMode(false);
      setHasEditChanges(false);
      setHasItemsAdded(false);
      setHasItemFormChanges(false);
      setInitialFormDataSnapshot(null);
      setIsConfirmed(false); // Reset confirmed state for new order
      resetForm();
    }
  }, [editingOrder, open, loadingEmployees, loadingAdmins, isRestoringData]);

  // Set default status_id to 'Design' when statuses are loaded and not editing
  useEffect(() => {
    if (!editingOrder && statuses && statuses.length > 0 && open) {
      const designStatus = statuses.find(s => s.name.toLowerCase() === 'design');
      if (designStatus && formData.status_id !== designStatus.id) {
        setFormData(prev => ({ ...prev, status_id: designStatus.id }));
      }
    }
  }, [statuses, editingOrder, open]);

  // Fetch a new order number when opening the modal for a new order
  useEffect(() => {
    const fetchOrderNumber = async () => {
      setOrderNumberLoading(true);
      const num = await fetchNextOrderNumber();
      setFormData(prev => ({ ...prev, orderNumber: num }));
      setOrderNumberLoading(false);
    };
    if (open && !editingOrder) {
      fetchOrderNumber();
    }
  }, [open, editingOrder]);

  // Fungsi untuk update item saja, tanpa menutup modal utama
  const handleUpdateItem = () => {
    if (editingItemId && currentItem.item && currentItem.quantity && currentItem.bahan) {
      const subTotal = calculateItemSubTotal(currentItem);

      const updatedItem: OrderItem = {
        ...currentItem,
        id: editingItemId,
        subTotal
      };

      // Update item yang ada secara langsung tanpa mengubah urutan
      setOrderList(prev => 
        prev.map(item => item.id === editingItemId ? updatedItem : item)
      );
      resetCurrentItem();
      setHasEditChanges(true);
      // Tidak menutup modal utama
    }
  };

  useEffect(() => {
    if (!open) return;
    setLoadingEmployees(true);
    supabase
      .from('employees')
      .select('*')
      .eq('posisi', 'Desainer')
      .then(({ data, error }) => {
        if (!error && data) setEmployees(data as Employee[]);
        setLoadingEmployees(false);
      });
    setLoadingAdmins(true);
    supabase
      .from('employees')
      .select('*')
      .eq('posisi', 'Admin')
      .then(({ data, error }) => {
        if (!error && data) setAdmins(data as Employee[]);
        setLoadingAdmins(false);
      });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-7xl h-[95vh] max-h-[95vh] p-0 flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            {editingOrder
              ? `Edit Order${formData.orderNumber ? ` ${formData.orderNumber}` : ''}`
              : `Request Order${formData.orderNumber ? ` ${formData.orderNumber}` : ''}`}
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
                      isEditMode={isEditMode}
                    />
                    <ItemFormSection
                      currentItem={currentItem}
                      updateCurrentItem={updateCurrentItem}
                      resetCurrentItem={resetCurrentItem}
                      editingItemId={editingItemId}
                      onSave={handleSave}
                      onAddItem={addToOrderList}
                      onUpdateItem={handleUpdateItem}
                      isSaving={isCreatingOrder || isUpdatingOrder}
                      nextItemId={generateNextItemId()}
                      onOpenAddStockModal={() => setShowAddStockModal(true)}
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
                      editingItemId={editingItemId}
                    />
                    <ServiceCostSection
                      formData={formData}
                      totalPrice={totalPrice}
                      onFormDataChange={handleFormDataChange}
                      designers={employees}
                      loadingDesigners={loadingEmployees}
                      admins={admins}
                      loadingAdmins={loadingAdmins}
                    />
                  </div>
                </ScrollArea>

                <PriceSummarySection
                  formData={{
                    ...formData,
                    payment_method: formData.paymentType,
                    downPayment: formData.downPayment,
                    pelunasan: formData.pelunasan,
                    taxChecked: formData.taxChecked,
                  }}
                  totalPrice={totalPrice}
                  subtotal={orderList.reduce((sum, item) => sum + item.subTotal, 0)}
                  onFormDataChange={handleFormDataChange}
                />
              </div>
            </div>

            <OrderActionButtons
              onNew={resetForm}
              onSave={handleSave}
              onConfirm={handleConfirm}
              onSubmit={handlePrintReceipt}
              onPrintSPK={handlePrintSPK}
              isSaving={isCreatingOrder || isUpdatingOrder}
              hasUnsavedChanges={hasUnsavedChanges}
              disabledPrintSPK={!formData.admin || !formData.desainer}
              disabledSaveOrder={orderList.length === 0}
              isEditingItem={!!editingItemId}
              isEditMode={isEditMode}
              hasEditChanges={hasEditChanges || hasFormDataChanges || hasItemsAdded}
              isConfirmed={isConfirmed}
              hasPostConfirmationChanges={hasPostConfirmationChanges}
            >
              <div className="flex items-center gap-2 mr-2">
                {statusesLoading ? (
                  <span className="text-sm text-gray-500">Loading statuses...</span>
                ) : (
                  <Select
                    value={formData.status_id?.toString() || ''}
                    onValueChange={(value) => handleFormDataChange('status_id', value ? Number(value) : null)}
                  >
                    <SelectTrigger className="w-[140px] font-semibold">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </OrderActionButtons>
          </form>
        </div>
      </DialogContent>

      {/* Print Overlay */}
      <PrintOverlay
        isOpen={isPrintOverlayOpen}
        onClose={closePrintOverlay}
        onPrint={handlePrint}
        title={`Print ${printType.toUpperCase()}`}
        orderList={printData.orderList}
        orderData={printData.orderData}
        printType={printType}
        onCloseAndReopenRequestOrder={printType === 'spk' && onReopen ? () => {
          // Restore saved data and reopen Request Order modal
          if (tempFormData && tempOrderList) {
            console.log('Restoring data from print overlay:', { tempFormData, tempOrderList, tempEditingOrder, wasConfirmedBeforePrint });
            setIsRestoringData(true);
            
            // First, restore all the data states
            setFormData(tempFormData);
            setOrderList(tempOrderList);
            setIsConfirmed(wasConfirmedBeforePrint);
            
            // Clear temp data
            setTempFormData(null);
            setTempOrderList([]);
            
            // Wait for state to settle, then open modal
            setTimeout(() => {
              setIsRestoringData(false);
              console.log('Data restoration completed, confirmed state:', wasConfirmedBeforePrint);
              onReopen(tempEditingOrder);
            }, 50);
          } else {
            onReopen(tempEditingOrder);
          }
        } : undefined}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        onSuccess={() => {
          // Refresh materials data
          refetchMaterials();
        }}
      />
    </Dialog>
  );
};

export default RequestOrderModal;
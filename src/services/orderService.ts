import { supabase } from '@/integrations/supabase/client';

export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Use timestamp in milliseconds for better uniqueness
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  
  return `ORD${year}${month}${day}${timestamp}`;
};

export const calculateOrderTotal = (items: any[], jasaDesain: number = 0, biayaLain: number = 0, discount: number = 0, ppn: number = 10) => {
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

export const saveOrderToDatabase = async (orderData: any) => {
  try {
    console.log('Starting order save process with data:', orderData);
    
    const { items, ...orderFields } = orderData;
    
    // Calculate totals
    const totals = calculateOrderTotal(
      items,
      parseFloat(orderFields.jasaDesain) || 0,
      parseFloat(orderFields.biayaLain) || 0,
      orderFields.discount || 0,
      orderFields.ppn || 10
    );

    console.log('Calculated totals:', totals);

    // Prepare order data - match the actual database schema
    const order = {
      order_number: orderFields.orderNumber,
      customer_name: orderFields.customer,
      tanggal: orderFields.tanggal,
      waktu: orderFields.waktu || null,
      estimasi: orderFields.estimasi || null,
      estimasi_waktu: orderFields.estimasiWaktu || null,
      outdoor: orderFields.outdoor || false,
      laser_printing: orderFields.laserPrinting || false,
      mug_nota: orderFields.mugNota || false,
      jasa_desain: parseFloat(orderFields.jasaDesain) || 0,
      biaya_lain: parseFloat(orderFields.biayaLain) || 0,
      sub_total: totals.subtotal,
      discount: orderFields.discount || 0,
      ppn: orderFields.ppn || 10,
      total_amount: totals.total,
      payment_type: orderFields.paymentType || null,
      bank: orderFields.bank || null,
      admin_id: null,
      desainer_id: null,
      komputer: orderFields.komputer || null,
      notes: orderFields.notes || null,
      status: 'pending' as const
    };

    console.log('Prepared order data for database:', order);

    // Save order
    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderError) {
      console.error('Error saving order:', orderError);
      throw orderError;
    }

    console.log('Order saved successfully:', savedOrder);

    // Save order items if any
    if (items && items.length > 0) {
      console.log('Saving order items:', items);
      
      const orderItems = items.map((item: any) => ({
        order_id: savedOrder.id,
        item_id: item.id || null,
        bahan: item.bahan || null,
        item_name: item.item,
        panjang: parseFloat(item.ukuran?.panjang) || null,
        lebar: parseFloat(item.ukuran?.lebar) || null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0
      }));

      console.log('Prepared order items for database:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error saving order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items saved successfully');
    }

    return savedOrder;
  } catch (error) {
    console.error('Error saving order to database:', error);
    throw error;
  }
};
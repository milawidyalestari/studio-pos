import { supabase } from '@/integrations/supabase/client';

export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  
  // Generate a random alphanumeric string for better uniqueness
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `ORD${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${randomSuffix}`;
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

export const findExistingOrder = async (orderNumber: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error finding existing order:', error);
    return null;
  }
};

export const updateExistingOrder = async (orderId: number, orderData: any) => {
  try {
    console.log('Updating existing order with ID:', orderId, 'Data:', orderData);
    
    const { items, ...orderFields } = orderData;
    
    // Calculate totals
    const totals = calculateOrderTotal(
      items,
      parseFloat(orderFields.jasaDesain) || 0,
      parseFloat(orderFields.biayaLain) || 0,
      orderFields.discount || 0,
      orderFields.ppn || 10
    );

    console.log('Calculated totals for update:', totals);

    // Prepare order data - match the actual database schema
    const order = {
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
      komputer: orderFields.komputer || null,
      notes: orderFields.notes || null,
      updated_at: new Date().toISOString()
    };

    console.log('Prepared order data for update:', order);

    // Update order
    const { data: updatedOrder, error: orderError } = await supabase
      .from('orders')
      .update(order)
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      console.error('Error updating order:', orderError);
      throw orderError;
    }

    console.log('Order updated successfully:', updatedOrder);

    // Delete existing order items first
    const { error: deleteItemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteItemsError) {
      console.error('Error deleting existing order items:', deleteItemsError);
      throw deleteItemsError;
    }

    // Save new order items if any
    if (items && items.length > 0) {
      console.log('Saving updated order items:', items);
      
      const orderItems = items.map((item: any) => ({
        order_id: orderId,
        item_id: item.id || null,
        bahan: item.bahan || null,
        item_name: item.item,
        panjang: parseFloat(item.ukuran?.panjang) || null,
        lebar: parseFloat(item.ukuran?.lebar) || null,
        quantity: parseInt(item.quantity) || 0,
        finishing: item.finishing || null,
        sub_total: item.subTotal || 0
      }));

      console.log('Prepared order items for update:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error saving updated order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items updated successfully');
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error updating order in database:', error);
    throw error;
  }
};

export const createNewOrder = async (orderData: any) => {
  try {
    console.log('Creating new order with data:', orderData);
    
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
    console.error('Error creating new order:', error);
    throw error;
  }
};

export const saveOrderToDatabase = async (orderData: any) => {
  try {
    console.log('Starting order save/update process with data:', orderData);
    
    // Check if order with this number already exists
    const existingOrder = await findExistingOrder(orderData.orderNumber);
    
    if (existingOrder) {
      console.log('Found existing order, updating:', existingOrder);
      return await updateExistingOrder(existingOrder.id, orderData);
    } else {
      console.log('No existing order found, creating new one');
      return await createNewOrder(orderData);
    }
  } catch (error) {
    console.error('Error in saveOrderToDatabase:', error);
    throw error;
  }
};
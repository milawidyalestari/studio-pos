import { supabase } from '@/integrations/supabase/client';

// Tambahkan fungsi pembulatan custom
function customRounding(value: number): number {
  const ribuan = Math.floor(value / 1000) * 1000;
  const sisa = value - ribuan;
  if (sisa >= 1 && sisa <= 499) return ribuan;
  if (sisa === 500) return ribuan + 500;
  if (sisa >= 501 && sisa <= 999) return ribuan + 1000;
  return value; // Sudah bulat ribuan
}

// Fungsi untuk mengurangi stok bahan berdasarkan produk yang dipesan
const reduceMaterialStock = async (orderItems: any[]) => {
  try {
    console.log('Starting material stock reduction for order items:', orderItems);
    
    for (const item of orderItems) {
      // Cari produk berdasarkan item_name (kode produk)
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, kode, nama')
        .eq('kode', item.item_name)
        .single();
      
      if (productError || !product) {
        console.warn(`Product not found for item: ${item.item_name}`);
        continue;
      }
      
      // Cari bahan yang terkait dengan produk ini beserta quantity_per_unit
      const { data: productMaterials, error: materialsError } = await supabase
        .from('product_materials')
        .select('material_id, quantity_per_unit')
        .eq('product_id', product.id);
      
      if (materialsError) {
        console.error('Error fetching product materials:', materialsError);
        continue;
      }
      
      if (!productMaterials || productMaterials.length === 0) {
        console.log(`No materials found for product: ${product.nama}`);
        continue;
      }
      
      // Ambil detail bahan untuk setiap material_id
      for (const productMaterial of productMaterials) {
        const { data: material, error: materialError } = await supabase
          .from('materials')
          .select('id, kode, nama, stok_akhir, stok_aktif, stok_minimum, stok_keluar')
          .eq('id', productMaterial.material_id)
          .single();
        if (materialError || !material) {
          console.error(`Error fetching material ${productMaterial.material_id}:`, materialError);
          continue;
        }
        if (!material.stok_aktif) {
          console.log(`Material ${material.nama} is not active, skipping stock reduction`);
          continue;
        }
        // Hitung jumlah yang perlu dikurangi: quantity order × quantity_per_unit
        const orderQty = parseInt(item.quantity) || 0;
        const qtyPerUnit = productMaterial.quantity_per_unit > 0 ? productMaterial.quantity_per_unit : 1;
        const quantityToReduce = orderQty * qtyPerUnit;
        if (quantityToReduce <= 0) continue;
        const newStokKeluar = (material.stok_keluar || 0) + quantityToReduce;
        const newStokAkhir = (material.stok_akhir || 0) - quantityToReduce;
        const { error: updateError } = await supabase
          .from('materials')
          .update({
            stok_keluar: newStokKeluar,
            stok_akhir: newStokAkhir,
            updated_at: new Date().toISOString()
          })
          .eq('id', material.id);
        if (updateError) {
          console.error(`Error updating stock for material ${material.nama}:`, updateError);
          continue;
        }
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            material_id: material.id,
            tanggal: new Date().toISOString(),
            tipe_mutasi: 'penggunaan',
            jumlah: -quantityToReduce,
            keterangan: `Penggunaan untuk order: ${item.item_name} (${orderQty} unit × ${qtyPerUnit} bahan = ${quantityToReduce} total)`,
            user_id: null
          });
        if (movementError) {
          console.error(`Error recording inventory movement for material ${material.nama}:`, movementError);
        }
        console.log(`Successfully reduced stock for material ${material.nama}: ${quantityToReduce} units`);
        if (newStokAkhir <= material.stok_minimum) {
          console.warn(`Warning: Material ${material.nama} stock is at or below minimum (${newStokAkhir}/${material.stok_minimum})`);
        }
      }
    }
    
    console.log('Material stock reduction completed successfully');
  } catch (error) {
    console.error('Error in reduceMaterialStock:', error);
    throw error;
  }
};

// Fungsi untuk mengembalikan stok bahan ketika order dihapus atau diupdate
const restoreMaterialStock = async (orderItems: any[]) => {
  try {
    console.log('Starting material stock restoration for order items:', orderItems);
    
    for (const item of orderItems) {
      // Cari produk berdasarkan item_name (kode produk)
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, kode, nama')
        .eq('kode', item.item_name)
        .single();
      
      if (productError || !product) {
        console.warn(`Product not found for item: ${item.item_name}`);
        continue;
      }
      
      // Cari bahan yang terkait dengan produk ini beserta quantity_per_unit
      const { data: productMaterials, error: materialsError } = await supabase
        .from('product_materials')
        .select('material_id, quantity_per_unit')
        .eq('product_id', product.id);
      
      if (materialsError) {
        console.error('Error fetching product materials:', materialsError);
        continue;
      }
      
      if (!productMaterials || productMaterials.length === 0) {
        console.log(`No materials found for product: ${product.nama}`);
        continue;
      }
      
      // Ambil detail bahan untuk setiap material_id
      for (const productMaterial of productMaterials) {
        const { data: material, error: materialError } = await supabase
          .from('materials')
          .select('id, kode, nama, stok_akhir, stok_aktif, stok_minimum, stok_keluar')
          .eq('id', productMaterial.material_id)
          .single();
        
        if (materialError || !material) {
          console.error(`Error fetching material ${productMaterial.material_id}:`, materialError);
          continue;
        }
        
        // Hanya kembalikan stok jika bahan aktif
        if (!material.stok_aktif) {
          console.log(`Material ${material.nama} is not active, skipping stock restoration`);
          continue;
        }
        
        // Hitung jumlah yang perlu dikembalikan: quantity order × quantity_per_unit
        const orderQty = parseInt(item.quantity) || 0;
        const qtyPerUnit = productMaterial.quantity_per_unit > 0 ? productMaterial.quantity_per_unit : 1;
        const quantityToRestore = orderQty * qtyPerUnit;
        if (quantityToRestore <= 0) continue;
        
        // Update stok bahan
        const newStokKeluar = Math.max(0, (material.stok_keluar || 0) - quantityToRestore);
        const newStokAkhir = (material.stok_akhir || 0) + quantityToRestore;
        
        // Update stok di database
        const { error: updateError } = await supabase
          .from('materials')
          .update({
            stok_keluar: newStokKeluar,
            stok_akhir: newStokAkhir,
            updated_at: new Date().toISOString()
          })
          .eq('id', material.id);
        
        if (updateError) {
          console.error(`Error updating stock for material ${material.nama}:`, updateError);
          continue;
        }
        
        // Catat pergerakan stok di inventory_movements
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            material_id: material.id,
            tanggal: new Date().toISOString(),
            tipe_mutasi: 'pengembalian',
            jumlah: quantityToRestore, // Positif karena pengembalian
            keterangan: `Pengembalian stok untuk order: ${item.item_name} (${orderQty} unit × ${qtyPerUnit} bahan = ${quantityToRestore} total)`,
            user_id: null
          });
        
        if (movementError) {
          console.error(`Error recording inventory movement for material ${material.nama}:`, movementError);
        }
        
        console.log(`Successfully restored stock for material ${material.nama}: ${quantityToRestore} units`);
      }
    }
    
    console.log('Material stock restoration completed successfully');
  } catch (error) {
    console.error('Error in restoreMaterialStock:', error);
    throw error;
  }
};

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

export const calculateOrderTotal = (
  items: any[],
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

  // Terapkan pembulatan custom pada total
  total = customRounding(total);

  return {
    subtotal: itemsTotal,
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
      updated_at: new Date().toISOString(),
      status_id: orderFields.status_id || null,
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

    // Get existing order items before deleting them (for stock restoration)
    const { data: existingItems, error: fetchExistingError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (fetchExistingError) {
      console.error('Error fetching existing order items:', fetchExistingError);
      throw fetchExistingError;
    }

    // Restore material stock for existing items
    if (existingItems && existingItems.length > 0) {
      console.log('Restoring material stock for existing items:', existingItems);
      await restoreMaterialStock(existingItems);
    }

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

    // Reduce material stock for new items after updating order
    if (items && items.length > 0) {
      await reduceMaterialStock(items);
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
      updated_at: new Date().toISOString(),
      status_id: orderFields.status_id || null,
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

    // Reduce material stock after creating new order
    if (items && items.length > 0) {
      await reduceMaterialStock(items);
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

export const fetchNextOrderNumber = async () => {
  const { data, error } = await supabase.rpc('get_next_order_number');
  if (error) throw error;
  return data; // Pastikan data adalah nomor urut yang benar, misal: "ORD-00123"
};
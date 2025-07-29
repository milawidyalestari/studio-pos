
import { supabase } from '@/integrations/supabase/client';

// Fungsi untuk mengembalikan stok bahan ketika order dihapus
const restoreMaterialStock = async (orderItems: any[]) => {
  try {
    console.log('Starting material stock restoration for deleted order items:', orderItems);
    
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
      
      // Cari bahan yang terkait dengan produk ini
      const { data: productMaterials, error: materialsError } = await supabase
        .from('product_materials')
        .select('material_id')
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
        
        // Hitung jumlah yang perlu dikembalikan berdasarkan quantity order
        const quantityToRestore = parseInt(item.quantity) || 0;
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
            keterangan: `Pengembalian stok untuk order yang dihapus: ${item.item_name} (${quantityToRestore} unit)`,
            user_id: null
          });
        
        if (movementError) {
          console.error(`Error recording inventory movement for material ${material.nama}:`, movementError);
        }
        
        console.log(`Successfully restored stock for material ${material.nama}: ${quantityToRestore} units`);
      }
    }
    
    console.log('Material stock restoration for deleted order completed successfully');
  } catch (error) {
    console.error('Error in restoreMaterialStock:', error);
    throw error;
  }
};

export const deleteOrderFromDatabase = async (orderId: string) => {
  try {
    console.log('Deleting order from database:', orderId);
    
    // Get order items before deleting them (for stock restoration)
    const { data: orderItems, error: fetchItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (fetchItemsError) {
      console.error('Error fetching order items:', fetchItemsError);
      throw fetchItemsError;
    }

    // Restore material stock for order items
    if (orderItems && orderItems.length > 0) {
      console.log('Restoring material stock for order items:', orderItems);
      await restoreMaterialStock(orderItems);
    }
    
    // First delete order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw itemsError;
    }

    // Then delete the order
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Database error deleting order:', error);
      throw error;
    }

    console.log('Order deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting order from database:', error);
    throw error;
  }
};

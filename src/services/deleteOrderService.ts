
import { databaseService } from '@/services/databaseService';

// Fungsi untuk mengembalikan stok bahan ketika order dihapus
const restoreMaterialStock = async (orderItems: any[]) => {
  try {
    console.log('Starting material stock restoration for deleted order items:', orderItems);
    
    for (const item of orderItems) {
      // Cari produk berdasarkan item_name (kode produk)
      const products = await databaseService.query('products', {
        where: { kode: item.item_name }
      });
      
      const product = products[0];
      if (!product) {
        console.warn(`Product not found for item: ${item.item_name}`);
        continue;
      }
      
      // Cari bahan yang terkait dengan produk ini
      const productMaterials = await databaseService.query('product_materials', {
        where: { product_id: (product as any).id }
      });
      
      if (!productMaterials || productMaterials.length === 0) {
        console.log(`No materials found for product: ${(product as any).nama}`);
        continue;
      }
      
      // Ambil detail bahan untuk setiap material_id
      for (const productMaterial of productMaterials) {
        const materials = await databaseService.query('materials', {
          where: { id: (productMaterial as any).material_id }
        });
        
        const material = materials[0];
        if (!material) {
          console.error(`Error fetching material ${(productMaterial as any).material_id}`);
          continue;
        }
        
        // Hanya kembalikan stok jika bahan aktif
        if (!(material as any).stok_aktif) {
          console.log(`Material ${(material as any).nama} is not active, skipping stock restoration`);
          continue;
        }
        
        // Hitung jumlah yang perlu dikembalikan berdasarkan quantity order
        const quantityToRestore = parseInt(item.quantity) || 0;
        if (quantityToRestore <= 0) continue;
        
        // Update stok bahan
        const newStokKeluar = Math.max(0, ((material as any).stok_keluar || 0) - quantityToRestore);
        const newStokAkhir = ((material as any).stok_akhir || 0) + quantityToRestore;
        
        // Update stok di database
        await databaseService.update('materials', (material as any).id, {
          stok_keluar: newStokKeluar,
          stok_akhir: newStokAkhir
        });
        
        // Catat pergerakan stok di inventory_movements
        await databaseService.create('inventory_movements', {
          material_id: (material as any).id,
          tanggal: new Date().toISOString(),
          tipe_mutasi: 'pengembalian',
          jumlah: quantityToRestore,
          keterangan: `Pengembalian stok untuk order yang dihapus: ${item.item_name} (${quantityToRestore} unit)`,
          user_id: null
        } as any);
        
        console.log(`Successfully restored stock for material ${(material as any).nama}: ${quantityToRestore} units`);
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
    
    // 1. Hapus notifikasi yang terkait dengan order ini terlebih dahulu
    try {
      const notifications = await databaseService.query('notifications', {
        where: { order_id: orderId }
      });
      
      for (const notification of notifications) {
        await databaseService.delete('notifications', (notification as any).id);
      }
      console.log(`Deleted ${notifications.length} notifications for order ${orderId}`);
    } catch (notifError) {
      console.warn('Error deleting notifications, continuing with order deletion:', notifError);
    }
    
    // 2. Dapatkan order items sebelum dihapus (untuk restore stok)
    const orderItems = await databaseService.query('order_items', {
      where: { order_id: orderId }
    });

    // 3. Kembalikan stok bahan untuk order items
    if (orderItems && orderItems.length > 0) {
      console.log('Restoring material stock for order items:', orderItems);
      await restoreMaterialStock(orderItems);
    }
    
    // 4. Hapus order items
    for (const item of orderItems) {
      await databaseService.delete('order_items', (item as any).id);
    }

    // 5. Terakhir, hapus order
    await databaseService.delete('orders', orderId);

    console.log('Order deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order from database:', error);
    throw error;
  }
};

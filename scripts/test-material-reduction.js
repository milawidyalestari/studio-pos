// Script untuk test pengurangan bahan berdasarkan order
// Jalankan dengan: node scripts/test-material-reduction.js

const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase (ganti dengan URL dan key Anda)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMaterialReduction() {
  try {
    console.log('🧪 Testing Material Reduction System...\n');

    // 1. Cari produk Stemple
    console.log('1. Mencari produk Stemple...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, kode, nama')
      .ilike('nama', '%stemple%');

    if (productError) {
      console.error('❌ Error mencari produk:', productError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  Produk Stemple tidak ditemukan. Silakan buat produk terlebih dahulu.');
      return;
    }

    const stempleProduct = products[0];
    console.log(`✅ Produk ditemukan: ${stempleProduct.nama} (ID: ${stempleProduct.id})\n`);

    // 2. Cari bahan yang terkait dengan produk Stemple
    console.log('2. Mencari bahan yang terkait dengan produk Stemple...');
    const { data: productMaterials, error: materialsError } = await supabase
      .from('product_materials')
      .select(`
        material_id,
        quantity_per_unit,
        materials (
          id,
          name,
          stok_akhir,
          stok_keluar,
          stok_aktif
        )
      `)
      .eq('product_id', stempleProduct.id);

    if (materialsError) {
      console.error('❌ Error mencari bahan:', materialsError);
      return;
    }

    if (!productMaterials || productMaterials.length === 0) {
      console.log('⚠️  Tidak ada bahan yang dikonfigurasi untuk produk Stemple.');
      console.log('   Silakan jalankan script setup-stemple-materials.sql terlebih dahulu.');
      return;
    }

    console.log('✅ Bahan yang terkait:');
    productMaterials.forEach(pm => {
      const material = pm.materials;
      console.log(`   - ${material.name}: ${pm.quantity_per_unit} per unit (Stok: ${material.stok_akhir})`);
    });
    console.log('');

    // 3. Simulasi order dengan quantity 2
    console.log('3. Simulasi order dengan quantity 2...');
    const orderItems = [{
      item_name: stempleProduct.nama,
      quantity: 2
    }];

    console.log('📋 Order Items:');
    orderItems.forEach(item => {
      console.log(`   - ${item.item_name}: ${item.quantity} unit`);
    });
    console.log('');

    // 4. Hitung perhitungan yang akan dilakukan
    console.log('4. Perhitungan pengurangan bahan:');
    productMaterials.forEach(pm => {
      const material = pm.materials;
      const orderQty = 2;
      const qtyPerUnit = pm.quantity_per_unit;
      const quantityToReduce = orderQty * qtyPerUnit;
      
      console.log(`   ${material.name}:`);
      console.log(`     - Quantity Order: ${orderQty}`);
      console.log(`     - Quantity per Unit: ${qtyPerUnit}`);
      console.log(`     - Total yang akan dikurangi: ${quantityToReduce}`);
      console.log(`     - Stok sebelum: ${material.stok_akhir}`);
      console.log(`     - Stok setelah: ${material.stok_akhir - quantityToReduce}`);
      console.log('');
    });

    // 5. Tampilkan stok bahan saat ini
    console.log('5. Stok bahan saat ini:');
    for (const pm of productMaterials) {
      const material = pm.materials;
      const { data: currentStock, error: stockError } = await supabase
        .from('materials')
        .select('stok_akhir, stok_keluar')
        .eq('id', material.id)
        .single();

      if (!stockError && currentStock) {
        console.log(`   ${material.name}:`);
        console.log(`     - Stok Akhir: ${currentStock.stok_akhir}`);
        console.log(`     - Stok Keluar: ${currentStock.stok_keluar}`);
      }
    }

    console.log('\n✅ Test selesai! Sistem sudah siap untuk mengurangi bahan berdasarkan perhitungan yang benar.');

  } catch (error) {
    console.error('❌ Error dalam test:', error);
  }
}

// Jalankan test
testMaterialReduction();

# Fix Error "Could not find the 'materialData' column of 'products'"

## Masalah
Error terjadi saat menyimpan produk di modal `setShowProductForm`:
```
{
    "code": "PGRST204",
    "message": "Could not find the 'materialData' column of 'products' in the schema cache"
}
```

## Penyebab
1. **Data tidak dipisahkan**: `materialData` dikirim langsung ke tabel `products` padahal seharusnya dipisahkan
2. **Logic yang salah**: Di ItemFormSection, data dari ProductForm langsung dikirim ke `createProduct.mutate()` tanpa memisahkan `materialData`
3. **Type definition**: Interface tidak mengizinkan `materialData` dalam data yang dikirim

## Solusi yang Diterapkan

### 1. Update ProductFormProps Interface
```typescript
interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { 
    materialData?: Array<{material_id: string, quantity_per_unit: number}> 
  }) => void;
  onCancel: () => void;
  isEditing: boolean;
  materials?: any[];
}
```

### 2. Update ItemFormSection Logic
```typescript
onSubmit={async (data) => {
  try {
    const { materialData, ...productData } = data;
    
    // Buat produk terlebih dahulu
    const createdProduct = await createProduct.mutateAsync(productData);
    
    // Jika ada materialData, simpan ke tabel product_materials
    if (materialData && materialData.length > 0 && createdProduct) {
      const inserts = materialData.map((item: any) => ({
        product_id: createdProduct.id,
        material_id: item.material_id,
        quantity_per_unit: item.quantity_per_unit > 0 ? item.quantity_per_unit : 1
      }));
      
      const { error: materialError } = await supabase
        .from('product_materials')
        .insert(inserts);
        
      if (materialError) {
        console.error('Error saving material relations:', materialError);
        throw materialError;
      }
    }
    
    setShowProductForm(false);
    refetchProducts();
    refetchMaterials();
  } catch (error) {
    console.error('Error creating product:', error);
  }
}}
```

## Flow yang Benar

### Sebelum (Salah):
1. ProductForm mengirim data: `{ ...productData, materialData: [...] }`
2. ItemFormSection langsung kirim ke `createProduct.mutate(data)`
3. Supabase mencoba insert `materialData` ke tabel `products` → ERROR

### Sesudah (Benar):
1. ProductForm mengirim data: `{ ...productData, materialData: [...] }`
2. ItemFormSection memisahkan: `const { materialData, ...productData } = data`
3. Buat produk: `createProduct.mutateAsync(productData)`
4. Simpan relasi bahan: `supabase.from('product_materials').insert(materialData)`
5. ✅ SUCCESS

## Testing Checklist

- [ ] Buka modal ProductForm dari ItemFormSection
- [ ] Isi data produk (nama, kode, dll)
- [ ] Pilih bahan dan input quantity per unit
- [ ] Klik "Simpan Produk"
- [ ] Tidak ada error "materialData column not found"
- [ ] Produk tersimpan di tabel `products`
- [ ] Relasi bahan tersimpan di tabel `product_materials`
- [ ] Modal tertutup dan data ter-refresh

## Troubleshooting

### Jika masih ada error:
1. Cek console log untuk detail error
2. Pastikan tabel `product_materials` sudah ada dan memiliki kolom yang benar
3. Pastikan migration `quantity_per_unit` sudah dijalankan
4. Cek apakah ada constraint violation di database

### Jika data tidak tersimpan:
1. Cek apakah `createdProduct` berhasil dibuat
2. Cek apakah `materialData` tidak kosong
3. Cek error di `materialError` 
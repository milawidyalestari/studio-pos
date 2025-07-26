# Perbaikan Masalah Pemilihan Bahan di ProductForm

## Masalah yang Ditemukan

Pada modal Edit Produk di Master Data, pemilihan bahan (materials) tidak mengirim ID ke tabel `product_materials` di database ketika user memilih satu atau beberapa bahan.

## Analisis Masalah

### 1. Masalah di ProductForm.tsx
- `handleSubmit` tidak mengirim `selectedMaterials` sebagai `materialIds`
- Data yang dikirim hanya berisi `bahan_id` (single value) bukan array dari bahan yang dipilih
- `selectedMaterials` tidak diinisialisasi dengan benar saat editing

### 2. Masalah di MasterData.tsx
- `handleProductFormSubmit` mengharapkan `materialIds` dari data yang dikirim
- Tetapi ProductForm tidak mengirim `materialIds`

## Solusi yang Diimplementasikan

### 1. Perbaikan di ProductForm.tsx

#### A. Perbaikan handleSubmit
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (validateForm()) {
    const materialIds = selectedMaterials.map((material: any) => material.value);
    console.log('Submitting form with materialIds:', materialIds);
    
    const submitData = {
      ...formData,
      category_id: !formData.category_id || formData.category_id === 'no-category' ? null : formData.category_id,
      bahan_id: !formData.bahan_id ? null : formData.bahan_id,
      // Tambahkan materialIds dari selectedMaterials
      materialIds: materialIds
    };
    
    // Hapus property yang nilainya string kosong
    Object.keys(submitData).forEach(
      (key) => (submitData[key] === '' || submitData[key] === undefined) && delete submitData[key]
    );
    
    console.log('Final submitData:', submitData);
    onSubmit(submitData);
  }
};
```

#### B. Perbaikan Inisialisasi selectedMaterials
```typescript
// Inisialisasi selectedMaterials dari initialMaterials (untuk editing)
useEffect(() => {
  if (isEditing && initialMaterials.length > 0 && materials.length > 0) {
    const selectedMats = initialMaterials
      .map(id => {
        const mat = materials.find((m: any) => m.id === id);
        return mat ? { value: mat.id, label: mat.nama } : null;
      })
      .filter(Boolean);
    setSelectedMaterials(selectedMats);
    console.log('Initialized selectedMaterials for editing:', selectedMats);
  } else if (!isEditing) {
    // Reset untuk produk baru
    setSelectedMaterials([]);
  }
}, [isEditing, initialMaterials, materials]);
```

#### C. Perbaikan handleMaterialsChange
```typescript
const handleMaterialsChange = (newValue: any, _actionMeta: any) => {
  const materialsArray = Array.isArray(newValue) ? Array.from(newValue) : [];
  setSelectedMaterials(materialsArray);
  console.log('Materials changed:', materialsArray);
};
```

### 2. Perbaikan di MasterData.tsx

#### A. Penambahan Logging untuk Debugging
```typescript
const handleProductFormSubmit = async (data: any) => {
  console.log('Received data from ProductForm:', data);
  const { materialIds, ...productData } = data;
  console.log('Extracted materialIds:', materialIds);
  console.log('Product data:', productData);
  
  try {
    let productId = editingProduct?.id;
    if (editingProduct) {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        ...productData
      });
    } else {
      const created = await createProductMutation.mutateAsync(productData);
      productId = created.id;
    }
    
    console.log('Product saved with ID:', productId);
    
    // Update relasi product_materials
    if (productId && Array.isArray(materialIds)) {
      console.log('Processing materialIds:', materialIds);
      // Hapus semua relasi lama
      await supabase.from('product_materials').delete().eq('product_id', productId);
      console.log('Deleted old product_materials relations');
      
      // Insert relasi baru
      if (materialIds.length > 0) {
        const inserts = materialIds.map((material_id: string) => ({ product_id: productId, material_id }));
        console.log('Inserting new product_materials relations:', inserts);
        await supabase.from('product_materials').insert(inserts);
        console.log('Successfully inserted product_materials relations');
      }
    } else {
      console.log('No materialIds to process or productId not found');
    }
    
    // ... rest of the code
  } catch (error) {
    console.error('Error saving product:', error);
    // ... error handling
  }
};
```

## Cara Kerja yang Benar

### 1. Saat Membuat Produk Baru
1. User membuka form produk baru
2. User memilih bahan dari dropdown multi-select
3. `selectedMaterials` state diupdate dengan bahan yang dipilih
4. Saat submit, `materialIds` dikirim bersama data produk
5. Produk disimpan, kemudian relasi `product_materials` dibuat

### 2. Saat Edit Produk
1. User membuka form edit produk
2. `initialMaterials` digunakan untuk menginisialisasi `selectedMaterials`
3. User dapat menambah/hapus bahan dari dropdown
4. Saat submit, `materialIds` dikirim bersama data produk
5. Produk diupdate, relasi lama dihapus, relasi baru dibuat

## Testing Checklist

### 1. Test Membuat Produk Baru
- [ ] Buka form produk baru
- [ ] Pilih beberapa bahan dari dropdown
- [ ] Submit form
- [ ] Verifikasi produk tersimpan
- [ ] Verifikasi relasi `product_materials` dibuat di database
- [ ] Cek console log untuk konfirmasi

### 2. Test Edit Produk
- [ ] Buka form edit produk yang sudah ada bahan
- [ ] Verifikasi bahan lama terpilih di dropdown
- [ ] Tambah/hapus bahan
- [ ] Submit form
- [ ] Verifikasi produk terupdate
- [ ] Verifikasi relasi `product_materials` terupdate di database
- [ ] Cek console log untuk konfirmasi

### 3. Test Edge Cases
- [ ] Produk tanpa bahan (materialIds kosong)
- [ ] Produk dengan satu bahan
- [ ] Produk dengan banyak bahan
- [ ] Hapus semua bahan (set materialIds ke array kosong)

## Debugging

### Console Log yang Diharapkan

#### Saat Membuat Produk Baru
```
Materials changed: [{value: "mat-001", label: "Kertas A4"}, {value: "mat-002", label: "Tinta Hitam"}]
Submitting form with materialIds: ["mat-001", "mat-002"]
Final submitData: {kode: "PRD0001", nama: "Print A4", materialIds: ["mat-001", "mat-002"], ...}
Received data from ProductForm: {kode: "PRD0001", nama: "Print A4", materialIds: ["mat-001", "mat-002"], ...}
Extracted materialIds: ["mat-001", "mat-002"]
Product saved with ID: "prod-123"
Processing materialIds: ["mat-001", "mat-002"]
Deleted old product_materials relations
Inserting new product_materials relations: [{product_id: "prod-123", material_id: "mat-001"}, {product_id: "prod-123", material_id: "mat-002"}]
Successfully inserted product_materials relations
```

#### Saat Edit Produk
```
Initialized selectedMaterials for editing: [{value: "mat-001", label: "Kertas A4"}]
Materials changed: [{value: "mat-001", label: "Kertas A4"}, {value: "mat-003", label: "Tinta Warna"}]
Submitting form with materialIds: ["mat-001", "mat-003"]
...
```

## Troubleshooting

### 1. Bahan Tidak Terpilih Saat Edit
- Cek apakah `initialMaterials` dikirim dengan benar dari MasterData
- Cek apakah `materials` data sudah ter-load
- Cek console log "Initialized selectedMaterials for editing"

### 2. Bahan Tidak Tersimpan ke Database
- Cek console log "Submitting form with materialIds"
- Cek console log "Extracted materialIds"
- Cek console log "Processing materialIds"
- Cek apakah ada error di database

### 3. Dropdown Bahan Tidak Muncul
- Cek apakah query materials berhasil
- Cek apakah ada error di `materialsLoading` atau `materialsError`

## Catatan Penting

1. **Data Flow**: `selectedMaterials` → `materialIds` → `product_materials` table
2. **Format Data**: React-Select menggunakan format `{value: id, label: nama}`
3. **Database**: Tabel `product_materials` menyimpan relasi many-to-many
4. **Logging**: Semua operasi dicatat di console untuk debugging
5. **Error Handling**: Setiap operasi database memiliki error handling 
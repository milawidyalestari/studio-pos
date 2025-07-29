# Fix Masalah Pemilihan Bahan di ProductForm Modal

## Masalah
Pada modal `setShowProductForm` di ItemFormSection, bagian "Pilih bahan" tidak bisa dipilih.

## Penyebab
1. ProductForm menggunakan query internal untuk materials, bukan data dari prop `materials`
2. Format data materials dari ItemFormSection berbeda dengan yang diharapkan ProductForm
3. Prop `initialMaterialData` tidak dikirim ke ProductForm

## Solusi yang Sudah Diterapkan

### 1. Update ProductForm.tsx
- ✅ Menambahkan prop `initialMaterialData` ke ProductForm
- ✅ Menggunakan `materialsProp` jika tersedia, jika tidak gunakan query internal
- ✅ Memperbaiki format options untuk ReactSelect agar kompatibel dengan berbagai format data
- ✅ Menambahkan logging untuk debug

### 2. Update ItemFormSection.tsx
- ✅ Menambahkan prop `initialMaterialData={[]}` ke ProductForm

## Perubahan Kode

### ProductForm.tsx
```typescript
// Gunakan materialsProp jika tersedia, jika tidak gunakan data dari query
const materials = materialsProp && materialsProp.length > 0 ? materialsProp : materialsFromQuery;

// ReactSelect options yang lebih fleksibel
options={materials.map((mat: any) => ({ 
  value: mat.id, 
  label: mat.nama || mat.name || `${mat.kode} - ${mat.nama}` 
}))}
```

### ItemFormSection.tsx
```typescript
<ProductForm
  initialData={null}
  initialMaterials={[]}
  initialMaterialData={[]} // ✅ Ditambahkan
  isEditing={false}
  materials={materials}
  // ... rest of props
/>
```

## Testing Checklist

- [ ] Buka modal ProductForm dari ItemFormSection
- [ ] Cek console log untuk data materials
- [ ] Test pemilihan bahan dari dropdown
- [ ] Test input quantity per unit
- [ ] Test submit form

## Debug Steps

1. **Buka Developer Tools** → Console
2. **Buka modal ProductForm**
3. **Cek log berikut**:
   ```
   ProductForm - Materials data: [...]
   ProductForm - Materials loading: false
   ProductForm - Materials error: null
   ProductForm - MaterialsProp: [...]
   ```

## Troubleshooting

### Jika materials masih kosong:
- Cek apakah query materials di ItemFormSection berhasil
- Cek apakah ada error di console
- Pastikan tabel materials ada data

### Jika dropdown tidak muncul:
- Cek format data materials (harus ada `id` dan `nama`)
- Cek apakah ReactSelect options ter-generate dengan benar

### Jika tidak bisa select:
- Cek apakah ada error di handleMaterialsChange
- Cek apakah selectedMaterials state ter-update

## Format Data yang Diharapkan

Materials harus memiliki minimal field:
```typescript
{
  id: string | number,
  nama: string,
  // optional: kode, name, dll
}
``` 
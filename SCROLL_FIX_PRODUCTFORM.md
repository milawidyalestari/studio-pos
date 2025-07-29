# Fix Masalah Scroll di ProductForm

## Masalah
Pada modal `setShowProductForm`, ketika user scroll ke bawah pada list bahan, posisi scroll kembali ke posisi awal (bagian atas).

## Penyebab
1. **CustomMenuList component** yang kompleks dengan useEffect yang memiliki dependency `props.children`
2. **Re-render yang tidak perlu** menyebabkan scroll position ter-reset
3. **State changes** yang memicu re-render komponen

## Solusi yang Diterapkan

### 1. Menghapus CustomMenuList
- ✅ Hapus komponen `CustomMenuList` yang kompleks
- ✅ Gunakan menuList default ReactSelect
- ✅ Tambahkan props untuk mencegah scroll reset:
  - `menuShouldScrollIntoView={false}`
  - `closeMenuOnScroll={false}`

### 2. Optimasi ReactSelect
```typescript
<ReactSelect
  ref={selectRef}
  isMulti
  isLoading={materialsLoading}
  options={materials.map((mat: any) => ({ 
    value: mat.id, 
    label: mat.nama || mat.name || `${mat.kode} - ${mat.nama}` 
  }))}
  value={selectedMaterials}
  onChange={handleMaterialsChange}
  placeholder="Pilih bahan"
  classNamePrefix="bahan-grid"
  styles={styles}
  menuPlacement="top"
  menuShouldScrollIntoView={false}  // ✅ Mencegah scroll reset
  closeMenuOnScroll={false}         // ✅ Mencegah menu tertutup saat scroll
/>
```

### 3. Cleanup Imports
- ✅ Hapus import `ChevronDown`, `ChevronUp` yang tidak digunakan
- ✅ Hapus import `components` dari react-select
- ✅ Hapus komponen CustomMenuList yang tidak digunakan

## Hasil
- ✅ Scroll position tidak ter-reset saat user scroll ke bawah
- ✅ Menu list tetap terbuka saat scroll
- ✅ Performa lebih baik karena tidak ada re-render yang tidak perlu
- ✅ Kode lebih sederhana dan mudah maintain

## Testing
1. Buka modal ProductForm
2. Klik dropdown "Pilih bahan"
3. Scroll ke bawah list bahan
4. Posisi scroll tidak boleh kembali ke atas
5. Menu tidak boleh tertutup saat scroll

## Alternatif Solusi (Jika Masih Ada Masalah)
Jika masih ada masalah scroll, bisa mencoba:
1. Tambahkan `menuPosition="fixed"` pada ReactSelect
2. Gunakan `menuPortalTarget={document.body}` untuk render menu di body
3. Tambahkan `maxMenuHeight={300}` untuk membatasi tinggi menu 
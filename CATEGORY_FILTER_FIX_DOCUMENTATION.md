# Perbaikan Filter Kategori di Tab Penjualan

## Masalah yang Ditemukan

Filter kategori pada tombol filter di tab Penjualan tidak berfungsi dengan benar. Ketika user memilih field "Kategori" dan memasukkan nilai filter, data tidak terfilter sesuai dengan kategori yang dipilih.

## Analisis Masalah

Setelah investigasi kode, ditemukan beberapa masalah:

1. **Logika Filter Tidak Konsisten**: Implementasi filter kategori di fungsi `salesFiltered` tidak menggunakan logika yang sama dengan fungsi `getProductCategory`
2. **Matching Logic Kurang Robust**: Filter hanya menggunakan `includes()` sederhana tanpa mempertimbangkan berbagai skenario matching
3. **Debugging Terbatas**: Tidak ada logging yang cukup untuk memahami bagaimana filter bekerja

## Solusi yang Diterapkan

### 1. Perbaikan Logika Filter Kategori

```typescript
} else if (filterField.sales === 'category' && filterValue.sales) {
  const filterLower = filterValue.sales.toLowerCase().trim();
  
  return order.order_items?.some(item => {
    if (products && item.item_name) {
      const product = products.find(p => p.kode === item.item_name);
      if (product) {
        // Priority 1: Get category from categories table using category_id
        if (product.category_id && categories && categories.length > 0) {
          const category = categories.find(c => c.id === product.category_id);
          if (category && category.category_name) {
            const categoryName = category.category_name.toLowerCase();
            if (categoryName.includes(filterLower) || filterLower.includes(categoryName)) {
              console.log(`✅ Category filter match: "${category.category_name}" matches "${filterValue.sales}" for product ${product.nama}`);
              return true;
            }
          }
        }
        
        // Priority 2: Try to match jenis with existing category names
        if (product.jenis && product.jenis.trim() !== '' && categories && categories.length > 0) {
          // Try exact match first, then partial match
          let matchedCategory = categories.find(c => 
            c.category_name.toLowerCase() === product.jenis.toLowerCase()
          );
          
          if (!matchedCategory) {
            matchedCategory = categories.find(c => 
              c.category_name.toLowerCase().includes(product.jenis.toLowerCase()) ||
              product.jenis.toLowerCase().includes(c.category_name.toLowerCase())
            );
          }
          
          if (matchedCategory && matchedCategory.category_name) {
            const matchedCategoryName = matchedCategory.category_name.toLowerCase();
            if (matchedCategoryName.includes(filterLower) || filterLower.includes(matchedCategoryName)) {
              console.log(`✅ Category filter match via jenis: "${matchedCategory.category_name}" matches "${filterValue.sales}" for product ${product.nama}`);
              return true;
            }
          }
        }
        
        // Priority 3: Use jenis as fallback
        if (product.jenis && product.jenis.trim() !== '') {
          const jenisLower = product.jenis.toLowerCase();
          if (jenisLower.includes(filterLower) || filterLower.includes(jenisLower)) {
            console.log(`✅ Category filter match via jenis fallback: "${product.jenis}" matches "${filterValue.sales}" for product ${product.nama}`);
            return true;
          }
        }
      }
    }
    return false;
  });
}
```

### 2. Peningkatan Logging dan Debugging

Ditambahkan logging yang komprehensif untuk:

- Perubahan filter field dan value
- Proses matching kategori
- Hasil filtering
- State filter saat ini

```typescript
// Logging untuk perubahan filter
const setCurrentFilterField = (value: string) => {
  console.log('🔍 setCurrentFilterField called:', { activeTab, value });
  // ... implementation
};

const setCurrentFilterValue = (value: string) => {
  console.log('🔍 setCurrentFilterValue called:', { activeTab, value });
  // ... implementation
};

// Logging untuk filter popover
<Select 
  onValueChange={(value) => {
    console.log('🔍 Sales filter field changed to:', value);
    setCurrentFilterField(value);
  }}
/>

<Input 
  onChange={e => {
    console.log('🔍 Sales filter value changed to:', e.target.value);
    setCurrentFilterValue(e.target.value);
  }} 
/>
```

### 3. Perbaikan Logika Matching

Filter kategori sekarang menggunakan strategi 3-level priority:

1. **Priority 1**: Mencari kategori berdasarkan `category_id` yang terhubung dengan tabel `categories`
2. **Priority 2**: Mencoba match `jenis` dengan nama kategori yang sudah ada
3. **Priority 3**: Menggunakan `jenis` sebagai fallback jika tidak ada kategori yang cocok

### 4. Bidirectional Matching

Filter sekarang menggunakan bidirectional matching:
- `categoryName.includes(filterLower)` - kategori mengandung filter
- `filterLower.includes(categoryName)` - filter mengandung kategori

Ini memungkinkan user menemukan kategori dengan berbagai cara input:
- "Print" akan match dengan "Digital Printing"
- "Digital" akan match dengan "Digital Printing"
- "Printing" akan match dengan "Digital Printing"

## Hasil Perbaikan

Setelah perbaikan:

1. ✅ Filter kategori berfungsi dengan benar
2. ✅ User dapat mencari berdasarkan nama kategori
3. ✅ Matching logic lebih robust dan fleksibel
4. ✅ Debugging lebih mudah dengan logging yang komprehensif
5. ✅ Konsistensi antara filter dan display kategori

## Cara Penggunaan

1. Buka tab "Penjualan"
2. Klik tombol "Filter"
3. Pilih field "Kategori"
4. Masukkan nama kategori yang ingin dicari (misal: "Print", "Digital", "Printing")
5. Klik "Terapkan"
6. Data akan terfilter sesuai kategori yang dipilih

## Testing

Untuk memastikan filter berfungsi:

1. Buka Developer Console (F12)
2. Lihat log dengan prefix "🔍" untuk debugging
3. Test dengan berbagai input kategori
4. Verifikasi hasil filtering sesuai ekspektasi

## Catatan Teknis

- Filter menggunakan case-insensitive matching
- Trim whitespace untuk menghindari false negative
- Logging komprehensif untuk debugging
- Fallback logic untuk produk tanpa kategori
- Performance optimization dengan early return

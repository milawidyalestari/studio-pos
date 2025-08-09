# Fitur Tanggal Pembuatan Order

## Deskripsi
Fitur ini menampilkan tanggal pembuatan order saat dalam mode edit, menggantikan input tanggal yang dapat diedit dengan tampilan tanggal pembuatan yang read-only.

## Perilaku

### Mode Edit Order
- **Label**: "Tanggal Dibuat" (bukan "Tanggal Order")
- **Tampilan**: Text field dengan background abu-abu (read-only)
- **Format**: "19 Desember 2024" (format Indonesia)
- **Kondisi**: Hanya muncul saat `isEditMode = true` dan data `createdAt` tersedia

### Mode Order Baru
- **Label**: "Tanggal Order"
- **Tampilan**: Input date yang dapat diedit
- **Format**: Date picker standar
- **Kondisi**: Selalu muncul untuk order baru

## Implementasi Teknis

### 1. Interface Update
```typescript
interface CustomerInfoSectionProps {
  formData: {
    // ... existing fields
    createdAt?: string; // Tanggal pembuatan order
  };
  // ... other props
}
```

### 2. Conditional Rendering
```typescript
<Label htmlFor="tanggal" className="text-sm font-medium">
  {isEditMode ? 'Tanggal Dibuat' : 'Tanggal Order'}
</Label>
{isEditMode && formData.createdAt ? (
  <div className="mt-1 h-8 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm flex items-center">
    {new Date(formData.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
  </div>
) : (
  <Input
    id="tanggal"
    type="date"
    value={formData.tanggal}
    onChange={(e) => onFormDataChange('tanggal', e.target.value)}
    className="mt-1 h-8 pl-2"
  />
)}
```

### 3. Data Mapping
```typescript
// Di RequestOrderModal.tsx
const newFormData = {
  // ... existing fields
  createdAt: (editingOrder as any).created_at || (editingOrder as any).createdAt || undefined,
};
```

## Database Schema
```sql
CREATE TABLE public.orders (
  -- ... other fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- ... other fields
);
```

## Contoh Penggunaan

### Saat Edit Order
```
Tanggal Dibuat: 19 Desember 2024
```

### Saat Order Baru
```
Tanggal Order: [Date Picker]
```

## Keuntungan
1. **Kejelasan**: User dapat melihat kapan order dibuat
2. **Konsistensi**: Tanggal pembuatan tidak dapat diubah
3. **UX**: Tampilan yang jelas membedakan data yang dapat diedit
4. **Lokalitas**: Format tanggal Indonesia yang mudah dibaca 
# Pengaturan Upload Image Stempel "Lunas" - Simplified Version

## Overview Perubahan

Interface pengaturan stempel telah disederhanakan sesuai permintaan user untuk **hanya menggunakan upload image untuk stempel "Lunas" saja**. Stempel hanya akan muncul ketika status pembayaran sudah "Lunas" (sisa pembayaran ≤ 0).

## Fitur yang Disederhanakan

### ✅ **Yang Tetap Ada:**
- ✅ Toggle enable/disable stempel
- ✅ Upload image untuk stempel "Lunas"
- ✅ Input URL alternatif untuk image
- ✅ Pengaturan posisi (5 pilihan)
- ✅ Pengaturan ukuran (50-200px)
- ✅ Pengaturan transparansi (10-100%)
- ✅ Live preview
- ✅ Save/Reset functionality

### ❌ **Yang Dihapus:**
- ❌ Tabs interface (General/Text/Preset)
- ❌ Text stamp option
- ❌ Color picker untuk text
- ❌ Input teks custom
- ❌ Stempel untuk "Belum Lunas"
- ❌ Preset templates
- ❌ Test scenarios
- ❌ Pengaturan untuk dual image (Lunas/Belum Lunas)

## Interface Baru

### **Lokasi**: Settings → Tab Nota → Pengaturan Cap Stempel

### **Layout Interface:**
```
🛠️ Pengaturan Cap Stempel
├── [Switch] Aktifkan Cap Stempel
└── (Jika aktif)
    ├── 📤 Upload Gambar Stempel "Lunas"
    │   ├── File Upload Input
    │   ├── [Button] Hapus (jika ada gambar)
    │   └── URL Input (alternatif)
    ├── ⚙️ Pengaturan Posisi & Ukuran
    │   ├── Dropdown Posisi
    │   ├── Slider Ukuran
    │   └── Slider Transparansi
    └── 🔍 Preview Stempel "Lunas"
        └── Preview Area
```

## Cara Penggunaan

### **Setup Simple (2 menit):**

1. **Akses Settings**
   ```
   Settings → Tab Nota → Scroll ke "Pengaturan Cap Stempel"
   ```

2. **Aktifkan Stempel**
   ```
   Toggle: "Aktifkan Cap Stempel" = ON
   ```

3. **Upload Gambar**
   ```
   Option A: Klik "Pilih File Gambar" → Select image file
   Option B: Paste URL gambar di input "URL Gambar"
   ```

4. **Atur Posisi & Ukuran**
   ```
   - Posisi: Dropdown (default: Kanan Atas)
   - Ukuran: Slider (default: 120px)
   - Transparansi: Slider (default: 70%)
   ```

5. **Preview & Simpan**
   ```
   - Lihat preview di area preview
   - Klik "Simpan Pengaturan"
   ```

### **Penggunaan:**
- Stempel **HANYA** muncul pada nota dengan status **"Lunas"**
- Status "Lunas" = Sisa pembayaran ≤ 0
- Jika belum lunas = **TIDAK ADA STEMPEL**

## Technical Changes

### **Data Structure:**
```typescript
// SEBELUM (complex)
stamp: {
  lunasText: string;
  belumLunasText: string;
  lunasColor: string;
  belumLunasColor: string;
  useImages: boolean;
  lunasImageUrl: string;
  belumLunasImageUrl: string;
}

// SESUDAH (simplified)
stamp: {
  useImage: boolean;
  lunasImageUrl: string;
}
```

### **Component Behavior:**
```typescript
// PaymentStamp Component
// SEBELUM: Render untuk Lunas DAN Belum Lunas
// SESUDAH: Render HANYA untuk Lunas

if (!isLunas) {
  return null; // Tidak tampil jika belum lunas
}

if (settings.useImage && imageUrl) {
  return <img ... />; // Tampil image jika lunas
}

return null; // Tidak tampil jika tidak ada image
```

## File Upload Features

### **Supported Formats:**
- ✅ PNG
- ✅ JPG/JPEG  
- ✅ GIF
- ✅ SVG
- ✅ WebP

### **Limitations:**
- 📏 **Max Size**: 2MB
- 🎯 **Recommended Size**: 200x200px - 500x500px
- 🖼️ **Format**: Square ratio terbaik
- 🎨 **Background**: Transparent PNG recommended

### **File Validation:**
```javascript
// Auto validation:
- File type check
- File size check (max 2MB)
- Auto convert to data URL
- Error toast notifications
```

## Preview Features

### **Live Preview:**
- ✅ Real-time update saat setting berubah
- ✅ Hanya preview status "Lunas"
- ✅ Placeholder jika belum upload image
- ✅ Visual indicator untuk missing image

### **Preview States:**
```
State 1: Stamp enabled + Image uploaded → Show stamp preview
State 2: Stamp enabled + No image → Show "Upload gambar untuk melihat preview"
State 3: Stamp disabled → Preview area hidden
```

## Settings Storage

### **LocalStorage Key:** `notaSettings`
```json
{
  "stamp": {
    "enabled": true,
    "position": "top-right",
    "opacity": 0.7,
    "size": 120,
    "useImage": true,
    "lunasImageUrl": "data:image/png;base64,..."
  }
}
```

### **Backward Compatibility:**
- ✅ Old settings auto-migrated
- ✅ Missing properties use defaults
- ✅ Invalid values sanitized

## Use Cases

### **Typical Business Flow:**

1. **Setup** (one-time):
   ```
   Admin → Upload company stamp image → Set position → Save
   ```

2. **Daily Usage** (automatic):
   ```
   Create Order → Add Items → Process Payment
   ↓
   If Lunas: Print nota WITH stamp
   If Belum Lunas: Print nota WITHOUT stamp
   ```

3. **Update Stamp** (as needed):
   ```
   Settings → Upload new image → Save
   ```

## Benefits

### **🎯 Simplified UX:**
- Fokus hanya pada kebutuhan utama
- Interface lebih clean dan mudah dipahami
- Upload file langsung, tidak perlu URL external

### **💼 Business Logic:**
- Stempel hanya untuk status "Lunas" = lebih logical
- Tidak ada konfusi dengan dual stamps
- Clear visual indicator pembayaran completed

### **⚡ Performance:**
- Reduced interface complexity
- Faster settings page load
- Smaller data storage

### **🔧 Maintenance:**
- Simpler codebase
- Fewer edge cases
- Easier troubleshooting

## Migration from Complex Version

### **Automatic Migration:**
```javascript
// Old data automatically mapped:
oldSettings.stamp.lunasImageUrl → newSettings.stamp.lunasImageUrl
oldSettings.stamp.useImages → newSettings.stamp.useImage

// Unused fields ignored:
oldSettings.stamp.belumLunasImageUrl → (deleted)
oldSettings.stamp.lunasText → (deleted)
oldSettings.stamp.belumLunasText → (deleted)
oldSettings.stamp.lunasColor → (deleted)
oldSettings.stamp.belumLunasColor → (deleted)
```

### **No Data Loss:**
- Existing image untuk "Lunas" tetap tersimpan
- Position, size, opacity settings preserved
- Enable/disable state preserved

## Examples

### **Sample Implementation:**

```typescript
// 1. User uploads stamp image
const stampImageFile = "lunas-stamp.png";

// 2. Image converted to data URL
const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

// 3. Settings saved
settings.stamp = {
  enabled: true,
  position: "top-right", 
  opacity: 0.7,
  size: 120,
  useImage: true,
  lunasImageUrl: dataUrl
};

// 4. Print logic
if (calculatePaymentStatus(orderData) === "lunas") {
  showStamp = true; // Stamp akan muncul
} else {
  showStamp = false; // Tidak ada stamp
}
```

### **Real Usage:**
```
Scenario: Order Rp 100.000
- DP: Rp 50.000
- Pelunasan: Rp 50.000  
- Sisa: Rp 0
→ Status: LUNAS → Stamp muncul ✅

Scenario: Order Rp 100.000  
- DP: Rp 30.000
- Pelunasan: Rp 0
- Sisa: Rp 70.000
→ Status: BELUM LUNAS → Tidak ada stamp ❌
```

## Quick Reference

### **Upload Gambar:**
1. Settings → Nota → Pengaturan Cap Stempel
2. Toggle ON → Upload file/URL → Atur posisi → Save

### **Test Stamp:**
1. Buat order test → Bayar penuh → Print nota
2. Stamp harus muncul di posisi yang dipilih

### **Troubleshooting:**
- Stamp tidak muncul → Check: Toggle ON? Image uploaded? Status lunas?
- Preview kosong → Upload image dulu
- File tidak bisa upload → Check format & size

---

**Interface yang disederhanakan ini fokus pada kebutuhan utama: upload image stempel untuk nota yang sudah lunas, dengan UX yang lebih clean dan mudah digunakan!** ✨

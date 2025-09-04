# Interface Pengaturan Cap Stempel di Settings Nota

## Overview

Interface pengaturan cap stempel telah berhasil diintegrasikan ke dalam halaman **Settings > Tab Nota**. User sekarang dapat mengkonfigurasi seluruh aspek cap stempel melalui interface yang user-friendly.

## Lokasi Interface

**Path**: Settings → Tab Nota → Section "Pengaturan Cap Stempel"

```
Application → Settings → Nota Tab → 🛠️ Pengaturan Cap Stempel
```

## Fitur Interface

### 🎛️ **Main Toggle**
- **Switch**: Aktifkan/Nonaktifkan cap stempel
- **Real-time**: Perubahan langsung mempengaruhi print preview

### 📑 **Sub Tabs**

#### **1. Tab "Umum"**
**Pengaturan dasar stamp:**

- **Posisi Stempel** (Dropdown)
  - Kiri Atas
  - Kanan Atas (default)
  - Kiri Bawah  
  - Kanan Bawah
  - Tengah

- **Ukuran Stempel** (Range Slider)
  - Range: 50px - 200px
  - Default: 120px
  - Real-time preview update

- **Transparansi** (Range Slider)
  - Range: 10% - 100%
  - Default: 70%
  - Real-time preview update

- **Mode Gambar** (Toggle)
  - Text stamp (default)
  - Image stamp (custom)

- **URL Gambar** (kondisional, muncul jika mode gambar aktif)
  - Input untuk URL gambar "Lunas"
  - Input untuk URL gambar "Belum Lunas"

- **🔍 Live Preview**
  - Preview area dengan background nota
  - Toggle "Lunas" vs "Belum Lunas"
  - Update real-time saat settings berubah

#### **2. Tab "Teks"**
**Kustomisasi teks dan warna:**

- **Teks Custom**
  - Input untuk teks "Lunas"
  - Input untuk teks "Belum Lunas"

- **Color Picker**
  - Color picker + hex input untuk "Lunas" (default: hijau)
  - Color picker + hex input untuk "Belum Lunas" (default: merah)

#### **3. Tab "Preset"**
**Template dan testing:**

- **Preset Templates**
  - Default: Standard setting
  - Subtle: Kecil dan halus
  - Prominent: Besar di tengah
  - English: Teks bahasa Inggris

- **Test Scenarios**
  - Berbagai skenario pembayaran
  - Visual indicator status expected
  - Total, DP, dan Pelunasan examples

## UI Components

### **Card Layout**
```jsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Stamp className="h-5 w-5" />
      <CardTitle>Pengaturan Cap Stempel</CardTitle>
    </div>
    <CardDescription>
      Konfigurasi cap stempel otomatis untuk status pembayaran
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Settings Content */}
  </CardContent>
</Card>
```

### **Tab Structure**
```jsx
<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">Umum</TabsTrigger>
    <TabsTrigger value="text">Teks</TabsTrigger>
    <TabsTrigger value="preset">Preset</TabsTrigger>
  </TabsList>
  
  <TabsContent value="general">
    {/* General settings */}
  </TabsContent>
  
  <TabsContent value="text">
    {/* Text customization */}
  </TabsContent>
  
  <TabsContent value="preset">
    {/* Presets and testing */}
  </TabsContent>
</Tabs>
```

## Cara Penggunaan

### **1. Akses Settings**
1. Buka aplikasi Studio POS
2. Navigasi ke **Settings**
3. Klik tab **"Nota"**
4. Scroll ke section **"Pengaturan Cap Stempel"**

### **2. Konfigurasi Basic**
1. **Aktifkan** toggle "Aktifkan Cap Stempel"
2. **Pilih posisi** dari dropdown (misal: "Kanan Atas")
3. **Atur ukuran** dengan slider (misal: 120px)
4. **Atur transparansi** dengan slider (misal: 70%)

### **3. Kustomisasi Teks**
1. Pindah ke tab **"Teks"**
2. **Edit teks** "Lunas" dan "Belum Lunas"
3. **Pilih warna** menggunakan color picker
4. **Lihat preview** langsung

### **4. Gunakan Preset**
1. Pindah ke tab **"Preset"**
2. **Klik preset** yang diinginkan
3. Settings akan **otomatis berubah**
4. **Customize** lebih lanjut jika perlu

### **5. Test Preview**
1. Gunakan **Live Preview** di tab "Umum"
2. **Toggle status** Lunas/Belum Lunas
3. **Lihat perubahan** real-time
4. **Test scenarios** di tab "Preset"

### **6. Simpan Settings**
1. **Klik "Simpan Pengaturan"** di bawah
2. Settings tersimpan di **localStorage**
3. **Toast notification** konfirmasi
4. **Langsung berlaku** untuk print baru

## Live Preview Features

### **Preview Area**
- **Background**: Simulasi nota dengan border dashed
- **Stamp Overlay**: PaymentStamp component terintegrasi
- **Real-time Update**: Perubahan settings langsung terlihat

### **Status Toggle**
- **Switch**: Toggle antara status "Lunas" dan "Belum Lunas"
- **Label Dynamic**: Label berubah sesuai status
- **Visual Feedback**: Warna dan teks berubah sesuai settings

### **Interactive Elements**
- **Size Slider**: Preview ukuran berubah real-time
- **Opacity Slider**: Transparansi berubah real-time
- **Position Dropdown**: Posisi stamp berubah real-time
- **Color Picker**: Warna stamp berubah real-time

## Preset Options

### **1. Default**
```javascript
{
  position: 'top-right',
  size: 120,
  opacity: 0.7,
  lunasText: 'LUNAS',
  belumLunasText: 'BELUM LUNAS',
  lunasColor: '#10B981',
  belumLunasColor: '#EF4444'
}
```

### **2. Subtle**
```javascript
{
  position: 'bottom-right',
  size: 80,
  opacity: 0.5,
  lunasText: 'PAID',
  belumLunasText: 'UNPAID',
  lunasColor: '#059669',
  belumLunasColor: '#DC2626'
}
```

### **3. Prominent**
```javascript
{
  position: 'center',
  size: 150,
  opacity: 0.8,
  lunasText: 'LUNAS',
  belumLunasText: 'BELUM LUNAS',
  lunasColor: '#10B981',
  belumLunasColor: '#EF4444'
}
```

### **4. English**
```javascript
{
  position: 'top-right',
  size: 120,
  opacity: 0.7,
  lunasText: 'PAID',
  belumLunasText: 'UNPAID',
  lunasColor: '#10B981',
  belumLunasColor: '#EF4444'
}
```

## Test Scenarios

### **Scenario 1: Lunas - Pembayaran Penuh**
- Total: Rp 100.000
- DP: Rp 100.000
- Pelunasan: Rp 0
- **Expected**: Status LUNAS

### **Scenario 2: Belum Lunas - Down Payment Saja**
- Total: Rp 100.000  
- DP: Rp 50.000
- Pelunasan: Rp 0
- **Expected**: Status BELUM LUNAS

### **Scenario 3: Lunas - Dengan Pelunasan**
- Total: Rp 100.000
- DP: Rp 30.000
- Pelunasan: Rp 70.000
- **Expected**: Status LUNAS

### **Scenario 4: Belum Lunas - Masih Ada Sisa**
- Total: Rp 100.000
- DP: Rp 30.000
- Pelunasan: Rp 20.000
- **Expected**: Status BELUM LUNAS

## Save & Reset Functions

### **Simpan Pengaturan**
- **Function**: `saveSettings()`
- **Storage**: localStorage dengan key 'notaSettings'
- **Scope**: Menyimpan seluruh NotaSettingsData termasuk stamp
- **Feedback**: Toast notification success/error

### **Reset Default**
- **Function**: `resetToDefaults()`
- **Action**: Clear localStorage → load default settings
- **Confirmation**: Browser confirm dialog
- **Feedback**: Toast notification dengan info stamp settings

## Integration Points

### **NotaPreview Component**
- Stamp muncul otomatis di print preview
- Menggunakan settings dari localStorage
- Real-time calculation payment status

### **HTML Print Generation**
- Stamp terintegrasi dalam HTML untuk printer fisik
- CSS styling konsisten
- Position absolute dengan z-index

### **PaymentStamp Component**
- Reusable component untuk stamp rendering
- Props: isLunas, settings
- Support text dan image mode

## Technical Implementation

### **State Management**
```javascript
const [settings, setSettings] = useState(getNotaSettings());
const [previewStampStatus, setPreviewStampStatus] = useState(false);
```

### **Event Handlers**
```javascript
// Update stamp settings
const updateStamp = (updates) => {
  setSettings({
    ...settings,
    stamp: { ...settings.stamp, ...updates }
  });
};

// Apply preset
const applyPreset = (presetName) => {
  setSettings({
    ...settings,
    stamp: stampPresets[presetName]
  });
};
```

### **Storage Integration**
```javascript
// Save settings
const saveSettings = () => {
  saveNotaSettings(settings);
  toast({ title: "Settings saved" });
};

// Reset to defaults
const resetToDefaults = () => {
  localStorage.removeItem('notaSettings');
  setSettings(getNotaSettings());
};
```

## UX/UI Features

### **Responsive Design**
- Grid layout responsive untuk berbagai screen size
- Sliders dan inputs mobile-friendly
- Preview area adaptif

### **Real-time Feedback**
- Preview update tanpa delay
- Visual feedback untuk setiap perubahan
- Smooth transitions

### **User Guidance**
- Descriptive labels dan placeholders
- Help text untuk complex settings
- Visual examples in test scenarios

### **Error Handling**
- Validation untuk image URLs
- Fallback untuk invalid settings
- Toast notifications untuk user feedback

## Performance Optimizations

### **Efficient Rendering**
- PaymentStamp component memoized
- Settings state optimized
- Preview area lazy loading

### **Storage Efficiency**
- JSON serialization optimized
- Default settings fallback
- Local storage cleanup

## Browser Compatibility

### **Modern Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Features Used**
- CSS color input support
- Range input support
- Local storage
- ES6+ features

## Future Enhancements

### **Planned Features**
- **File Upload**: Upload gambar langsung ke app
- **More Presets**: Template library
- **Animation Effects**: Stamp animations
- **Custom Shapes**: Non-circular stamps
- **Batch Configuration**: Multiple nota types

### **Advanced Options**
- **Conditional Display**: Rules untuk tampil stamp
- **Multiple Stamps**: Lebih dari satu stamp per nota
- **Watermark Mode**: Background stamp mode
- **Print-only Options**: Stamp khusus print fisik

## Troubleshooting

### **Stamp Tidak Muncul**
1. Check toggle "Aktifkan Cap Stempel"
2. Verify settings tersimpan (klik Simpan)
3. Refresh print preview
4. Check browser localStorage

### **Preview Tidak Update**
1. Check tab focus (harus di tab "Umum")
2. Toggle preview status switch
3. Try different settings values
4. Refresh halaman settings

### **Preset Tidak Work**
1. Check notification toast muncul
2. Verify preset data valid
3. Manual setting jika perlu
4. Reset to default kemudian coba preset

### **Settings Tidak Tersimpan**
1. Click "Simpan Pengaturan" explicit
2. Check localStorage permission
3. Verify no JavaScript errors
4. Try hard refresh (Ctrl+F5)

---

**Interface pengaturan cap stempel ini memberikan kontrol penuh kepada user untuk mengkustomisasi tampilan stamp sesuai kebutuhan bisnis mereka, dengan live preview yang memudahkan eksperimen dan testing!** ✨

# Fitur Cap Stempel Lunas/Belum Lunas pada Nota

## Overview

Fitur ini memungkinkan Anda menambahkan cap stempel otomatis pada print preview nota yang menunjukkan status pembayaran:
- **"LUNAS"** - Jika sisa pembayaran ≤ 0 (sudah lunas)
- **"BELUM LUNAS"** - Jika sisa pembayaran > 0 (belum lunas)

## Fitur yang Tersedia

### 1. **Text Stamp (Default)**
- Stamp berbentuk lingkaran dengan teks
- Dapat dikustomisasi warna, ukuran, dan posisi
- Rotasi -15 derajat untuk efek cap yang natural
- Opacity dapat diatur

### 2. **Image Stamp (Opsional)**
- Menggunakan gambar custom untuk stamp
- Mendukung format PNG, JPG, SVG
- URL dapat diupload atau link eksternal
- Ukuran dapat diatur secara fleksibel

### 3. **Posisi Stamp yang Fleksibel**
- Top Left (Kiri Atas)
- Top Right (Kanan Atas) - Default
- Bottom Left (Kiri Bawah)
- Bottom Right (Kanan Bawah)
- Center (Tengah)

### 4. **Kustomisasi Penuh**
- Teks custom untuk "Lunas" dan "Belum Lunas"
- Warna berbeda untuk masing-masing status
- Ukuran stamp dapat disesuaikan
- Opacity/transparansi dapat diatur

## Cara Menggunakan

### 1. **Konfigurasi Default**
Stamp sudah aktif dengan pengaturan default:
```typescript
stamp: {
  enabled: true,
  position: 'top-right',
  opacity: 0.7,
  size: 120,
  lunasText: 'LUNAS',
  belumLunasText: 'BELUM LUNAS',
  lunasColor: '#10B981',      // Hijau
  belumLunasColor: '#EF4444', // Merah
  useImages: false,
  lunasImageUrl: '',
  belumLunasImageUrl: ''
}
```

### 2. **Menggunakan Text Stamp**
```typescript
import { getNotaSettings, saveNotaSettings } from '@/utils/notaSettings';

const settings = getNotaSettings();
settings.stamp.enabled = true;
settings.stamp.useImages = false;
settings.stamp.lunasText = 'LUNAS';
settings.stamp.belumLunasText = 'BELUM LUNAS';
settings.stamp.position = 'top-right';
settings.stamp.size = 120;
settings.stamp.opacity = 0.7;
saveNotaSettings(settings);
```

### 3. **Menggunakan Image Stamp**
```typescript
const settings = getNotaSettings();
settings.stamp.enabled = true;
settings.stamp.useImages = true;
settings.stamp.lunasImageUrl = '/path/to/lunas-stamp.png';
settings.stamp.belumLunasImageUrl = '/path/to/belum-lunas-stamp.png';
settings.stamp.size = 150; // Ukuran gambar
saveNotaSettings(settings);
```

### 4. **Contoh Kustomisasi Lanjutan**
```typescript
const settings = getNotaSettings();
settings.stamp = {
  enabled: true,
  position: 'bottom-right',
  opacity: 0.8,
  size: 100,
  lunasText: 'PAID',
  belumLunasText: 'UNPAID',
  lunasColor: '#059669',      // Hijau tua
  belumLunasColor: '#DC2626', // Merah tua
  useImages: false,
  lunasImageUrl: '',
  belumLunasImageUrl: ''
};
saveNotaSettings(settings);
```

## Logika Penentuan Status

Status "LUNAS" atau "BELUM LUNAS" ditentukan berdasarkan perhitungan:

```typescript
const subtotal = selectedItems.reduce((sum, item) => sum + item.subTotal, 0);
const total = subtotal + desain + biayaLainnya;
const remaining = total - downPayment - pelunasan;

const isLunas = remaining <= 0;
```

- **LUNAS**: `remaining <= 0`
- **BELUM LUNAS**: `remaining > 0`

## Integrasi

### 1. **Print Preview**
Stamp muncul langsung di komponen `NotaPreview` dengan overlay yang tidak mengganggu konten utama.

### 2. **HTML Print**
Stamp juga terintegrasi dalam HTML yang digenerate untuk print fisik dengan styling yang konsisten.

### 3. **Responsive Design**
Stamp tetap proporsional di berbagai ukuran layar dan resolusi print.

## Rekomendasi Penggunaan

### **Text Stamp (Recommended)**
- Lebih cepat loading
- Tidak bergantung pada file eksternal
- Mudah dikustomisasi
- Konsisten di semua device

### **Image Stamp**
- Untuk branding yang lebih profesional
- Logo perusahaan atau design khusus
- Pastikan gambar sudah optimized
- Ukuran file kecil untuk performa

## Contoh Implementasi di Interface

```typescript
// Komponen Settings untuk Stamp
const StampSettings = () => {
  const [settings, setSettings] = useState(getNotaSettings());
  
  const updateStamp = (stampSettings: any) => {
    const newSettings = { ...settings, stamp: stampSettings };
    setSettings(newSettings);
    saveNotaSettings(newSettings);
  };
  
  return (
    <div className="space-y-4">
      <h3>Pengaturan Cap Stempel</h3>
      
      <label>
        <input 
          type="checkbox" 
          checked={settings.stamp.enabled}
          onChange={(e) => updateStamp({
            ...settings.stamp, 
            enabled: e.target.checked
          })}
        />
        Aktifkan Cap Stempel
      </label>
      
      <select 
        value={settings.stamp.position}
        onChange={(e) => updateStamp({
          ...settings.stamp, 
          position: e.target.value
        })}
      >
        <option value="top-left">Kiri Atas</option>
        <option value="top-right">Kanan Atas</option>
        <option value="bottom-left">Kiri Bawah</option>
        <option value="bottom-right">Kanan Bawah</option>
        <option value="center">Tengah</option>
      </select>
      
      <input 
        type="range" 
        min="50" 
        max="200" 
        value={settings.stamp.size}
        onChange={(e) => updateStamp({
          ...settings.stamp, 
          size: parseInt(e.target.value)
        })}
      />
      
      <input 
        type="range" 
        min="0.1" 
        max="1" 
        step="0.1" 
        value={settings.stamp.opacity}
        onChange={(e) => updateStamp({
          ...settings.stamp, 
          opacity: parseFloat(e.target.value)
        })}
      />
    </div>
  );
};
```

## Tips dan Best Practices

### 1. **Ukuran Stamp**
- Text stamp: 80-150px optimal
- Image stamp: 100-200px optimal
- Sesuaikan dengan ukuran nota

### 2. **Posisi**
- `top-right`: Tidak menutupi header
- `bottom-right`: Tidak menutupi total
- `center`: Hanya untuk stamp besar/watermark

### 3. **Opacity**
- 0.6-0.8: Untuk stamp yang subtle
- 0.8-1.0: Untuk stamp yang prominent

### 4. **Warna**
- Hijau: #10B981, #059669 (Lunas)
- Merah: #EF4444, #DC2626 (Belum Lunas)
- Kontras tinggi untuk readability

### 5. **Performance**
- Gunakan text stamp untuk performa terbaik
- Image stamp: optimasi ukuran file
- Test di berbagai device

## Troubleshooting

### **Stamp tidak muncul**
- Pastikan `enabled: true`
- Check settingan localStorage
- Verify payment calculation

### **Stamp terlalu besar/kecil**
- Adjust `size` property
- Test di preview mode
- Consider screen resolution

### **Image tidak load**
- Check URL accessibility
- Verify file format (PNG/JPG/SVG)
- Test with relative path

### **Posisi tidak sesuai**
- Check `position` setting
- Test di berbagai ukuran nota
- Adjust margin jika perlu

## Development Notes

### **Komponen yang Terlibat**
1. `PaymentStamp.tsx` - Komponen stamp
2. `PrintPreviews.tsx` - Integrasi di NotaPreview
3. `PrintOverlay.tsx` - HTML print generation
4. `notaSettings.ts` - Konfigurasi

### **Testing**
- Test dengan berbagai sisa pembayaran
- Test semua posisi stamp
- Test text dan image mode
- Test print preview dan actual print

### **Future Enhancements**
- Multiple stamp styles
- Animation effects
- Custom shapes (square, diamond)
- Batch stamp configuration
- Template stamps

Fitur ini memberikan profesionalitas tambahan pada sistem nota dengan indikator visual yang jelas tentang status pembayaran.

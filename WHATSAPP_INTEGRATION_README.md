# WhatsApp Integration Feature

## Overview
Fitur ini memungkinkan pengguna untuk mengklik nomor WhatsApp/telepon di halaman Suppliers dan secara otomatis membuka WhatsApp dengan kontak tersebut.

## Fitur yang Tersedia

### 1. Clickable WhatsApp Numbers
- Nomor WhatsApp di kolom "WhatsApp" dan "Telepon" menjadi clickable
- Icon WhatsApp (MessageCircle) ditampilkan di sebelah nomor
- Hover effect dengan warna biru dan underline
- Tooltip "Klik untuk membuka WhatsApp"

### 2. Automatic WhatsApp Opening
- Mengklik nomor akan membuka WhatsApp Web atau aplikasi WhatsApp
- Format nomor otomatis dikonversi ke format internasional (+62)
- Mendukung berbagai format input:
  - `08123456789` → `+628123456789`
  - `628123456789` → `+628123456789`
  - `+628123456789` → `+628123456789`

### 3. Smart Number Validation
- Hanya nomor yang valid yang menjadi clickable
- Nomor invalid ditampilkan dengan warna abu-abu
- Validasi panjang nomor (7-15 digit)

## Implementasi

### File yang Diperbarui
1. **`src/utils/whatsapp.ts`** - Utility functions untuk WhatsApp
2. **`src/components/ui/whatsapp-button.tsx`** - Komponen WhatsApp button yang reusable
3. **`src/pages/Suppliers.tsx`** - Halaman Suppliers utama
4. **`src/components/master-data/SuppliersTab.tsx`** - Tab Suppliers di Master Data

### Komponen WhatsAppButton
```tsx
<WhatsAppButton 
  phoneNumber="08123456789"
  className="custom-class"
  showIcon={true}
  title="Custom tooltip"
>
  Custom Text
</WhatsAppButton>
```

### Props WhatsAppButton
- `phoneNumber`: Nomor telepon yang akan dibuka di WhatsApp
- `className`: CSS class tambahan (opsional)
- `showIcon`: Tampilkan icon WhatsApp (default: true)
- `children`: Custom text untuk ditampilkan (opsional)
- `title`: Custom tooltip (opsional)

## Cara Penggunaan

### Untuk Pengguna
1. Buka halaman Suppliers
2. Lihat kolom "WhatsApp" atau "Telepon"
3. Klik nomor yang memiliki icon WhatsApp (berwarna biru)
4. WhatsApp akan terbuka otomatis dengan kontak tersebut

### Untuk Developer
1. Import komponen WhatsAppButton:
   ```tsx
   import WhatsAppButton from '@/components/ui/whatsapp-button';
   ```

2. Gunakan di tabel atau form:
   ```tsx
   <WhatsAppButton phoneNumber={supplier.phone} />
   ```

3. Atau gunakan utility function langsung:
   ```tsx
   import { openWhatsApp } from '@/utils/whatsapp';
   
   openWhatsApp('08123456789', 'Halo, saya ingin bertanya tentang produk...');
   ```

## Format Nomor yang Didukung

### Input Format
- `08123456789` (Indonesia dengan awalan 0)
- `628123456789` (Indonesia dengan awalan 62)
- `+628123456789` (Indonesia dengan awalan +62)
- `1234567890` (Format lain)

### Output Format
- `+628123456789` (Format internasional)

## Keamanan dan Validasi

### Validasi Input
- Hanya menerima karakter digit, +, dan -
- Panjang nomor minimal 7 digit, maksimal 15 digit
- Sanitasi input untuk mencegah XSS

### Error Handling
- Nomor invalid ditampilkan dengan warna abu-abu
- Tidak ada error yang ditampilkan ke user
- Fallback ke tampilan normal jika terjadi error

## Browser Compatibility
- Chrome/Chromium (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Edge (Desktop & Mobile)

## Mobile Support
- WhatsApp Web untuk desktop
- Deep link ke aplikasi WhatsApp untuk mobile
- Responsive design untuk berbagai ukuran layar

## Future Enhancements
1. **Template Message**: Pre-fill pesan dengan template yang bisa dikustomisasi
2. **Multiple Numbers**: Support untuk multiple WhatsApp numbers
3. **WhatsApp Business**: Integration dengan WhatsApp Business API
4. **Message History**: Tracking pesan yang dikirim
5. **Contact Groups**: Support untuk grup WhatsApp

## Troubleshooting

### WhatsApp tidak terbuka
1. Pastikan WhatsApp terinstall di device
2. Pastikan nomor valid dan memiliki format yang benar
3. Cek browser settings untuk popup blocker

### Nomor tidak clickable
1. Pastikan nomor memiliki format yang valid
2. Cek console browser untuk error
3. Pastikan komponen WhatsAppButton ter-render dengan benar

### Format nomor salah
1. Pastikan input nomor sesuai format yang didukung
2. Cek logic konversi di `whatsapp.ts`
3. Test dengan berbagai format input

## Testing

### Manual Testing
1. Test dengan berbagai format nomor
2. Test di berbagai browser
3. Test di mobile dan desktop
4. Test dengan nomor invalid

### Automated Testing
```tsx
// Test utility functions
import { isValidPhoneNumber, formatPhoneNumber } from '@/utils/whatsapp';

test('validates Indonesian phone numbers', () => {
  expect(isValidPhoneNumber('08123456789')).toBe(true);
  expect(isValidPhoneNumber('628123456789')).toBe(true);
  expect(isValidPhoneNumber('invalid')).toBe(false);
});
```

## Dependencies
- `lucide-react`: Untuk icon WhatsApp
- `@/lib/utils`: Untuk utility functions (cn)
- React hooks dan components

## License
Fitur ini merupakan bagian dari aplikasi Studio POS dan mengikuti license yang sama.

# Print Overlay System

Sistem overlay untuk fungsi print yang dapat digunakan untuk berbagai jenis dokumen seperti SPK, Receipt, Nota, dan Nota Pelunasan.

## Fitur

- **Layout Responsif**: Menggunakan layout 2/3 - 1/3 sesuai dengan wireframe yang diberikan
- **Preview Real-time**: Preview dokumen yang akan di-print
- **Multiple Print Types**: Mendukung berbagai jenis print (SPK, Receipt, Nota, Pelunasan)
- **Product Name Mapping**: Menampilkan nama produk, bukan kode (PRD0004 → Banner Vinyl)
- **Customizable**: Dapat disesuaikan dengan kebutuhan bisnis
- **Toast Notifications**: Feedback untuk user saat print berhasil/gagal

## Komponen

### 1. PrintOverlay
Komponen utama yang menampilkan overlay print dengan layout:
- **Left Column (2/3 width)**: 
  - Top section: Daftar order
  - Bottom section: Additional information
- **Right Column (1/3 width)**: Preview dari print
- **Bottom Buttons**: Cancel dan Print

### 2. Print Previews
Komponen preview khusus untuk setiap jenis print:
- `SPKPreview`: Surat Perintah Kerja
- `ReceiptPreview`: Receipt untuk customer
- `NotaPreview`: Nota detail
- `PelunasanPreview`: Nota pelunasan pembayaran

### 3. usePrintOverlay Hook
Hook untuk mengelola state dan fungsi print overlay.

### 4. Product Mapping Utility
Utility functions untuk mapping kode produk ke nama:
- `getProductNameFromCode()`: Mengubah kode (PRD0004) ke nama (Banner Vinyl)
- `getProductByCode()`: Mendapatkan data produk dari kode
- `mapOrderItemsWithNames()`: Mapping item order dengan nama produk (tanpa bahan dan finishing)

## Cara Penggunaan

### 1. Import Komponen

```tsx
import { usePrintOverlay } from '@/hooks/usePrintOverlay';
import { PrintOverlay } from '@/components/PrintOverlay';
```

### 2. Setup Hook

```tsx
const {
  isOpen: isPrintOverlayOpen,
  printType,
  printData,
  closePrintOverlay,
  handlePrint,
  printSPK,
  printReceipt,
  printNota,
  printPelunasan,
} = usePrintOverlay();
```

### 3. Data Preparation

```tsx
const orderList = [
  {
    id: '1',
    item: 'Banner Vinyl 3x2m',
    quantity: 2,
    subTotal: 500000,
  },
  // ... more items
];

const orderData = {
  orderNumber: 'ORD-2024-001',
  customerName: 'PT. Contoh Indonesia',
  totalAmount: 825000,
  downPayment: 200000, // untuk pelunasan
  pelunasan: 300000,   // untuk pelunasan
};
```

### 4. Print Functions

```tsx
// Print SPK
const handlePrintSPK = () => {
  printSPK({ orderList, orderData });
};

// Print Receipt
const handlePrintReceipt = () => {
  printReceipt({ orderList, orderData });
};

// Print Nota
const handlePrintNota = () => {
  printNota({ orderList, orderData });
};

// Print Pelunasan
const handlePrintPelunasan = () => {
  printPelunasan({ orderList, orderData });
};
```

### 5. Render PrintOverlay

```tsx
<PrintOverlay
  isOpen={isPrintOverlayOpen}
  onClose={closePrintOverlay}
  onPrint={handlePrint}
  title={`Print ${printType.toUpperCase()}`}
  orderList={printData.orderList}
  orderData={printData.orderData}
  printType={printType}
/>
```

## Integrasi dengan OrderActionButtons

Update komponen `OrderActionButtons` untuk menggunakan print overlay:

```tsx
<OrderActionButtons
  onNew={handleNew}
  onSave={handleSave}
  onSubmit={handleSubmit}
  onPrintSPK={handlePrintSPK}
  onPrintReceipt={handlePrintReceipt}
  onPrintNota={handlePrintNota}
  onPrintPelunasan={handlePrintPelunasan}
  isSaving={isSaving}
  hasUnsavedChanges={hasUnsavedChanges}
  disabledPrintSPK={!selectedOrder}
  disabledSaveOrder={!hasChanges}
/>
```

## Customization

### Custom Preview Content

Anda dapat memberikan preview content custom:

```tsx
const customPreview = (
  <div className="custom-preview">
    <h2>Custom Preview</h2>
    <p>Your custom content here</p>
  </div>
);

printSPK({ 
  orderList, 
  orderData, 
  previewContent: customPreview 
});
```

### Custom Print Logic

Override fungsi print di hook:

```tsx
const handlePrint = useCallback(async () => {
  try {
    // Custom print logic here
    console.log(`Printing ${printType} with data:`, printData);
    
    // Call your print service
    await printService.print(printType, printData);
    
    toast({
      title: 'Print Success',
      description: `${printType.toUpperCase()} has been sent to printer`,
    });
    
    closePrintOverlay();
  } catch (error) {
    toast({
      title: 'Print Error',
      description: 'Failed to print. Please try again.',
      variant: 'destructive',
    });
  }
}, [printType, printData, closePrintOverlay]);
```

## Demo

Lihat file `PrintDemo.tsx` untuk contoh implementasi lengkap dengan data sample.

## Struktur File

```
src/
├── components/
│   ├── PrintOverlay.tsx          # Komponen utama
│   ├── print/
│   │   └── PrintPreviews.tsx     # Komponen preview
│   └── PrintDemo.tsx             # Demo component
├── hooks/
│   └── usePrintOverlay.ts        # Hook untuk state management
├── utils/
│   └── productMapping.ts         # Utility untuk mapping kode ke nama
└── pages/
    └── Orderan.tsx               # Contoh integrasi
```

## Props Interface

### PrintOverlayProps

```tsx
interface PrintOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  title: string;
  orderList?: Array<{
    id: string;
    item: string;
    quantity: number;
    subTotal: number;
    [key: string]: any;
  }>;
  previewContent?: React.ReactNode;
  printType: 'spk' | 'receipt' | 'nota' | 'pelunasan' | 'other';
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number;
    [key: string]: any;
  };
}
```

### PrintData

```tsx
interface PrintData {
  orderList?: Array<{
    id: string;
    item: string;
    quantity: number;
    subTotal: number;
    [key: string]: any;
  }>;
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number;
    [key: string]: any;
  };
  previewContent?: React.ReactNode;
}
```

## Tips Penggunaan

1. **Data Validation**: Pastikan data order lengkap sebelum memanggil fungsi print
2. **Error Handling**: Implementasikan error handling yang baik untuk fungsi print
3. **Loading States**: Tambahkan loading state saat proses print berlangsung
4. **Print Service**: Integrasikan dengan print service yang sesuai dengan kebutuhan
5. **Responsive Design**: Layout sudah responsive, pastikan preview content juga responsive

## Troubleshooting

### Print tidak muncul
- Pastikan `isOpen` bernilai `true`
- Cek apakah data `orderList` dan `orderData` terisi dengan benar
- Pastikan `printType` sesuai dengan yang diharapkan

### Preview tidak sesuai
- Cek apakah `previewContent` custom sudah benar
- Pastikan data yang dikirim sesuai dengan interface yang diharapkan
- Gunakan browser developer tools untuk debug

### Error saat print
- Implementasikan error handling di fungsi `handlePrint`
- Cek console untuk error details
- Pastikan print service berjalan dengan baik 
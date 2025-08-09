# Nota Print Format Update

## Format Print Nota yang Baru

Format print Nota telah diupdate sesuai dengan permintaan user. Berikut adalah perubahan yang telah dilakukan:

### Format Print Nota yang Baru

```
NOTA
=====
19/12/2024
Nota: 000001

Customer: WD Florist

Items:
------
Spanduk Florist 2 Pass
  TBC Dari Apotekku
  100 x 150
  1 Lembaran x Rp 150.000
  Subtotal: Rp 150.000

Spanduk Glossy 280 Gsm
  Promosi Toko
  150 x 100
  2 Lembaran x Rp 200.000
  Subtotal: Rp 400.000

Cincin / Mata Ayam
  Aksesoris
  70 x 100
  5 Pcs x Rp 50.000
  Subtotal: Rp 250.000

==================
Subtotal: Rp 800.000
Down Payment: Rp 200.000
Sisa: Rp 600.000
TOTAL: Rp 800.000

Payment: Cash
Cashier: Cashier

Thank you for your order!
Please complete payment before deadline.
```

## Perubahan yang Dilakukan

### 1. **Header Section**
- **Nota Number**: Default ke "000001" jika tidak ada orderNumber
- **Date**: Format tanggal Indonesia
- **Customer**: Nama customer

### 2. **Items Section**
- **Item Name**: Nama produk
- **Description**: Deskripsi produk (jika ada)
- **Dimensions**: Ukuran dalam format "panjang x lebar"
- **Quantity & Price**: Format "quantity unit x price"
- **Subtotal**: Subtotal per item

### 3. **Payment Summary**
- **Subtotal**: Total semua item
- **Down Payment**: Uang muka yang sudah dibayar
- **Sisa**: Sisa yang harus dibayar (bukan "Remaining")
- **TOTAL**: Total keseluruhan

### 4. **Additional Info**
- **Payment**: Metode pembayaran (Cash)
- **Cashier**: Nama kasir

### 5. **Footer**
- **Thank you message**: Pesan terima kasih
- **Payment reminder**: Pengingat untuk melengkapi pembayaran

## Perbedaan dengan Format Sebelumnya

### **Yang Dihapus:**
- ❌ Deadline information
- ❌ Designer information
- ❌ Computer information
- ❌ "Remaining" (diganti dengan "Sisa")

### **Yang Ditambahkan/Diperbaiki:**
- ✅ Default nota number "000001"
- ✅ Label "Sisa" untuk sisa pembayaran
- ✅ Format yang lebih sederhana dan fokus
- ✅ Hanya informasi yang relevan untuk nota

## UI Changes

### **PrintOverlay UI Updates**

#### **Payment Summary Section**
```typescript
{printType === 'nota' && (
  <div className="mt-4 space-y-2 text-sm border-t pt-3">
    <div className="flex justify-between">
      <span className="font-medium">Subtotal:</span>
      <span>{/* currency format */}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium">Down Payment:</span>
      <span>{/* currency format */}</span>
    </div>
    <div className="flex justify-between font-bold">
      <span>Sisa:</span> {/* Changed from "Remaining" */}
      <span>{/* currency format */}</span>
    </div>
  </div>
)}
```

#### **Additional Information Section**
```typescript
{printType === 'spk' ? (
  <>
    <div className="flex justify-between">
      <span>Kom :</span>
      <span>{orderData?.komputer || '???'}</span>
    </div>
    <div className="flex justify-between">
      <span>Designer:</span>
      <span>{orderData?.desainer || 'Belum ditugaskan'}</span>
    </div>
  </>
) : (
  <>
    <div className="flex justify-between">
      <span>Payment:</span>
      <span>Cash</span>
    </div>
    <div className="flex justify-between">
      <span>Cashier:</span>
      <span>Cashier</span>
    </div>
  </>
)}
```

## Code Changes

### **Print Content Generation**

#### **Before:**
```typescript
content += `Nota: ${orderData?.orderNumber || 'N/A'}\n\n`;
// ... deadline info
content += `Remaining: ${/* currency format */}\n`;
// ... designer, computer info
```

#### **After:**
```typescript
content += `Nota: ${orderData?.orderNumber || '000001'}\n\n`;
// ... no deadline info
content += `Sisa: ${/* currency format */}\n`;
// ... only payment and cashier info
```

## Sample Data

### **Input Data:**
```typescript
const orderData = {
  orderNumber: '000001',
  customerName: 'WD Florist',
  totalAmount: 800000,
  downPayment: 200000
};

const orderList = [
  {
    item: 'Spanduk Florist 2 Pass',
    description: 'TBC Dari Apotekku',
    quantity: 1,
    subTotal: 150000,
    finishing: 'Lembaran',
    ukuran: { panjang: '100', lebar: '150' }
  },
  {
    item: 'Spanduk Glossy 280 Gsm',
    description: 'Promosi Toko',
    quantity: 2,
    subTotal: 400000,
    finishing: 'Lembaran',
    ukuran: { panjang: '150', lebar: '100' }
  },
  {
    item: 'Cincin / Mata Ayam',
    description: 'Aksesoris',
    quantity: 5,
    subTotal: 250000,
    finishing: 'Pcs',
    ukuran: { panjang: '70', lebar: '100' }
  }
];
```

### **Output Format:**
```
NOTA
=====
19/12/2024
Nota: 000001

Customer: WD Florist

Items:
------
Spanduk Florist 2 Pass
  TBC Dari Apotekku
  100 x 150
  1 Lembaran x Rp 150.000
  Subtotal: Rp 150.000

Spanduk Glossy 280 Gsm
  Promosi Toko
  150 x 100
  2 Lembaran x Rp 200.000
  Subtotal: Rp 400.000

Cincin / Mata Ayam
  Aksesoris
  70 x 100
  5 Pcs x Rp 50.000
  Subtotal: Rp 250.000

==================
Subtotal: Rp 800.000
Down Payment: Rp 200.000
Sisa: Rp 600.000
TOTAL: Rp 800.000

Payment: Cash
Cashier: Cashier

Thank you for your order!
Please complete payment before deadline.
```

## Benefits

### **1. Simplified Format**
- Menghapus informasi yang tidak relevan untuk nota
- Fokus pada informasi pembayaran
- Format yang lebih mudah dibaca

### **2. Consistent Labeling**
- Menggunakan "Sisa" yang lebih familiar dalam bahasa Indonesia
- Label yang konsisten dengan konteks nota

### **3. Better User Experience**
- Format yang lebih clean dan professional
- Informasi yang tepat sesuai kebutuhan nota
- Tidak ada informasi yang membingungkan

### **4. Maintainable Code**
- Conditional rendering yang jelas
- Separation of concerns antara SPK dan Nota
- Easy to extend untuk format lain

## Testing Scenarios

### **1. Print Content Generation**
- Test dengan berbagai orderNumber
- Test dengan dan tanpa downPayment
- Test dengan berbagai item types
- Test currency formatting

### **2. UI Display**
- Test payment summary display
- Test additional information display
- Test responsive behavior
- Test print button functionality

### **3. Data Handling**
- Test dengan missing data
- Test dengan invalid data
- Test dengan empty orderList
- Test dengan large amounts

Format Nota sekarang lebih sesuai dengan kebutuhan bisnis dan memberikan pengalaman yang lebih baik untuk pengguna. 
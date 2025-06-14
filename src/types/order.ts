
export interface OrderItem {
  id: string;
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  subTotal: number;
  globalItemCode?: string; // Reference to persistent global item
}

export interface OrderFormData {
  orderNumber: string;
  customer: string;
  tanggal: string;
  waktu: string;
  estimasi: string;
  estimasiWaktu: string;
  outdoor: boolean;
  laserPrinting: boolean;
  mugNota: boolean;
  jasaDesain: string;
  biayaLain: string;
  subTotal: string;
  discount: number;
  ppn: number;
  paymentType: string;
  bank: string;
  admin: string;
  desainer: string;
  komputer: string;
  notes: string;
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

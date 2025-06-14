export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'pending' | 'in-progress' | 'ready' | 'done';
  date: string;
  estimatedDate: string;
  designer?: {
    name: string;
    avatar?: string;
    assignedBy?: string;
  };
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTerms: string;
  outstandingBalance: number;
  address: string;
}

export interface InventoryItem {
  code: string;
  name: string;
  unit: string;
  initialStock: number;
  inStock: number;
  outStock: number;
  finalStock: number;
}

export interface Customer {
  kode: string;
  nama: string;
  whatsapp: string;
  level: 'Premium' | 'Regular' | 'VIP';
}

export interface Employee {
  kode: string;
  nama: string;
  posisi: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  kode: string;
  jenis: string;
  nama: string;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  stokAwal: number;
  stokMasuk: number;
  stokKeluar: number;
  stokOpname: number;
}

export interface Transaction {
  id: string;
  customer: string;
  date: string;
  estimatedDate: string;
  status: string;
  category: string;
  total: string;
}

export interface DashboardStats {
  totalRevenue: string;
  totalTransactions: string;
  pendingOrders: string;
}

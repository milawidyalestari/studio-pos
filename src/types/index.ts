import { Database } from "@/integrations/supabase/types";

type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderWithItems extends DbOrder {
  order_items: DbOrderItem[];
  // Joined fields from database query
  desainer?: { id: string; nama: string };
  admin?: { id: string; nama: string };
  order_statuses?: { id: number; name: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'Design' | 'Cek File' | 'Konfirmasi' | 'Export' | 'Done' | 'Proses Cetak';
  date: string;
  estimatedDate: string;
  designer?: {
    name: string;
    avatar?: string;
    assignedBy?: string;
  };
  // Additional fields from database
  customer_name?: string;
  estimasi?: string;
  order_items?: any[];
  created_at?: string;
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
  id: string;
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

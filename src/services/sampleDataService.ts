import { dataAccess } from '@/lib/data-access';

export interface SampleOrder {
  order_number: string;
  customer_name: string;
  tanggal: string;
  waktu?: string;
  estimasi?: string;
  estimasi_waktu?: string;
  outdoor: boolean;
  laser_printing: boolean;
  mug_nota: boolean;
  jasa_desain: number;
  biaya_lain: number;
  sub_total: number;
  discount: number;
  ppn: number;
  total_amount: number;
  payment_type?: string;
  bank?: string;
  admin_id?: string;
  desainer_id?: string;
  komputer?: string;
  notes?: string;
  status_id: number;
}

export const sampleOrders: SampleOrder[] = [
  {
    order_number: 'ORD001',
    customer_name: 'John Doe',
    tanggal: '2024-01-15',
    waktu: '09:30',
    estimasi: '2024-01-17',
    estimasi_waktu: '14:00',
    outdoor: true,
    laser_printing: false,
    mug_nota: false,
    jasa_desain: 50000,
    biaya_lain: 0,
    sub_total: 250000,
    discount: 0,
    ppn: 25000,
    total_amount: 325000,
    payment_type: 'Cash',
    notes: 'Banner outdoor 3x4 meter',
    status_id: 3 // Done
  },
  {
    order_number: 'ORD002',
    customer_name: 'Jane Smith',
    tanggal: '2024-01-16',
    waktu: '10:15',
    estimasi: '2024-01-18',
    estimasi_waktu: '16:00',
    outdoor: false,
    laser_printing: true,
    mug_nota: false,
    jasa_desain: 75000,
    biaya_lain: 15000,
    sub_total: 400000,
    discount: 25000,
    ppn: 37500,
    total_amount: 412500,
    payment_type: 'Transfer',
    bank: 'BCA',
    notes: 'Sticker vinyl untuk mobil',
    status_id: 2 // Processing
  },
  {
    order_number: 'ORD003',
    customer_name: 'Bob Wilson',
    tanggal: '2024-01-17',
    waktu: '11:00',
    estimasi: '2024-01-19',
    estimasi_waktu: '12:00',
    outdoor: false,
    laser_printing: false,
    mug_nota: true,
    jasa_desain: 0,
    biaya_lain: 0,
    sub_total: 150000,
    discount: 0,
    ppn: 15000,
    total_amount: 165000,
    payment_type: 'Cash',
    notes: 'Kartu nama 1000 pcs',
    status_id: 1 // Pending
  },
  {
    order_number: 'ORD004',
    customer_name: 'Alice Brown',
    tanggal: '2024-01-18',
    waktu: '14:30',
    estimasi: '2024-01-20',
    estimasi_waktu: '15:00',
    outdoor: true,
    laser_printing: false,
    mug_nota: false,
    jasa_desain: 100000,
    biaya_lain: 25000,
    sub_total: 600000,
    discount: 50000,
    ppn: 55000,
    total_amount: 605000,
    payment_type: 'Transfer',
    bank: 'Mandiri',
    notes: 'Spanduk event besar',
    status_id: 5 // Cek File
  },
  {
    order_number: 'ORD005',
    customer_name: 'Charlie Davis',
    tanggal: '2024-01-19',
    waktu: '16:00',
    estimasi: '2024-01-21',
    estimasi_waktu: '10:00',
    outdoor: false,
    laser_printing: true,
    mug_nota: false,
    jasa_desain: 125000,
    biaya_lain: 0,
    sub_total: 800000,
    discount: 0,
    ppn: 80000,
    total_amount: 880000,
    payment_type: 'Cash',
    notes: 'Desain logo perusahaan',
    status_id: 6 // Desain
  },
  {
    order_number: 'ORD006',
    customer_name: 'Diana Evans',
    tanggal: '2024-01-20',
    waktu: '09:00',
    estimasi: '2024-01-22',
    estimasi_waktu: '14:00',
    outdoor: true,
    laser_printing: false,
    mug_nota: false,
    jasa_desain: 0,
    biaya_lain: 10000,
    sub_total: 300000,
    discount: 0,
    ppn: 30000,
    total_amount: 330000,
    payment_type: 'Transfer',
    bank: 'BNI',
    notes: 'Banner promosi',
    status_id: 7 // Konfirmasi
  },
  {
    order_number: 'ORD007',
    customer_name: 'Frank Miller',
    tanggal: '2024-01-21',
    waktu: '13:45',
    estimasi: '2024-01-23',
    estimasi_waktu: '16:00',
    outdoor: false,
    laser_printing: true,
    mug_nota: false,
    jasa_desain: 50000,
    biaya_lain: 0,
    sub_total: 200000,
    discount: 15000,
    ppn: 18500,
    total_amount: 203500,
    payment_type: 'Cash',
    notes: 'Sticker untuk laptop',
    status_id: 8 // Revisi
  },
  {
    order_number: 'ORD008',
    customer_name: 'Grace Lee',
    tanggal: '2024-01-22',
    waktu: '15:20',
    estimasi: '2024-01-24',
    estimasi_waktu: '11:00',
    outdoor: false,
    laser_printing: false,
    mug_nota: true,
    jasa_desain: 0,
    biaya_lain: 0,
    sub_total: 100000,
    discount: 0,
    ppn: 10000,
    total_amount: 110000,
    payment_type: 'Transfer',
    bank: 'BCA',
    notes: 'Kartu nama 500 pcs',
    status_id: 4 // Cancelled
  }
];

export const addSampleOrders = async () => {
  try {
    console.log('Adding sample orders to database...');
    
    for (const order of sampleOrders) {
      await dataAccess.createOrder(order);
      console.log(`Added order: ${order.order_number}`);
    }
    
    console.log('Sample orders added successfully!');
    return { success: true, message: 'Sample orders added successfully' };
  } catch (error) {
    console.error('Error adding sample orders:', error);
    return { success: false, message: 'Failed to add sample orders', error };
  }
};

export const clearSampleOrders = async () => {
  try {
    console.log('Clearing sample orders from database...');
    
    const orders = await dataAccess.getOrders();
    const sampleOrderNumbers = sampleOrders.map(order => order.order_number);
    
    for (const order of orders) {
      if (sampleOrderNumbers.includes(order.order_number)) {
        await dataAccess.deleteOrder(order.id);
        console.log(`Deleted order: ${order.order_number}`);
      }
    }
    
    console.log('Sample orders cleared successfully!');
    return { success: true, message: 'Sample orders cleared successfully' };
  } catch (error) {
    console.error('Error clearing sample orders:', error);
    return { success: false, message: 'Failed to clear sample orders', error };
  }
};


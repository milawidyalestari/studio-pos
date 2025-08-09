// Service untuk menambahkan data langsung ke localStorage
export const addOrdersToLocalStorage = (orders: any[]) => {
  try {
    const existingOrders = JSON.parse(localStorage.getItem('studio_pos_orders') || '[]');
    const newOrders = [...existingOrders, ...orders];
    localStorage.setItem('studio_pos_orders', JSON.stringify(newOrders));
    console.log(`✅ Added ${orders.length} orders to localStorage`);
    return { success: true, message: `Added ${orders.length} orders to localStorage` };
  } catch (error) {
    console.error('Error adding orders to localStorage:', error);
    return { success: false, message: 'Failed to add orders to localStorage', error };
  }
};

export const getOrdersFromLocalStorage = () => {
  try {
    const orders = JSON.parse(localStorage.getItem('studio_pos_orders') || '[]');
    console.log(`📋 Found ${orders.length} orders in localStorage`);
    return orders;
  } catch (error) {
    console.error('Error getting orders from localStorage:', error);
    return [];
  }
};

export const clearOrdersFromLocalStorage = () => {
  try {
    localStorage.removeItem('studio_pos_orders');
    console.log('🗑️ Cleared orders from localStorage');
    return { success: true, message: 'Cleared orders from localStorage' };
  } catch (error) {
    console.error('Error clearing orders from localStorage:', error);
    return { success: false, message: 'Failed to clear orders from localStorage', error };
  }
};

// Sample orders untuk localStorage
export const sampleOrdersForLocalStorage = [
  {
    id: 'local-001',
    order_number: 'LOCAL001',
    customer_name: 'Local Customer 1',
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
    notes: 'Local storage order 1',
    status_id: 3, // Done
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'local-002',
    order_number: 'LOCAL002',
    customer_name: 'Local Customer 2',
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
    notes: 'Local storage order 2',
    status_id: 2, // Processing
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'local-003',
    order_number: 'LOCAL003',
    customer_name: 'Local Customer 3',
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
    notes: 'Local storage order 3',
    status_id: 1, // Pending
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const addSampleOrdersToLocalStorage = () => {
  return addOrdersToLocalStorage(sampleOrdersForLocalStorage);
};

export const clearSampleOrdersFromLocalStorage = () => {
  try {
    const orders = getOrdersFromLocalStorage();
    const sampleOrderNumbers = ['LOCAL001', 'LOCAL002', 'LOCAL003'];
    const filteredOrders = orders.filter(order => !sampleOrderNumbers.includes(order.order_number));
    localStorage.setItem('studio_pos_orders', JSON.stringify(filteredOrders));
    console.log('🗑️ Cleared sample orders from localStorage');
    return { success: true, message: 'Cleared sample orders from localStorage' };
  } catch (error) {
    console.error('Error clearing sample orders from localStorage:', error);
    return { success: false, message: 'Failed to clear sample orders from localStorage', error };
  }
};


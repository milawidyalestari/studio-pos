import { dataAccess } from '@/lib/data-access';

export const addTestOrders = async () => {
  try {
    console.log('Adding test orders to database...');
    
    const testOrders = [
      {
        order_number: 'TEST001',
        customer_name: 'Test Customer 1',
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
        notes: 'Test order 1',
        status_id: 3 // Done
      },
      {
        order_number: 'TEST002',
        customer_name: 'Test Customer 2',
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
        notes: 'Test order 2',
        status_id: 2 // Processing
      },
      {
        order_number: 'TEST003',
        customer_name: 'Test Customer 3',
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
        notes: 'Test order 3',
        status_id: 1 // Pending
      }
    ];

    for (const order of testOrders) {
      await dataAccess.createOrder(order);
      console.log(`Added test order: ${order.order_number}`);
    }
    
    console.log('Test orders added successfully!');
    return { success: true, message: 'Test orders added successfully' };
  } catch (error) {
    console.error('Error adding test orders:', error);
    return { success: false, message: 'Failed to add test orders', error };
  }
};

export const clearTestOrders = async () => {
  try {
    console.log('Clearing test orders from database...');
    
    const orders = await dataAccess.getOrders();
    const testOrderNumbers = ['TEST001', 'TEST002', 'TEST003'];
    
    for (const order of orders) {
      if (testOrderNumbers.includes(order.order_number)) {
        await dataAccess.deleteOrder(order.id);
        console.log(`Deleted test order: ${order.order_number}`);
      }
    }
    
    console.log('Test orders cleared successfully!');
    return { success: true, message: 'Test orders cleared successfully' };
  } catch (error) {
    console.error('Error clearing test orders:', error);
    return { success: false, message: 'Failed to clear test orders', error };
  }
};


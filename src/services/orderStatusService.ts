
import { supabase } from '@/integrations/supabase/client';

export const updateOrderStatusInDatabase = async (orderId: string, newStatus: string) => {
  try {
    console.log('Updating order status in database:', orderId, newStatus);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Database error updating order status:', error);
      throw error;
    }

    console.log('Order status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating order status in database:', error);
    throw error;
  }
};

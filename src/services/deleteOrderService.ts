
import { supabase } from '@/integrations/supabase/client';

export const deleteOrderFromDatabase = async (orderId: string) => {
  try {
    console.log('Deleting order from database:', orderId);
    
    // First delete order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw itemsError;
    }

    // Then delete the order
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Database error deleting order:', error);
      throw error;
    }

    console.log('Order deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting order from database:', error);
    throw error;
  }
};

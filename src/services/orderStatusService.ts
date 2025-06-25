import { supabase } from '@/integrations/supabase/client';
import { getStatusIdByName } from '@/utils/getStatusId';

export const updateOrderStatusInDatabase = async (orderId: string, statusName: string) => {
  try {
    const status_id = await getStatusIdByName(statusName);
    if (!status_id) throw new Error('Status not found');

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Database error updating order status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating order status in database:', error);
    throw error;
  }
};

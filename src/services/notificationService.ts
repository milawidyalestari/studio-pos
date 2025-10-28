import { databaseService } from '@/services/databaseService';
import { Notification } from '@/hooks/useNotifications';

export class NotificationService {
  // Create notification for order creation
  static async createOrderCreatedNotification(orderId: string, employeeId: string) {
    try {
      // Get employee name
      const { data: employee } = await supabase
        .from('employees')
        .select('name')
        .eq('id', employeeId)
        .single();

      const userName = employee?.name || 'Unknown User';

      const notification = {
        message: `${userName} - Menambahkan Orderan Baru`,
        type: 'order_created' as const,
        order_id: orderId,
        user_name: userName,
        order_data: null
      };

      await this.insertNotification(notification);
    } catch (error) {
      console.error('Error creating order created notification:', error);
    }
  }

  // Create notification for order deletion
  static async createOrderDeletedNotification(orderId: string, employeeId: string) {
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('name')
        .eq('id', employeeId)
        .single();

      const userName = employee?.name || 'Unknown User';

      const notification = {
        message: `${userName} - Menghapus Orderan`,
        type: 'order_deleted' as const,
        order_id: orderId,
        user_name: userName,
        order_data: null
      };

      await this.insertNotification(notification);
    } catch (error) {
      console.error('Error creating order deleted notification:', error);
    }
  }

  // Create notification for order status update
  static async createOrderStatusUpdateNotification(
    orderId: string, 
    employeeId: string, 
    oldStatus: string, 
    newStatus: string
  ) {
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('name')
        .eq('id', employeeId)
        .single();

      const userName = employee?.name || 'Unknown User';

      let message = '';
      let type: Notification['type'] = 'order_updated';

      if (newStatus === 'processing') {
        message = `${userName} - Orderan Di Proses`;
        type = 'order_processing';
      } else if (newStatus === 'completed') {
        message = `${userName} - Orderan Selesai`;
        type = 'order_completed';
      } else {
        message = `${userName} - Update Orderan -> Status: ${newStatus}`;
        type = 'order_updated';
      }

      const notification = {
        message,
        type,
        order_id: orderId,
        user_name: userName,
        order_data: null
      };

      await this.insertNotification(notification);
    } catch (error) {
      console.error('Error creating order status update notification:', error);
    }
  }

  // Create notification for general order update
  static async createOrderUpdateNotification(orderId: string, employeeId: string) {
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('name')
        .eq('id', employeeId)
        .single();

      const userName = employee?.name || 'Unknown User';

      const notification = {
        message: `${userName} - Update Orderan`,
        type: 'order_updated' as const,
        order_id: orderId,
        user_name: userName,
        order_data: null
      };

      await this.insertNotification(notification);
    } catch (error) {
      console.error('Error creating order update notification:', error);
    }
  }

  // Insert notification into database
  private static async insertNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          timestamp: new Date().toISOString(),
          is_read: false
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error inserting notification:', error);
    }
  }

  // Get unread count
  static async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}



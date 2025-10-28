import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

export interface Notification {
  id: string;
  message: string;
  type: 'order_created' | 'order_deleted' | 'order_updated' | 'order_processing' | 'order_completed';
  order_id?: string;
  user_name: string;
  timestamp: string;
  is_read: boolean;
  order_data?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching notifications...');
      const data = await databaseService.query<Notification>('notifications', {
        orderBy: { column: 'timestamp', direction: 'desc' },
        limit: 50
      });
      
      console.log('✅ Fetched notifications:', data?.length || 0);
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: Notification) => !n.is_read).length || 0);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setError(`Failed to fetch notifications: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await databaseService.update('notifications', notificationId, { is_read: true });

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Get all unread notifications first
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      // Update each unread notification
      for (const notification of unreadNotifications) {
        await databaseService.update('notifications', notification.id, { is_read: true });
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) => {
    try {
      const newNotification = {
        ...notification,
        timestamp: new Date().toISOString(),
        is_read: false
      };

      console.log('📝 Adding notification:', newNotification);
      const data = await databaseService.create<Notification>('notifications', newNotification);

      console.log('✅ Notification added successfully:', data);
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error adding notification:', error);
    }
  };

  // Poll for new notifications
  useEffect(() => {
    console.log('🔍 Setting up notification polling...');
    
    // Initial fetch
    fetchNotifications();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      console.log('🔌 Cleaning up notification polling...');
      clearInterval(interval);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    fetchNotifications
  };
};

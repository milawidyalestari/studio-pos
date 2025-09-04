import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        setError(`Failed to fetch notifications: ${error.message}`);
        return;
      }
      
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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

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
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
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
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotification])
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding notification:', error);
        return;
      }

      console.log('✅ Notification added successfully:', data);
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error adding notification:', error);
    }
  };

  // Listen for real-time order changes
  useEffect(() => {
    console.log('🔍 Setting up real-time notifications...');
    
    const channel = supabase
      .channel('order_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('📡 Real-time event received:', payload);
          console.log('📊 Event type:', payload.eventType);
          console.log('📊 Old data:', payload.old);
          console.log('📊 New data:', payload.new);
          
          try {
            let message = '';
            let type: Notification['type'] = 'order_updated';
            let orderData = payload.new || payload.old;

            // Get user information - try multiple possible field names
            let userName = 'Unknown User';
            const possibleEmployeeFields = ['employee_id', 'admin_id', 'desainer_id', 'user_id'];
            
            for (const field of possibleEmployeeFields) {
              if (orderData?.[field]) {
                console.log(`🔍 Found employee field: ${field} = ${orderData[field]}`);
                const { data: employee } = await supabase
                  .from('employees')
                  .select('name')
                  .eq('id', orderData[field])
                  .single();
                if (employee) {
                  userName = employee.name;
                  console.log(`✅ Found employee name: ${userName}`);
                  break;
                }
              }
            }

            // If no employee found, try to get from auth context
            if (userName === 'Unknown User') {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                userName = user.email || 'Authenticated User';
                console.log(`👤 Using auth user: ${userName}`);
              }
            }

            switch (payload.eventType) {
              case 'INSERT':
                message = `${userName} - Menambahkan Orderan Baru`;
                type = 'order_created';
                break;
              case 'DELETE':
                message = `${userName} - Menghapus Orderan`;
                type = 'order_deleted';
                break;
              case 'UPDATE':
                // Check multiple possible status fields
                const statusFields = ['status_id', 'status', 'order_status'];
                let oldStatus = null;
                let newStatus = null;
                
                for (const field of statusFields) {
                  if (payload.old?.[field] !== undefined || payload.new?.[field] !== undefined) {
                    oldStatus = payload.old?.[field];
                    newStatus = payload.new?.[field];
                    console.log(`📊 Status change detected in field '${field}': ${oldStatus} → ${newStatus}`);
                    break;
                  }
                }
                
                if (oldStatus !== newStatus) {
                  if (newStatus === 'processing' || newStatus === 2) {
                    message = `${userName} - Orderan Di Proses`;
                    type = 'order_processing';
                  } else if (newStatus === 'completed' || newStatus === 3) {
                    message = `${userName} - Orderan Selesai`;
                    type = 'order_completed';
                  } else {
                    message = `${userName} - Update Orderan -> Status: ${newStatus}`;
                    type = 'order_updated';
                  }
                } else {
                  message = `${userName} - Update Orderan`;
                  type = 'order_updated';
                }
                break;
            }

            if (message) {
              console.log('📝 Creating notification:', message);
              await addNotification({
                message,
                type,
                order_id: (orderData as any)?.id,
                user_name: userName,
                order_data: orderData
              });
            } else {
              console.log('⚠️ No message generated for this event');
            }
          } catch (error) {
            console.error('❌ Error processing order notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time notifications enabled');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
          setError('Real-time notifications not available');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Real-time subscription timed out');
          setError('Real-time connection timed out');
        }
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
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

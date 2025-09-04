import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const NotificationPopover: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    markAllAsRead,
    fetchNotifications
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_created':
        return '🆕';
      case 'order_deleted':
        return '🗑️';
      case 'order_updated':
        return '✏️';
      case 'order_processing':
        return '⚡';
      case 'order_completed':
        return '✅';
      default:
        return '📢';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
        >
          <Bell className="h-4 w-4 mr-2" />
          Inbox
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Notifikasi</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
              Memuat notifikasi...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4 mx-auto mb-2 text-red-500" />
              Gagal memuat notifikasi
              <br />
              <span className="text-xs">{error}</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Tidak ada notifikasi
              <br />
              <span className="text-xs">Tidak ada notifikasi</span>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    notification.is_read ? 'bg-white' : 'bg-blue-50'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium ${
                          notification.is_read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <Badge 
                            variant="secondary" 
                            className="ml-2 text-xs px-1 py-0 h-4"
                          >
                            Baru
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {notification.user_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                            locale: id
                          })}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {notifications.length} notifikasi • {unreadCount} belum dibaca
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;

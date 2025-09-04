import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Inbox, Bell, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InboxSectionProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const InboxSection: React.FC<InboxSectionProps> = ({ collapsed, onToggleCollapse }) => {
  // Mock data for inbox items - in a real app, this would come from your data source
  const inboxItems = [
    {
      id: 1,
      type: 'notification',
      title: 'New Order #1234',
      message: 'Customer John Doe placed a new order',
      time: '2 min ago',
      unread: true,
    },
    {
      id: 2,
      type: 'message',
      title: 'Low Stock Alert',
      message: 'Product "Coffee Beans" is running low',
      time: '15 min ago',
      unread: true,
    },
    {
      id: 3,
      type: 'notification',
      title: 'Payment Received',
      message: 'Payment for order #1230 has been received',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const unreadCount = inboxItems.filter(item => item.unread).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Mail className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-6 w-6 p-0"
          >
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="flex-1 pt-0 overflow-hidden">
          <div className="space-y-2 overflow-y-auto h-full">
            {inboxItems.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No new messages</p>
              </div>
            ) : (
              inboxItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                    item.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 ${item.unread ? 'text-blue-600' : 'text-gray-400'}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-sm font-medium truncate ${
                          item.unread ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {item.title}
                        </h4>
                        {item.unread && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {item.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </div>
  );
};

export default InboxSection;


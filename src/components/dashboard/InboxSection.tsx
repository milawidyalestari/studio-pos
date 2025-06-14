import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Filter } from 'lucide-react';

interface InboxMessage {
  id: string;
  type: string;
  customer: string;
  time: string;
  message: string;
  unread: boolean;
}

const InboxSection = () => {
  const inboxMessages: InboxMessage[] = [
    {
      id: '1',
      type: 'Requested Design',
      customer: 'Kom 3',
      time: 'Jun 26 • Pak Tut Lanji',
      message: 'Spanduk Me Kolor',
      unread: true
    },
    {
      id: '2',
      type: 'Requested File',
      customer: 'Kom 1',
      time: 'Jun 26 • Choirull',
      message: 'Cek File Premium',
      unread: true
    },
    {
      id: '3',
      type: 'Requested Send Confirmation',
      customer: 'Kom 2',
      time: 'Jun 26 • Sri Asri',
      message: 'File Happy Wedding...',
      unread: true
    },
    {
      id: '4',
      type: 'Requested File',
      customer: 'Kom 2',
      time: 'Jun 26 • Matteo',
      message: 'Spanduk Cafe Teduh',
      unread: false
    }
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-[#0050C8]" />
              Inbox
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="flex-1 min-h-0 pt-0 pb-4 px-4">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-2">
            {inboxMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  message.unread ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    message.unread ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.customer} {message.type}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">{message.time}</p>
                    <p className="text-sm text-gray-600 truncate">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
};

export default InboxSection;

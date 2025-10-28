import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Zap, Plus } from 'lucide-react';
import { useHasAccess } from '@/context/RoleAccessContext';

interface QuickAccessSectionProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onTambahOrderClick?: () => void;
}

const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({ 
  collapsed, 
  onToggleCollapse,
  onTambahOrderClick
}) => {
  const hasAccess = useHasAccess();

  const quickActions = [
    {
      title: 'Tambah Order',
      description: 'Buat orderan baru',
      icon: Plus,
      href: '/orderan',
      color: 'bg-blue-500 hover:bg-blue-600',
      access: 'Orderan'
    }
  ];

  const handleQuickAction = (href: string, actionTitle: string) => {
    if (actionTitle === 'Tambah Order' && onTambahOrderClick) {
      onTambahOrderClick();
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Access
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
            {quickActions.map((action, index) => {
              if (!hasAccess(action.access, 'view')) return null;
              
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleQuickAction(action.href, action.title)}
                  className="w-full justify-start p-3 h-auto hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm text-gray-900">
                        {action.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      )}
    </div>
  );
};

export default QuickAccessSection;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  item: any;
  showView?: boolean;
  onAction: (action: string, item?: any) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  item, 
  showView = true, 
  onAction 
}) => (
  <div className="flex items-center space-x-1">
    {showView && (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('view', item)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )}
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => onAction('edit', item)}
      className="h-8 w-8 p-0"
    >
      <Edit className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => onAction('delete', item)}
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

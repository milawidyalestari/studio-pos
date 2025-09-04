import React from 'react';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { notaPrintService } from '../services/notaPrintService';

export interface NotaPrintStatusBadgeProps {
  orderNumber: string;
  receiptPrinted: boolean;
  onStatusChange?: (newStatus: boolean) => void;
  showResetButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NotaPrintStatusBadge: React.FC<NotaPrintStatusBadgeProps> = ({
  orderNumber,
  receiptPrinted,
  onStatusChange,
  showResetButton = false,
  size = 'md'
}) => {
  const handleResetStatus = async () => {
    try {
      const result = await notaPrintService.resetNotaPrintStatus(orderNumber);
      if (result.success && onStatusChange) {
        onStatusChange(false);
      }
    } catch (error) {
      console.error('Error resetting nota print status:', error);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-2';
      default:
        return 'text-sm px-2 py-1';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  if (receiptPrinted) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className={`bg-orange-50 text-green-700 border-green-200 ${getSizeClasses()}`}
        >
          <FileText className={`${getIconSize()} mr-1`} />
          Sudah di-print
        </Badge>
        {showResetButton && (
          <Button
            variant="outline"
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'default' : 'sm'}
            onClick={handleResetStatus}
            className="h-auto px-2 text-xs"
          >
            Reset
          </Button>
        )}
      </div>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-green-50 text-orange-700 border-orange-200 ${getSizeClasses()}`}
    >
      <CheckCircle className={`${getIconSize()} mr-1`} />
      Belum di-print
    </Badge>
  );
};

export default NotaPrintStatusBadge;

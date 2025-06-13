import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant,
  className 
}) => {
  const getVariantClasses = (status: string, variant?: string) => {
    if (variant) {
      const variantClasses = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800',
      };
      return variantClasses[variant] || variantClasses.default;
    }

    // Auto-detect based on status text
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('completed') || statusLower.includes('active') || statusLower.includes('ready')) {
      return 'bg-green-100 text-green-800';
    }
    
    if (statusLower.includes('pending') || statusLower.includes('waiting')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    if (statusLower.includes('error') || statusLower.includes('failed') || statusLower.includes('inactive')) {
      return 'bg-red-100 text-red-800';
    }
    
    if (statusLower.includes('progress') || statusLower.includes('processing')) {
      return 'bg-blue-100 text-blue-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={cn(getVariantClasses(status, variant), className)}>
      {status}
    </Badge>
  );
};
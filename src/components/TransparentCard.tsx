import React from 'react';
import { cn } from '@/lib/utils';

interface TransparentCardProps {
  children: React.ReactNode;
  className?: string;
}

export const TransparentCard: React.FC<TransparentCardProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "rounded-lg border border-white/10 bg-white/5 backdrop-blur-md shadow-lg",
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </div>
  );
};

interface TransparentCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TransparentCardHeader: React.FC<TransparentCardHeaderProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  );
};

interface TransparentCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TransparentCardContent: React.FC<TransparentCardContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};

interface TransparentCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const TransparentCardTitle: React.FC<TransparentCardTitleProps> = ({ 
  children, 
  className 
}) => {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
};

interface TransparentCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const TransparentCardDescription: React.FC<TransparentCardDescriptionProps> = ({ 
  children, 
  className 
}) => {
  return (
    <p className={cn("text-sm text-white/70", className)}>
      {children}
    </p>
  );
};

export default TransparentCard;

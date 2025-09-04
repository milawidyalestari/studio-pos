import React from 'react';
import { MessageCircle } from 'lucide-react';
import { openWhatsApp, isValidPhoneNumber } from '@/utils/whatsapp';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phoneNumber: string;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  title?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  className,
  showIcon = true,
  children,
  title = "Klik untuk membuka WhatsApp"
}) => {
  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    return <span className="text-gray-500">{phoneNumber || '-'}</span>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWhatsApp(phoneNumber);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors",
        className
      )}
      title={title}
      type="button"
    >
      {showIcon && <MessageCircle className="w-4 h-4" />}
      {children || phoneNumber}
    </button>
  );
};

export default WhatsAppButton;

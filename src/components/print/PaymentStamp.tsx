import React from 'react';
import { NotaSettingsData } from '../../utils/notaSettings';

interface PaymentStampProps {
  isLunas: boolean;
  settings: NotaSettingsData['stamp'];
}

export const PaymentStamp: React.FC<PaymentStampProps> = ({ isLunas, settings }) => {
  if (!settings.enabled) {
    return null;
  }

  // Only show stamp for "Lunas" status
  if (!isLunas) {
    return null;
  }

  const imageUrl = settings.lunasImageUrl;

  // Determine position styles
  const getPositionStyles = (position: string) => {
    switch (position) {
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'center':
        return { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
      default:
        return { top: '20px', right: '20px' };
    }
  };

  const positionStyles = getPositionStyles(settings.position);

  // Common container styles
  const containerStyles = {
    position: 'absolute' as const,
    opacity: settings.opacity,
    pointerEvents: 'none' as const,
    zIndex: 10,
    ...positionStyles
  };

  // Only render image stamp if useImage is true and imageUrl is provided
  if (settings.useImage && imageUrl) {
    return (
      <div style={containerStyles}>
        <img
          src={imageUrl}
          alt="Lunas Stamp"
          style={{
            width: `${settings.size}px`,
            height: `${settings.size}px`,
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // If no image configured or useImage is false, don't show anything
  return null;
};

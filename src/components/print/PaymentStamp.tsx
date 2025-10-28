import React from 'react';
import { NotaSettingsData } from '../../utils/notaSettings';
import { getStrukSettings } from '../../utils/strukSettings';

interface PaymentStampProps {
  isLunas: boolean;
  settings: NotaSettingsData['stamp'];
}

export const PaymentStamp: React.FC<PaymentStampProps> = ({ isLunas, settings }) => {
  const strukSettings = getStrukSettings();
  
  // Use struk settings for lunas logo
  if (!strukSettings.struk.showLunasLogo) {
    return null;
  }

  // Only show stamp for "Lunas" status
  if (!isLunas) {
    return null;
  }

  const imageUrl = strukSettings.struk.lunasLogo.url;

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

  // Only render image stamp if imageUrl is provided from struk settings
  if (imageUrl && imageUrl.trim() !== '') {
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
          onError={(e) => {
            console.error('Lunas stamp failed to load:', imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // If no image configured, don't show anything
  return null;
};

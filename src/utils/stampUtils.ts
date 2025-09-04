import { getNotaSettings, saveNotaSettings, NotaSettingsData } from './notaSettings';

/**
 * Utility functions for managing payment stamp settings
 */

export interface StampConfiguration {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  opacity: number;
  size: number;
  useImage: boolean;
  lunasImageUrl: string;
}

/**
 * Get current stamp configuration
 */
export const getStampSettings = (): StampConfiguration => {
  const settings = getNotaSettings();
  return settings.stamp;
};

/**
 * Update stamp configuration
 */
export const updateStampSettings = (stampConfig: Partial<StampConfiguration>): void => {
  const currentSettings = getNotaSettings();
  const newSettings: NotaSettingsData = {
    ...currentSettings,
    stamp: { ...currentSettings.stamp, ...stampConfig }
  };
  saveNotaSettings(newSettings);
};

/**
 * Default stamp configuration
 */
export const defaultStampConfig: StampConfiguration = {
  enabled: true,
  position: 'top-right',
  opacity: 0.7,
  size: 120,
  useImage: false,
  lunasImageUrl: ''
};

/**
 * Calculate payment status from order data
 */
export const calculatePaymentStatus = (orderData: {
  desain?: number;
  biayaLainnya?: number;
  downPayment?: number;
  pelunasan?: number;
}, orderList: Array<{ subTotal: number }>, selectedItems: string[] = []): boolean => {
  const selectedOrderItems = selectedItems.length === 0 
    ? orderList 
    : orderList.filter((_, index) => selectedItems.includes(index.toString()));
  
  const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  const total = subtotal + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0);
  const remaining = total - (orderData?.downPayment || 0) - (orderData?.pelunasan || 0);
  
  return remaining <= 0;
};

/**
 * Generate CSS for stamp positioning
 */
export const getStampPositionCSS = (position: string): React.CSSProperties => {
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

/**
 * Validate stamp configuration
 */
export const validateStampConfig = (config: Partial<StampConfiguration>): string[] => {
  const errors: string[] = [];
  
  if (config.size !== undefined && (config.size < 50 || config.size > 300)) {
    errors.push('Ukuran stamp harus antara 50-300px');
  }
  
  if (config.opacity !== undefined && (config.opacity < 0.1 || config.opacity > 1)) {
    errors.push('Opacity harus antara 0.1-1.0');
  }
  
  if (config.useImage && config.lunasImageUrl && !isValidImageUrl(config.lunasImageUrl)) {
    errors.push('URL gambar lunas tidak valid');
  }
  
  return errors;
};

/**
 * Check if URL is a valid image URL
 */
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const extension = urlObj.pathname.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(extension || '');
  } catch {
    return false;
  }
};



/**
 * Reset stamp settings to default
 */
export const resetStampToDefault = (): void => {
  updateStampSettings(defaultStampConfig);
};

/**
 * Export current stamp configuration as JSON
 */
export const exportStampConfig = (): string => {
  const config = getStampSettings();
  return JSON.stringify(config, null, 2);
};

/**
 * Import stamp configuration from JSON
 */
export const importStampConfig = (jsonConfig: string): boolean => {
  try {
    const config = JSON.parse(jsonConfig);
    const errors = validateStampConfig(config);
    
    if (errors.length === 0) {
      updateStampSettings(config);
      return true;
    } else {
      console.error('Invalid stamp configuration:', errors);
      return false;
    }
  } catch (error) {
    console.error('Failed to parse stamp configuration:', error);
    return false;
  }
};

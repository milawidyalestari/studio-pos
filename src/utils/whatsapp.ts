/**
 * Utility functions for WhatsApp integration
 */

/**
 * Opens WhatsApp with a specific phone number
 * @param phoneNumber - The phone number to open WhatsApp with (can include country code)
 * @param message - Optional message to pre-fill
 */
export const openWhatsApp = (phoneNumber: string, message?: string): void => {
  // Remove any non-digit characters except + and -
  let cleanNumber = phoneNumber.replace(/[^\d+\-]/g, '');
  
  // If number doesn't start with +, assume it's Indonesian (+62)
  if (!cleanNumber.startsWith('+')) {
    // Remove leading 0 and add +62
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '+62' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('62')) {
      cleanNumber = '+' + cleanNumber;
    } else {
      cleanNumber = '+62' + cleanNumber;
    }
  }
  
  // Remove any remaining non-digit characters except +
  cleanNumber = cleanNumber.replace(/[^\d+]/g, '');
  
  // Construct WhatsApp URL
  let whatsappUrl = `https://wa.me/${cleanNumber}`;
  
  if (message) {
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    whatsappUrl += `?text=${encodedMessage}`;
  }
  
  // Open WhatsApp in new tab/window
  window.open(whatsappUrl, '_blank');
};

/**
 * Formats phone number for display
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '-';
  
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length === 0) return '-';
  
  // Format Indonesian phone number
  if (cleanNumber.startsWith('62')) {
    return `+${cleanNumber}`;
  } else if (cleanNumber.startsWith('0')) {
    return `+62${cleanNumber.substring(1)}`;
  } else {
    return cleanNumber;
  }
};

/**
 * Checks if a string looks like a valid phone number
 * @param phoneNumber - The string to check
 * @returns True if it looks like a valid phone number
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if it has reasonable length (7-15 digits)
  return cleanNumber.length >= 7 && cleanNumber.length <= 15;
};

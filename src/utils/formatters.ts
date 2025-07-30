export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  
  if (isNaN(numAmount)) return 'IDR 0';
  
  return `IDR ${numAmount.toLocaleString('id-ID')}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return dateObj.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return dateObj.toLocaleString('id-ID', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indonesian phone numbers
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+62${cleaned.slice(1)}`;
  }
  
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `#${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
};
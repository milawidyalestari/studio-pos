
// Legacy pricing functions - kept for backward compatibility
// New pricing should use productPricing.ts with actual database products

export const formatCurrency = (amount: number): string => {
  return `IDR ${amount.toLocaleString('id-ID')}`;
};

// Deprecated: Use productPricing.ts instead
export const calculateItemPrice = (
  panjang: number,
  lebar: number,
  quantity: number,
  material: string = 'banner',
  finishing: string = ''
): number => {
  console.warn('calculateItemPrice is deprecated. Use calculateProductPrice from productPricing.ts instead.');
  
  // Fallback calculation for legacy compatibility
  const panjangM = panjang / 1000;
  const lebarM = lebar / 1000;
  const area = panjangM * lebarM;
  const basePrice = area * 50000; // Default base price
  
  return Math.round(basePrice * quantity);
};

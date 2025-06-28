
// Master data for pricing calculations
export const MASTER_PRICING = {
  // Price per square meter in IDR
  BASE_PRICE_PER_SQM: 50000,
  
  // Material multipliers
  MATERIAL_MULTIPLIERS: {
    'vinyl': 1.2,
    'banner': 1.0,
    'sticker': 0.8,
    'canvas': 1.5,
    'paper': 0.5,
  },
  
  // Finishing costs
  FINISHING_COSTS: {
    'laminating': 10000,
    'cutting': 5000,
    'mounting': 15000,
    'grommets': 8000,
  }
};

export const calculateItemPrice = (
  panjang: number,
  lebar: number,
  quantity: number,
  material: string = 'banner',
  finishing: string = ''
): number => {
  // Convert dimensions from mm to meters
  const panjangM = panjang / 1000;
  const lebarM = lebar / 1000;
  
  // Calculate area in square meters
  const area = panjangM * lebarM;
  
  // Get material multiplier
  const materialMultiplier = MASTER_PRICING.MATERIAL_MULTIPLIERS[material.toLowerCase()] || 1.0;
  
  // Calculate base price
  let basePrice = area * MASTER_PRICING.BASE_PRICE_PER_SQM * materialMultiplier;
  
  // Add finishing costs
  const finishingCost = MASTER_PRICING.FINISHING_COSTS[finishing.toLowerCase()] || 0;
  
  // Calculate total for all quantities
  const totalPrice = (basePrice + finishingCost) * quantity;
  
  return Math.round(totalPrice);
};

export const formatCurrency = (amount: number): string => {
  return `IDR ${amount.toLocaleString('id-ID')}`;
};

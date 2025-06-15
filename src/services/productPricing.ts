
import { Product } from '@/hooks/useProducts';

export const calculateProductPrice = (
  product: Product,
  quantity: number,
  panjang?: number,
  lebar?: number
): number => {
  if (!product || quantity <= 0) return 0;

  let basePrice = product.harga_jual || 0;
  
  // For materials that are sold by area (like vinyl, banner, etc.)
  if (product.jenis === 'Material' && panjang && lebar) {
    // Convert dimensions from mm to meters
    const panjangM = panjang / 1000;
    const lebarM = lebar / 1000;
    const area = panjangM * lebarM;
    
    // Price per square meter
    basePrice = basePrice * area;
  }
  
  // Calculate total price
  const totalPrice = basePrice * quantity;
  
  console.log('Price calculation:', {
    product: product.nama,
    basePrice: product.harga_jual,
    quantity,
    panjang,
    lebar,
    totalPrice
  });
  
  return Math.round(totalPrice);
};

export const formatCurrency = (amount: number): string => {
  return `IDR ${amount.toLocaleString('id-ID')}`;
};

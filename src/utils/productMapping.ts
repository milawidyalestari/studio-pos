import { Product } from '@/hooks/useProducts';

export interface ProductMapping {
  kode: string;
  nama: string;
  jenis: string;
}

/**
 * Get product name from code
 */
export const getProductNameFromCode = (code: string, products: Product[]): string => {
  const product = products.find(p => p.kode === code);
  return product?.nama || code;
};

/**
 * Get product code from name
 */
export const getProductCodeFromName = (name: string, products: Product[]): string => {
  const product = products.find(p => p.nama === name);
  return product?.kode || name;
};

/**
 * Get product by code
 */
export const getProductByCode = (code: string, products: Product[]): Product | null => {
  return products.find(p => p.kode === code) || null;
};

/**
 * Get product by name
 */
export const getProductByName = (name: string, products: Product[]): Product | null => {
  return products.find(p => p.nama === name) || null;
};

/**
 * Map order items to include product names
 */
export const mapOrderItemsWithNames = (orderItems: any[], products: Product[]) => {
  return orderItems.map(item => {
    const itemProduct = getProductByCode(item.item, products);

    return {
      ...item,
      itemName: itemProduct?.nama || item.item,
    };
  });
}; 
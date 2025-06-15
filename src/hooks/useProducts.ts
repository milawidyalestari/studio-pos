
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  kode: string;
  nama: string;
  jenis: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok_opname: number;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from database...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('nama', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched successfully:', data);
      return data as Product[];
    },
  });
};

export const useProductByCode = (productCode: string) => {
  return useQuery({
    queryKey: ['product', productCode],
    queryFn: async () => {
      if (!productCode) return null;
      
      console.log('Fetching product by code:', productCode);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('kode', productCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      console.log('Product fetched:', data);
      return data as Product | null;
    },
    enabled: !!productCode,
  });
};

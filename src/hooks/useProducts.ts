
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';

export interface Product {
  id: string;
  kode: string;
  nama: string;
  jenis: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  bahan_id?: string; // field baru untuk relasi bahan
  kunci_harga?: boolean; // field baru
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from database...');
      
      const data = await databaseService.query<Product>('products', {
        orderBy: { column: 'nama', direction: 'asc' }
      });

      console.log('Products fetched successfully:', data);
      return data;
    },
  });
};

export const useProductByCode = (productCode: string) => {
  return useQuery({
    queryKey: ['product', productCode],
    queryFn: async () => {
      if (!productCode) return null;
      
      console.log('Fetching product by code:', productCode);
      
      const data = await databaseService.query<Product>('products', {
        where: { kode: productCode },
        limit: 1
      });

      console.log('Product fetched:', data);
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!productCode,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating product:', productData);
      
      const data = await databaseService.create<Product>('products', productData);

      console.log('Product created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      console.log('Updating product:', id, productData);
      
      const data = await databaseService.update<Product>('products', id, productData);

      console.log('Product updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting product:', id);
      
      await databaseService.delete('products', id);

      console.log('Product deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

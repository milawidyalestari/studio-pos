
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      console.log('Fetching product categories from database...');
      
      // First, let's check if the table exists and what data is there
      const { count, error: countError } = await supabase
        .from('product_categories')
        .select('*', { count: 'exact', head: true });
      
      console.log('Product categories table count:', count);
      if (countError) {
        console.error('Error counting product categories:', countError);
      }
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching product categories:', error);
        throw error;
      }

      console.log('Product categories fetched successfully:', data);
      console.log('Number of categories fetched:', data?.length || 0);
      
      // Additional debugging
      if (data && data.length === 0) {
        console.warn('No categories found in database. Please check if categories were saved properly.');
      }
      
      return data as ProductCategory[];
    },
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: Omit<ProductCategory, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<ProductCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

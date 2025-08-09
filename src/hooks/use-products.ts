import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dataAccess, type Product, type CreateProductData } from '@/lib/data-access';
import { databaseManager } from '@/lib/database-manager';

export const useProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get database info for environment detection
  const { data: dbInfo } = useQuery({
    queryKey: ['database-info'],
    queryFn: async () => {
      return await databaseManager.getInfo();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: products, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return await dataAccess.getProducts({
        orderBy: { column: 'nama', direction: 'asc' }
      });
    },
    refetchInterval: dbInfo?.type === 'supabase' ? 5000 : false, // Only poll for Supabase
    refetchOnWindowFocus: dbInfo?.type === 'supabase', // Only refetch on focus for Supabase
    enabled: !!dbInfo, // Only run when database info is available
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductData) => {
      return await dataAccess.createProduct(productData);
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product created successfully",
        description: `${newProduct.nama} has been added to the database.`,
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: "Error creating product",
        description: "There was an error saving the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      return await dataAccess.updateProduct(id, updates);
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product updated successfully",
        description: `${updatedProduct.nama} has been updated.`,
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: "Error updating product",
        description: "There was an error updating the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await dataAccess.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product deleted successfully",
        description: "The product has been removed from the database.",
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: "There was an error deleting the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    products: products || [],
    isLoading,
    isFetching,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    refetch,
    dbInfo, // Expose database info for UI
  };
};

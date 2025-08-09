import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dataAccess, type Supplier, type CreateSupplierData } from '@/lib/data-access';
import { databaseManager } from '@/lib/database-manager';

export const useSuppliers = () => {
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

  const { data: suppliers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      return await dataAccess.getSuppliers({
        orderBy: { column: 'name', direction: 'asc' }
      });
    },
    refetchInterval: dbInfo?.type === 'supabase' ? 5000 : false, // Only poll for Supabase
    refetchOnWindowFocus: dbInfo?.type === 'supabase', // Only refetch on focus for Supabase
    enabled: !!dbInfo, // Only run when database info is available
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (supplierData: CreateSupplierData) => {
      return await dataAccess.createSupplier(supplierData);
    },
    onSuccess: (newSupplier) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier created successfully",
        description: `${newSupplier.name} has been added to the database.`,
      });
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: "Error creating supplier",
        description: "There was an error saving the supplier. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Supplier> }) => {
      return await dataAccess.updateSupplier(id, updates);
    },
    onSuccess: (updatedSupplier) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier updated successfully",
        description: `${updatedSupplier.name} has been updated.`,
      });
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error updating supplier",
        description: "There was an error updating the supplier. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      return await dataAccess.deleteSupplier(supplierId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier deleted successfully",
        description: "The supplier has been removed from the database.",
      });
    },
    onError: (error) => {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error deleting supplier",
        description: "There was an error deleting the supplier. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    suppliers: suppliers || [],
    isLoading,
    isFetching,
    createSupplier: createSupplierMutation.mutateAsync,
    updateSupplier: updateSupplierMutation.mutateAsync,
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    isCreatingSupplier: createSupplierMutation.isPending,
    isUpdatingSupplier: updateSupplierMutation.isPending,
    isDeletingSupplier: deleteSupplierMutation.isPending,
    refetch,
    dbInfo, // Expose database info for UI
  };
};

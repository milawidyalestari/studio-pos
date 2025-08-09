import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dataAccess, type Customer, type CreateCustomerData } from '@/lib/data-access';
import { databaseManager } from '@/lib/database-manager';

export const useCustomers = () => {
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

  const { data: customers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return await dataAccess.getCustomers({
        orderBy: { column: 'nama', direction: 'asc' }
      });
    },
    refetchInterval: dbInfo?.type === 'supabase' ? 5000 : false, // Only poll for Supabase
    refetchOnWindowFocus: dbInfo?.type === 'supabase', // Only refetch on focus for Supabase
    enabled: !!dbInfo, // Only run when database info is available
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: CreateCustomerData) => {
      return await dataAccess.createCustomer(customerData);
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer created successfully",
        description: `${newCustomer.nama} has been added to the database.`,
      });
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast({
        title: "Error creating customer",
        description: "There was an error saving the customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      return await dataAccess.updateCustomer(id, updates);
    },
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer updated successfully",
        description: `${updatedCustomer.nama} has been updated.`,
      });
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast({
        title: "Error updating customer",
        description: "There was an error updating the customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return await dataAccess.deleteCustomer(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer deleted successfully",
        description: "The customer has been removed from the database.",
      });
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error deleting customer",
        description: "There was an error deleting the customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    customers: customers || [],
    isLoading,
    isFetching,
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    isCreatingCustomer: createCustomerMutation.isPending,
    isUpdatingCustomer: updateCustomerMutation.isPending,
    isDeletingCustomer: deleteCustomerMutation.isPending,
    refetch,
    dbInfo, // Expose database info for UI
  };
};

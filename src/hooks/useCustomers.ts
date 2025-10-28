
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

export const useCustomers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return await databaseService.query<Customer>('customers', {
        orderBy: { column: 'nama', direction: 'asc' }
      });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: CustomerInsert) => {
      return await databaseService.create<Customer>('customers', customerData);
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer created successfully",
        description: `${newCustomer.nama} has been added to the database.`,
      });
      return newCustomer;
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
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CustomerInsert>) => {
      return await databaseService.update<Customer>('customers', id, updateData);
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
    mutationFn: async (id: string) => {
      await databaseService.delete('customers', id);
      return id;
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
    customers,
    isLoading,
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    isCreatingCustomer: createCustomerMutation.isPending,
    isUpdatingCustomer: updateCustomerMutation.isPending,
    isDeletingCustomer: deleteCustomerMutation.isPending,
  };
};

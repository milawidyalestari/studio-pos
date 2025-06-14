
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('nama');

      if (error) throw error;
      return data as Customer[];
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: CustomerInsert) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Customer created successfully",
        description: "The customer has been added to the database.",
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

  return {
    customers,
    isLoading,
    createCustomer: createCustomerMutation.mutate,
    isCreatingCustomer: createCustomerMutation.isPending,
  };
};

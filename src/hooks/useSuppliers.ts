import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

export const useSuppliers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Supplier[];
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (supplierData: SupplierInsert) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newSupplier) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier created successfully",
        description: `${newSupplier.name} has been added to the database.`,
      });
      return newSupplier;
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
    mutationFn: async ({ id, ...updateData }: { id: string } & SupplierUpdate) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
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
    suppliers,
    isLoading,
    createSupplier: createSupplierMutation.mutateAsync,
    updateSupplier: updateSupplierMutation.mutateAsync,
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    isCreatingSupplier: createSupplierMutation.isPending,
    isUpdatingSupplier: updateSupplierMutation.isPending,
    isDeletingSupplier: deleteSupplierMutation.isPending,
  };
};
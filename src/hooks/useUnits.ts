
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Unit {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useUnits = () => {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      console.log('Fetching units from database...');
      
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching units:', error);
        throw error;
      }

      console.log('Units fetched successfully:', data);
      return data as Unit[];
    },
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('units')
        .insert([unitData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...unitData }: Partial<Unit> & { id: string }) => {
      const { data, error } = await supabase
        .from('units')
        .update(unitData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

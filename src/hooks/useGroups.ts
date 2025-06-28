
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Group {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      console.log('Fetching groups from database...');
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }

      console.log('Groups fetched successfully:', data);
      return data as Group[];
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('groups')
        .insert([groupData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...groupData }: Partial<Group> & { id: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .update(groupData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

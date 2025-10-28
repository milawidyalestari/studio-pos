
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';

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
      
      const data = await databaseService.query<Group>('groups', {
        orderBy: { column: 'name', direction: 'asc' }
      });

      console.log('Groups fetched successfully:', data);
      return data;
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => {
      return await databaseService.create<Group>('groups', groupData as Omit<Group, 'id'>);
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
      return await databaseService.update('groups', id, groupData);
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
      await databaseService.delete('groups', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';

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
      
      const data = await databaseService.query<Unit>('units', {
        orderBy: { column: 'name', direction: 'asc' }
      });

      console.log('Units fetched successfully:', data);
      return data;
    },
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
      return await databaseService.create<Unit>('units', unitData as Omit<Unit, 'id'>);
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
      return await databaseService.update('units', id, unitData);
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
      await databaseService.delete('units', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

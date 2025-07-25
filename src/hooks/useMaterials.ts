import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Material {
  id: string;
  kode: string;
  nama: string;
  satuan: string;
  lebar_maksimum?: number;
  harga_per_meter?: number;
  stok_awal: number;
  stok_masuk: number;
  stok_keluar: number;
  stok_akhir: number;
  stok_opname: number;
  stok_minimum: number;
  stok_aktif: boolean;
  kategori?: string;
  created_at: string;
  updated_at: string;
}

export const useMaterials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading, error, refetch } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      console.log('Fetching materials from database...');
      const { data, error } = await supabase
        .from('materials')
        .select('id, kode, nama, satuan, lebar_maksimum, harga_per_meter, stok_awal, stok_masuk, stok_keluar, stok_akhir, stok_opname, stok_minimum, created_at, updated_at, stok_aktif, kategori')
        .order('nama');
      
      if (error) {
        console.error('Error fetching materials:', error);
        throw error;
      }
      
      console.log('Materials fetched successfully:', data);
      return data as Material[];
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache for long
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 1000,
  });

  const createMaterial = useMutation({
    mutationFn: async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({ title: 'Success', description: 'Material berhasil ditambahkan' });
    },
    onError: (error) => {
      console.error('Error creating material:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal menambah material', 
        variant: 'destructive' 
      });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...materialData }: Partial<Material> & { id: string }) => {
      const { data, error } = await supabase
        .from('materials')
        .update(materialData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({ title: 'Success', description: 'Material berhasil diupdate' });
    },
    onError: (error) => {
      console.error('Error updating material:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal update material', 
        variant: 'destructive' 
      });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({ title: 'Success', description: 'Material berhasil dihapus' });
    },
    onError: (error) => {
      console.error('Error deleting material:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal menghapus material', 
        variant: 'destructive' 
      });
    },
  });

  return {
    materials,
    isLoading,
    error,
    refetch,
    createMaterial: createMaterial.mutateAsync,
    isCreatingMaterial: createMaterial.isPending,
    updateMaterial: updateMaterial.mutateAsync,
    isUpdatingMaterial: updateMaterial.isPending,
    deleteMaterial: deleteMaterial.mutateAsync,
    isDeletingMaterial: deleteMaterial.isPending,
  };
};
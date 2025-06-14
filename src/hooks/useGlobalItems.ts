
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlobalItem, createOrGetGlobalItem, searchGlobalItems } from '@/services/itemService';

export const useGlobalItems = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: globalItems, isLoading } = useQuery({
    queryKey: ['globalItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GlobalItem[];
    },
  });

  const createOrGetItemMutation = useMutation({
    mutationFn: createOrGetGlobalItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalItems'] });
    },
    onError: (error) => {
      console.error('Error creating/getting item:', error);
      toast({
        title: "Error managing item",
        description: "There was an error processing the item. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    globalItems,
    isLoading,
    createOrGetItem: createOrGetItemMutation.mutate,
    isCreatingItem: createOrGetItemMutation.isPending,
  };
};

export const useGlobalItemSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['globalItemsSearch', searchTerm],
    queryFn: () => searchGlobalItems(searchTerm),
    enabled: searchTerm.length > 0,
  });

  return {
    searchTerm,
    setSearchTerm,
    searchResults: searchResults || [],
    isSearching,
  };
};

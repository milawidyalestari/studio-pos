
import { supabase } from '@/integrations/supabase/client';

export interface GlobalItem {
  id: string;
  item_code: string; // ITM-000134 format
  name: string;
  description?: string;
  bahan?: string;
  standard_panjang?: number;
  standard_lebar?: number;
  standard_finishing?: string;
  created_at: string;
  updated_at: string;
}

export const generateItemCode = async (): Promise<string> => {
  // Get the highest existing item code number
  const { data, error } = await supabase
    .from('global_items')
    .select('item_code')
    .order('item_code', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching item codes:', error);
    // Fallback to random if query fails
    return `ITM-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].item_code;
    const lastNumber = parseInt(lastCode.split('-')[1]) || 0;
    nextNumber = lastNumber + 1;
  }

  return `ITM-${nextNumber.toString().padStart(6, '0')}`;
};

export const createOrGetGlobalItem = async (itemData: {
  name: string;
  description?: string;
  bahan?: string;
  panjang?: number;
  lebar?: number;
  finishing?: string;
}): Promise<GlobalItem | null> => {
  try {
    // First try to find existing item with similar properties
    const { data: existingItems, error: searchError } = await supabase
      .from('global_items')
      .select('*')
      .ilike('name', `%${itemData.name}%`)
      .eq('bahan', itemData.bahan || '')
      .eq('standard_finishing', itemData.finishing || '');

    if (searchError) {
      console.error('Error searching for existing items:', searchError);
    }

    // If we find a very similar item, return it
    if (existingItems && existingItems.length > 0) {
      const similarItem = existingItems.find(item => 
        item.name.toLowerCase().trim() === itemData.name.toLowerCase().trim() &&
        item.bahan === itemData.bahan &&
        item.standard_finishing === itemData.finishing
      );
      
      if (similarItem) {
        console.log('Found existing item:', similarItem.item_code);
        return similarItem;
      }
    }

    // Create new item if no similar one exists
    const itemCode = await generateItemCode();
    
    const { data: newItem, error: createError } = await supabase
      .from('global_items')
      .insert({
        item_code: itemCode,
        name: itemData.name,
        description: itemData.description || '',
        bahan: itemData.bahan || '',
        standard_panjang: itemData.panjang || null,
        standard_lebar: itemData.lebar || null,
        standard_finishing: itemData.finishing || ''
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating new item:', createError);
      return null;
    }

    console.log('Created new item:', newItem.item_code);
    return newItem;
  } catch (error) {
    console.error('Error in createOrGetGlobalItem:', error);
    return null;
  }
};

export const getGlobalItemByCode = async (itemCode: string): Promise<GlobalItem | null> => {
  try {
    const { data, error } = await supabase
      .from('global_items')
      .select('*')
      .eq('item_code', itemCode)
      .single();

    if (error) {
      console.error('Error fetching item by code:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getGlobalItemByCode:', error);
    return null;
  }
};

export const searchGlobalItems = async (searchTerm: string): Promise<GlobalItem[]> => {
  try {
    const { data, error } = await supabase
      .from('global_items')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,item_code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching items:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchGlobalItems:', error);
    return [];
  }
};

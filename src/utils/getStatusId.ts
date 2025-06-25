import { supabase } from '@/integrations/supabase/client';

export async function getStatusIdByName(statusName: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('order_statuses')
    .select('id')
    .eq('name', statusName)
    .single();

  if (error || !data) return null;
  return data.id;
} 
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderStatus {
  id: number;
  name: string;
}

export function useOrderStatus() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatuses() {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_statuses')
        .select('id, name')
        .order('id', { ascending: true });
      if (!error && data) {
        setStatuses(data);
      }
      setLoading(false);
    }
    fetchStatuses();
  }, []);

  return { statuses, loading };
} 
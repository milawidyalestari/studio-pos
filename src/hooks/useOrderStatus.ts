import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOrderStatus() {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatuses() {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_order_status_enum');
      if (!error && data) {
        setStatuses(data);
      }
      setLoading(false);
    }
    fetchStatuses();
  }, []);

  return { statuses, loading };
} 
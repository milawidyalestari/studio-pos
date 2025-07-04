import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimisticMove {
  orderId: string;
  originalStatus: string;
  targetStatus: string;
  timeoutId: NodeJS.Timeout;
}

export const useOptimisticKanban = () => {
  const [optimisticMoves, setOptimisticMoves] = useState<Map<string, OptimisticMove>>(new Map());
  const { toast } = useToast();
  const pendingUpdates = useRef<Map<string, Promise<void>>>(new Map());

  const addOptimisticMove = useCallback((
    orderId: string, 
    originalStatus: string, 
    targetStatus: string,
    updatePromise: Promise<void>
  ) => {
    // Clear any existing timeout for this order
    const existingMove = optimisticMoves.get(orderId);
    if (existingMove) {
      clearTimeout(existingMove.timeoutId);
    }

    // Create timeout for rollback
    const timeoutId = setTimeout(() => {
      setOptimisticMoves(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
      
      toast({
        title: 'Update timeout',
        description: 'Order status update took too long, reverting to original position',
        variant: 'destructive',
      });
    }, 7000);

    // Add the optimistic move
    setOptimisticMoves(prev => {
      const newMap = new Map(prev);
      newMap.set(orderId, {
        orderId,
        originalStatus,
        targetStatus,
        timeoutId
      });
      return newMap;
    });

    // Track the update promise
    pendingUpdates.current.set(orderId, updatePromise);

    // Handle the update result
    updatePromise
      .then(() => {
        // Success - remove from optimistic moves immediately (card stays in new position)
        setTimeout(() => {
          setOptimisticMoves(prev => {
            const newMap = new Map(prev);
            const move = newMap.get(orderId);
            if (move) {
              clearTimeout(move.timeoutId);
              newMap.delete(orderId);
            }
            return newMap;
          });
        }, 200); // Short delay to ensure smooth transition
      })
      .catch(() => {
        // Error - revert to original position
        setOptimisticMoves(prev => {
          const newMap = new Map(prev);
          const move = newMap.get(orderId);
          if (move) {
            clearTimeout(move.timeoutId);
            newMap.delete(orderId);
          }
          return newMap;
        });
        
        toast({
          title: 'Update failed',
          description: 'Failed to update order status, reverted to original position',
          variant: 'destructive',
        });
      })
      .finally(() => {
        pendingUpdates.current.delete(orderId);
      });
  }, [optimisticMoves, toast]);

  const getOptimisticStatus = useCallback((orderId: string, currentStatus: string) => {
    const move = optimisticMoves.get(orderId);
    return move ? move.targetStatus : currentStatus;
  }, [optimisticMoves]);

  const isOptimisticallyMoved = useCallback((orderId: string) => {
    return optimisticMoves.has(orderId);
  }, [optimisticMoves]);

  return {
    addOptimisticMove,
    getOptimisticStatus,
    isOptimisticallyMoved
  };
};
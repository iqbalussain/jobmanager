import { useQuery } from '@tanstack/react-query';
import { fetchJobOrders, fetchJobOrdersOptimized } from '@/services/jobOrdersApi';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { JobOrder } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';

export function useJobOrdersQuery() {
  const { user } = useAuth();

  const {
    data: jobOrders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['job-orders', user?.id],
    queryFn: async (): Promise<JobOrder[]> => {
      try {
        // Try optimized version first
        const data = await fetchJobOrdersOptimized({ limit: 100 });
        return transformJobOrderData(data);
      } catch (error) {
        console.warn('Optimized fetch failed, falling back to legacy:', error);
        // Fall back to legacy method
        const data = await fetchJobOrders();
        return transformJobOrderData(data);
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  console.log('Job orders hook state:', {
    count: jobOrders.length,
    isLoading,
    error: error?.message,
    userId: user?.id
  });

  return {
    jobOrders: jobOrders || [],
    isLoading,
    error,
    refetch
  };
}
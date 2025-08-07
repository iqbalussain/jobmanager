import { useQuery } from '@tanstack/react-query';
import { fetchJobOrdersOptimized } from '@/services/jobOrdersApi';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { JobOrder } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';

interface UseJobOrdersOptimizedOptions {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
}

export function useJobOrdersOptimized(options: UseJobOrdersOptimizedOptions = {}) {
  const { user } = useAuth();
  
  const {
    limit = 50,
    offset = 0,
    status,
    search,
    dateFrom,
    dateTo,
    enabled = true
  } = options;

  const {
    data: jobOrders = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['job-orders-optimized', user?.id, limit, offset, status, search, dateFrom, dateTo],
    queryFn: async (): Promise<JobOrder[]> => {
      const data = await fetchJobOrdersOptimized({
        limit,
        offset,
        status,
        search,
        dateFrom,
        dateTo
      });
      return transformJobOrderData(data);
    },
    enabled: !!user && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  console.log('Optimized job orders hook state:', {
    count: jobOrders.length,
    isLoading,
    isFetching,
    error: error?.message,
    userId: user?.id,
    filters: { status, search, limit, offset }
  });

  return {
    jobOrders: jobOrders || [],
    isLoading,
    isFetching,
    error,
    refetch
  };
}
import { useQuery } from '@tanstack/react-query';
import { fetchJobOrders } from '@/services/jobOrdersApi';
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
      const data = await fetchJobOrders();
      return transformJobOrderData(data);
    },
    enabled: !!user
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
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
    staleTime: 5 * 60_000,
    enabled: !!user
  });

  return {
    jobOrders: jobOrders || [],
    isLoading,
    error,
    refetch
  };
}
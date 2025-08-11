import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobOrders, fetchAllJobOrders, JobOrdersQueryOptions } from '@/services/jobOrdersApi';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { JobOrder } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';

interface UseJobOrdersQueryOptions extends JobOrdersQueryOptions {
  enabled?: boolean;
  usePagination?: boolean;
}

export function useJobOrdersQuery(options: UseJobOrdersQueryOptions = {}) {
  const { user } = useAuth();
  const { enabled = !!user, usePagination = false, ...queryOptions } = options;

  // For backward compatibility, use the legacy approach by default
  const legacyQuery = useQuery({
    queryKey: ['job-orders', user?.id, 'legacy'],
    queryFn: async (): Promise<JobOrder[]> => {
      const data = await fetchAllJobOrders();
      return transformJobOrderData(data);
    },
    enabled: enabled && !usePagination,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // New optimized query with pagination
  const paginatedQuery = useQuery({
    queryKey: ['job-orders-paginated', user?.id, queryOptions],
    queryFn: async () => {
      const result = await fetchJobOrders(queryOptions);
      return {
        ...result,
        data: transformJobOrderData(result.data)
      };
    },
    enabled: enabled && usePagination,
    staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Infinite query for virtual scrolling
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['job-orders-infinite', user?.id, queryOptions],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const result = await fetchJobOrders({ ...queryOptions, page: pageParam });
      return {
        ...result,
        data: transformJobOrderData(result.data)
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    enabled: false, // Disabled by default, enable when needed
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const activeQuery = usePagination ? paginatedQuery : legacyQuery;

  console.log('Job orders hook state:', {
    count: usePagination ? paginatedQuery.data?.data?.length : legacyQuery.data?.length,
    isLoading: activeQuery.isLoading,
    error: activeQuery.error?.message,
    userId: user?.id,
    usePagination,
    totalCount: paginatedQuery.data?.count
  });

  return useMemo(() => ({
    jobOrders: usePagination ? (paginatedQuery.data?.data || []) : (legacyQuery.data || []),
    isLoading: activeQuery.isLoading,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
    // Additional pagination info
    ...(usePagination && paginatedQuery.data && {
      totalCount: paginatedQuery.data.count,
      currentPage: paginatedQuery.data.page,
      totalPages: paginatedQuery.data.totalPages,
      pageSize: paginatedQuery.data.pageSize
    }),
    // Infinite query utilities
    infiniteQuery
  }), [
    usePagination,
    legacyQuery.data,
    paginatedQuery.data,
    activeQuery.isLoading,
    activeQuery.error,
    activeQuery.refetch,
    infiniteQuery
  ]);
}
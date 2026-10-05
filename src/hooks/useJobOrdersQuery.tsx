import { useMemo } from 'react';
import { useDexieJobs } from '@/hooks/useDexieJobs';
import { transformCachedJobOrders } from '@/utils/jobOrderTransforms';
import { JobOrder } from '@/types/jobOrder';

export function useJobOrdersQuery() {
  const { allJobs, isLoading, syncError, refresh } = useDexieJobs({}, 1, 50, true);
  const jobOrders = useMemo(() => transformCachedJobOrders(allJobs), [allJobs]);
  const error = syncError ? new Error(syncError) : null;

  return {
    jobOrders,
    isLoading,
    error,
    refetch: refresh
  };
}
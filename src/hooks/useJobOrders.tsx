
import { useJobOrdersQuery } from './useJobOrdersQuery';
import { useJobOrderMutations } from './useJobOrderMutations';

export function useJobOrders() {
  const { jobOrders, isLoading, error, refetch } = useJobOrdersQuery();
  const { updateStatus, updateJobData, approveJob, isApprovingJob } = useJobOrderMutations();

  return {
    jobOrders,
    isLoading,
    error,
    updateStatus,
    updateJobData,
    approveJob,
    isApprovingJob,
    refetch,
  };
}

export type { Customer, Designer, Salesman, JobTitle, JobOrder } from '@/types/jobOrder';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { patchJobOrderCache } from '@/services/syncService';
import { db } from '@/lib/dexieDb';
import type { JobStatus } from '@/types/jobOrder';
import { updateJobStatusThroughRpc } from '@/data/jobs';

export function useJobActions() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Set job status with role-based restrictions via RPC
  const setJobStatus = useCallback(async (jobId: string, status: JobStatus) => {
    if (!user) throw new Error('A signed-in user is required to update job status');
    if (!navigator.onLine) throw new Error('You are offline. Reconnect before changing a job status.');
    const cachedJob = await db.jobs.get(jobId);
    if (cachedJob?.status === status) {
      return {
        success: true,
        ...(cachedJob.job_order_number
          ? { job_order_number: cachedJob.job_order_number }
          : {}),
      };
    }

    let result: Awaited<ReturnType<typeof updateJobStatusThroughRpc>>;
    try {
      result = await updateJobStatusThroughRpc(jobId, status);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update job status';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      return { success: false, error: message };
    }

    if (!result.success) {
      toast({
        title: 'Status Update Failed',
        description: result.error || 'Unknown error',
        variant: 'destructive'
      });
      return result;
    }

    await patchJobOrderCache(jobId, {
      status,
      updated_at: new Date().toISOString(),
    }, user.id);

    toast({
      title: 'Status Updated',
      description: `Job status changed to ${status}`
    });

    return result;
  }, [toast, user]);

  // Check if job is locked (invoiced)
  const isJobLocked = useCallback((status: JobStatus) => {
    return status === 'invoiced';
  }, []);

  return {
    setJobStatus,
    isJobLocked
  };
}

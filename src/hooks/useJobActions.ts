import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { patchJobOrderCache } from '@/services/syncService';
import { db } from '@/lib/dexieDb';
import type { JobStatus } from '@/types/jobOrder';

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

    const { data, error } = await supabase.rpc('update_job_status', {
      p_job_id: jobId,
      p_new_status: status
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    }

    if (
      data === null ||
      typeof data !== 'object' ||
      Array.isArray(data) ||
      typeof data.success !== 'boolean'
    ) {
      throw new Error('Status update returned an invalid response');
    }

    const result = {
      success: data.success,
      ...(typeof data.error === 'string' ? { error: data.error } : {}),
      ...(typeof data.job_order_number === 'string'
        ? { job_order_number: data.job_order_number }
        : {}),
    };
    
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

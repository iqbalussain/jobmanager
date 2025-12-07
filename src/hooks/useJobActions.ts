import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { subscribeJobEdits, JobEditAudit } from '@/lib/realtime';
import { updateJobInCache } from '@/services/syncService';

export function useJobActions() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Subscribe to job edits and show toasts
  useEffect(() => {
    const handleEditEvent = (audit: JobEditAudit) => {
      const editorName = audit.edited_by_name || 'Someone';
      toast({
        title: `Job #${audit.job_order_number} updated`,
        description: `${editorName} made changes to this job.`,
        action: (
          <a href={`/?job=${audit.job_id}`} className="underline text-primary">
            View
          </a>
        ) as any,
      });
    };

    const unsubscribe = subscribeJobEdits(handleEditEvent, user?.id);
    return unsubscribe;
  }, [user?.id, toast]);

  // Set job status with role-based restrictions via RPC
  const setJobStatus = useCallback(async (jobId: string, status: string) => {
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

    const result = data as { success: boolean; error?: string; job_order_number?: string };
    
    if (!result.success) {
      toast({
        title: 'Status Update Failed',
        description: result.error || 'Unknown error',
        variant: 'destructive'
      });
      return result;
    }

    // Update Dexie cache
    await updateJobInCache(jobId, { status });

    toast({
      title: 'Status Updated',
      description: `Job status changed to ${status}`
    });

    return result;
  }, [toast]);

  // Check if job is locked (invoiced)
  const isJobLocked = useCallback((status: string) => {
    return status === 'invoiced';
  }, []);

  return {
    setJobStatus,
    isJobLocked
  };
}

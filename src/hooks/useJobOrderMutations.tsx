import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JobOrder, JobStatus } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';

export function useJobOrderMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      const { error } = await supabase
        .from('job_orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return { id, status };
    },
    
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      const previousJobOrders = queryClient.getQueryData(['job-orders', user?.id]);
      
      queryClient.setQueryData(['job-orders', user?.id], (old: JobOrder[] | undefined) => {
        if (!old) return old;
        return old.map(job => 
          job.id === id ? { ...job, status } : job
        );
      });
      
      return { previousJobOrders };
    },
      
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Job order status has been updated successfully.",
      });
    },
    onError: (error, _, context) => {
      if (context?.previousJobOrders) {
        queryClient.setQueryData(['job-orders', user?.id], context.previousJobOrders);
      }
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update job order status. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
    }
  });

  const approveJob = useMutation({
    mutationFn: async ({ jobId }: { jobId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('job_orders')
        .update({ 
          approval_status: 'approved',
          approved_by: user.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (error) throw error;
      return { jobId };
    },
    
    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      await queryClient.cancelQueries({ queryKey: ['pending-approvals'] });
      
      const previousJobOrders = queryClient.getQueryData(['job-orders', user?.id]);
      const previousPendingJobs = queryClient.getQueryData(['pending-approvals']);
      
      queryClient.setQueryData(['job-orders', user?.id], (old: JobOrder[] | undefined) => {
        if (!old) return old;
        return old.map(job => 
          job.id === jobId ? { ...job, approval_status: 'approved' } : job
        );
      });
      
      queryClient.setQueryData(['pending-approvals'], (old: any[] | undefined) => {
        if (!old) return old;
        return old.filter(job => job.id !== jobId);
      });
      
      return { previousJobOrders, previousPendingJobs };
    },
    
    onSuccess: () => {
      toast({
        title: "Job Approved",
        description: "Job has been approved successfully.",
      });
    },
    
    onError: (error, _, context) => {
      if (context?.previousJobOrders) {
        queryClient.setQueryData(['job-orders', user?.id], context.previousJobOrders);
      }
      if (context?.previousPendingJobs) {
        queryClient.setQueryData(['pending-approvals'], context.previousPendingJobs);
      }
      console.error('Failed to approve job:', error);
      toast({
        title: "Error",
        description: "Failed to approve job. Please try again.",
        variant: "destructive",
      });
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    }
  });

  const updateJobData = useMutation({
    mutationFn: async (jobData: { id: string; [key: string]: any }) => {
      const { id, ...updateData } = jobData;
      const { error } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
      return { id, ...updateData };
    },
    
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['job-orders', user?.id], (oldData: JobOrder[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(job => 
          job.id === updatedData.id 
            ? { ...job, ...updatedData }
            : job
        );
      });
      
      toast({
        title: "Job updated",
        description: "Job has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update job:', error);
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    updateStatus: updateStatus.mutate,
    updateJobData: updateJobData.mutate,
    approveJob: approveJob.mutate,
    isApprovingJob: approveJob.isPending
  };
}
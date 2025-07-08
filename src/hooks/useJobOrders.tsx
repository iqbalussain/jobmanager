
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobOrders, updateJobOrderStatus } from '@/services/jobOrdersApi';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JobOrder, JobStatus } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';

export function useJobOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      
      // Snapshot the previous value
      const previousJobOrders = queryClient.getQueryData(['job-orders', user?.id]);
      
      // Optimistically update to the new value
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
      // If the mutation fails, use the context returned from onMutate to roll back
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
      // Always refetch after error or success to sync with server state
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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      await queryClient.cancelQueries({ queryKey: ['pending-approvals'] });
      
      // Snapshot the previous values
      const previousJobOrders = queryClient.getQueryData(['job-orders', user?.id]);
      const previousPendingJobs = queryClient.getQueryData(['pending-approvals']);
      
      // Optimistically update job orders
      queryClient.setQueryData(['job-orders', user?.id], (old: JobOrder[] | undefined) => {
        if (!old) return old;
        return old.map(job => 
          job.id === jobId ? { ...job, approval_status: 'approved' } : job
        );
      });
      
      // Optimistically remove from pending approvals
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
      // Roll back optimistic updates
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
      // Always refetch to sync with server state
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
      // Update the specific job in the cache instead of refetching all
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

  console.log('Job orders hook state:', {
    count: jobOrders.length,
    isLoading,
    error: error?.message,
    userId: user?.id
  });

  return {
    jobOrders: jobOrders || [],
    isLoading,
    updateStatus: updateStatus.mutate,
    updateJobData: updateJobData.mutate,
    approveJob: approveJob.mutate,
    isApprovingJob: approveJob.isPending,
    refetch, 
  };
}

export type { Customer, Designer, Salesman, JobTitle, JobOrder } from '@/types/jobOrder';

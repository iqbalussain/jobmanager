import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { JobOrder, JobOrderUpdatePayload, JobStatus } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { updateJobOrder, updateJobOrderStatus } from '@/services/jobOrdersApi';
import { cacheJobOrder } from '@/services/syncService';
import { db } from '@/lib/dexieDb';

export function useJobOrderMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      if (!user) throw new Error('A signed-in user is required to update a job');
      const updatedJob = await updateJobOrderStatus(id, status);
      await cacheJobOrder(updatedJob, user.id);
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
      if (!user) throw new Error('A signed-in user is required to approve a job');
      const updatedJob = await updateJobOrder(jobId, {
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      });
      await cacheJobOrder(updatedJob, user.id);
      return { jobId };
    },
    
    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({ queryKey: ['job-orders'] });
      await queryClient.cancelQueries({ queryKey: ['pending-approvals'] });
      
      const previousJobOrders = queryClient.getQueryData(['job-orders', user?.id]);
      const previousPendingJobs = queryClient.getQueryData<JobOrder[]>(['pending-approvals']);
      
      queryClient.setQueryData(['job-orders', user?.id], (old: JobOrder[] | undefined) => {
        if (!old) return old;
        return old.map(job => 
          job.id === jobId ? { ...job, approval_status: 'approved' } : job
        );
      });
      
      queryClient.setQueryData<JobOrder[]>(['pending-approvals'], (old) => {
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
    mutationFn: async (jobData: JobOrderUpdatePayload) => {
      const { id, ...updateData } = jobData;
      if (!user) throw new Error('A signed-in user is required to update a job');
      const currentJob = await db.jobs.get(id);
      const updatedJob = await updateJobOrder(id, updateData);
      await cacheJobOrder(updatedJob, user.id);
      
      return { 
        id,
        changes: updateData,
        priority: updatedJob.priority,
        previousPriority: currentJob?.priority,
        job_order_number: updatedJob.job_order_number,
      };
    },
    
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['job-orders', user?.id], (oldData: JobOrder[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(job => 
          job.id === updatedData.id 
            ? { ...job, ...updatedData.changes }
            : job
        );
      });
      
      // High Priority Alert - trigger if priority changed to high
      if (updatedData.priority === 'high' && updatedData.previousPriority !== 'high') {
        addNotification({
          type: 'high_priority',
          message: `⚠ Job ${updatedData.job_order_number || ''} has been marked as HIGH PRIORITY.`,
          jobOrderNumber: updatedData.job_order_number || undefined,
          read: false
        });
      }
      
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
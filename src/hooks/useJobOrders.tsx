
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobOrders, updateJobOrderStatus } from '@/services/jobOrdersApi';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JobOrder } from '@/types/jobOrder';
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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('job_orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
      
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      toast({
        title: "Status updated",
        description: "Job order status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update job order status. Please try again.",
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
    refetch, 
  };
}

export type { Customer, Designer, Salesman, JobTitle, JobOrder } from '@/types/jobOrder';

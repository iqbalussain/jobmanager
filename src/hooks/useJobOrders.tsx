
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobOrders, updateJobOrderStatus } from '@/services/jobOrdersApi';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { useToast } from '@/hooks/use-toast';
import { JobOrder } from '@/types/jobOrder';
import { useAuth } from '@/hooks/useAuth';

export function useJobOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: jobOrders = [], isLoading, error } = useQuery({
    queryKey: ['job-orders', user?.id],
    queryFn: async (): Promise<JobOrder[]> => {
      const data = await fetchJobOrders();
      return transformJobOrderData(data);
    },
    enabled: !!user
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return updateJobOrderStatus(id, status);
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
    jobOrders,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate
  };
}

export type { Customer, Designer, Salesman, JobTitle, JobOrder } from '@/types/jobOrder';

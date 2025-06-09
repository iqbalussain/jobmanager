
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { checkAccess, validateStatusUpdate } from '@/utils/securityUtils';
import { transformJobOrderData } from '@/utils/jobOrderTransforms';
import { fetchJobOrders, updateJobOrderStatus } from '@/services/jobOrdersApi';
import { JobOrder } from '@/types/jobOrder';

export function useSecureJobOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: jobOrders = [], isLoading, error } = useQuery({
    queryKey: ['job-orders'],
    queryFn: async (): Promise<JobOrder[]> => {
      checkAccess(user);
      const data = await fetchJobOrders();
      return transformJobOrderData(data);
    },
    enabled: !!user
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      checkAccess(user);
      const { sanitizedId, sanitizedStatus } = validateStatusUpdate(id, status);
      return updateJobOrderStatus(sanitizedId, sanitizedStatus);
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
        description: error.message || "Failed to update job order status. Please try again.",
        variant: "destructive",
      });
    }
  });

  console.log('Job orders hook state:', {
    count: jobOrders.length,
    isLoading,
    error: error?.message
  });

  return {
    jobOrders,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate
  };
}

// Re-export types for backward compatibility
export type { Customer, Designer, Salesman, JobTitle, JobOrder } from '@/types/jobOrder';

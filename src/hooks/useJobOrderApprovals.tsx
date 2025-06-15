
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJobOrderApproval } from "@/services/jobOrdersApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { JobOrder } from "@/types/jobOrder";

export function useJobOrderApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin";

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authorized");
      return updateJobOrderApproval(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      toast({
        title: "Approved!",
        description: "Job order approved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve job order.",
        variant: "destructive",
      });
    }
  });

  return {
    approve: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    isAdmin,
  };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { updateJobApproval } from "@/data/jobs";
import { updateJobInCache } from "@/services/syncService";

/** Approve / reject controls for the job shown in the dashboard's Selected job card. */
export function SelectedJobApproval({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (action: "approve" | "reject") => {
      await updateJobApproval(jobId, action === "approve" ? "approved" : "rejected", userId);
      return action;
    },
    onSuccess: async (action) => {
      if (userId) {
        try { await updateJobInCache(jobId, userId); } catch (e) { console.error("Failed to update cache:", e); }
      }
      toast({ title: action === "approve" ? "Job Approved" : "Job Rejected", description: `Job order has been ${action}d successfully.` });
    },
    onError: () => toast({ title: "Error", description: "Failed to process approval. Please try again.", variant: "destructive" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });
    },
  });
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-400/30 dark:bg-amber-400/10">
      <p className="mb-2 text-xs font-medium text-amber-950 dark:text-amber-100">Awaiting approval</p>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => mutation.mutate("approve")} disabled={mutation.isPending}>
          <CheckCircle className="me-1 h-3.5 w-3.5" aria-hidden />Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => mutation.mutate("reject")} disabled={mutation.isPending}>
          <XCircle className="me-1 h-3.5 w-3.5" aria-hidden />Reject
        </Button>
      </div>
    </div>
  );
}


import { Eye, ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobOrder } from "@/types/jobOrder";
import { useJobOrderApprovals } from "@/hooks/useJobOrderApprovals";

interface PendingApprovalsProps {
  jobs: JobOrder[];
  onView: (job: JobOrder) => void;
}

export function PendingApprovals({ jobs, onView }: PendingApprovalsProps) {
  const { approve, isApproving, isAdmin } = useJobOrderApprovals();

  // Only admins should see this section
  if (!isAdmin) return null;

  const pending = jobs.filter(j => j.approval_status === "pending_approval");

  if (!pending.length) return null;

  return (
    <div className="bg-gradient-to-tr from-yellow-50 via-blue-50 to-purple-50 glass-gaming-strong border rounded-2xl shadow-lg p-6 mb-7">
      <div className="flex items-center mb-5">
        <ShieldCheck className="text-yellow-400 mr-2 w-6 h-6" />
        <h2 className="font-bold text-lg text-blue-900 tracking-tight">Pending Job Order Approvals</h2>
      </div>
      <div className="grid gap-3">
        {pending.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between bg-white/60 rounded-xl px-5 py-3"
          >
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
              <span className="font-mono font-bold text-blue-600 text-sm">#{job.job_order_number}</span>
              <span className="ml-3 font-medium text-gray-700">{job.customer?.name ?? "Unknown Customer"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                aria-label="View"
                onClick={() => onView(job)}
                className="hover:bg-blue-100"
              >
                <Eye className="w-5 h-5 text-blue-600" />
              </Button>
              {job.approval_status === "approved" ? (
                <CheckCircle className="w-6 h-6 text-yellow-400 animate-pulse" aria-label="Approved" />
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isApproving}
                  aria-label="Approve"
                  onClick={() => approve(job.id)}
                >
                  <ShieldCheck className="w-6 h-6 text-yellow-500" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

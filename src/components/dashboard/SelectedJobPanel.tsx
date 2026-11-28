import type { Job } from "@/pages/Index";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SelectedJobApproval } from "./SelectedJobApproval";
import { ArrowRight, Building2, CalendarDays, Clock, Flag, Layers, PenTool, User } from "lucide-react";

function fmtDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

interface SelectedJobPanelProps {
  job: Job | null;
  pendingJobs?: Job[];
  onOpen: (job: Job) => void;
  onSelectJob?: (job: Job) => void;
  onApprove?: (jobId: string) => void;
  onReject?: (jobId: string) => void;
  className?: string;
}

export function SelectedJobPanel({ job, onOpen, onApprove, onReject, className = "" }: SelectedJobPanelProps) {
  return (
    <section aria-label="Selected job" className={`min-w-0 rounded-lg border bg-card p-3 shadow-card ${className}`}>
      <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Layers className="h-4 w-4 text-primary" />Selected job</h2>
      {!job ? <p className="py-10 text-center text-sm text-muted-foreground">No job selected</p> : <>
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{job.jobOrderNumber}</h3><StatusBadge status={job.status} /></div>
        <p className="mt-1 break-words text-xs text-muted-foreground">{job.customer} · {job.branch || "—"}</p>
        <dl className="my-3 grid grid-cols-3 gap-x-2 gap-y-3 border-y py-3 text-xs">
          {[
            { label: "Salesman", value: job.salesman || "Unassigned", icon: User },
            { label: "Designer", value: job.designer || "Unassigned", icon: PenTool },
            { label: "Branch", value: job.branch || "—", icon: Building2 },
            { label: "Deadline", value: fmtDate(job.dueDate), icon: CalendarDays },
            { label: "Est. hours", value: job.estimatedHours ?? "—", icon: Clock },
            { label: "Priority", value: job.priority || "Normal", icon: Flag },
          ].map(({ label, value, icon: Icon }) => <div key={label} className="min-w-0"><dt className="flex items-center gap-1 text-[10px] text-muted-foreground"><Icon className="h-3 w-3 shrink-0" />{label}</dt><dd className="mt-0.5 break-words font-medium capitalize">{value}</dd></div>)}
        </dl>
        <h4 className="text-xs font-medium text-muted-foreground">Job description</h4>
        <p className="mt-1 break-words text-xs leading-relaxed">{job.title}{job.jobOrderDetails ? ` — ${job.jobOrderDetails}` : ""}</p>
        <p className="mt-3 text-[10px] text-muted-foreground">Created on <span className="block text-xs font-medium text-foreground">{fmtDate(job.createdAt)}</span></p>
        {job.approval_status === "pending_approval" && <div className="mt-3">{onApprove && onReject ? <div className="grid grid-cols-2 gap-2"><Button size="sm" onClick={() => onApprove(job.id)}>Approve</Button><Button size="sm" variant="outline" onClick={() => onReject(job.id)}>Reject</Button></div> : <SelectedJobApproval key={job.id} jobId={job.id} />}</div>}
        <Button variant="outline" size="sm" className="mt-3 w-full gap-2" onClick={() => onOpen(job)}>View full details<ArrowRight className="h-3.5 w-3.5" /></Button>
      </>}
    </section>
  );
}

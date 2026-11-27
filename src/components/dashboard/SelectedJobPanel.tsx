import type { Job } from "@/pages/Index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowRight, Building2, CalendarDays, Clock, Flag, PenTool, User } from "lucide-react";

function fmtDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Field({ icon: Icon, label, value, tone }: { icon: typeof User; label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`truncate text-xs font-medium ${tone ?? ""}`}>{value || "—"}</p>
      </div>
    </div>
  );
}

/** Read-only preview of the job picked in the Priority Work Center. */
export function SelectedJobPanel({ job, onOpen, className = "" }: { job: Job | null; onOpen: (job: Job) => void; className?: string }) {
  return (
    <Card className={`flex flex-col p-4 ${className}`} aria-label="Selected job">
      <h2 className="mb-3 text-sm font-semibold">Selected job</h2>
      {!job ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Pick a job from the work center to preview it here.</p>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold">{job.jobOrderNumber}</span>
              <StatusBadge status={job.status} />
            </div>
            <p className="truncate text-sm text-muted-foreground">{job.customer}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-y py-3 xl:grid-cols-3">
            <Field icon={User} label="Salesman" value={job.salesman ?? ""} />
            <Field icon={PenTool} label="Designer" value={job.designer ?? ""} />
            <Field icon={Building2} label="Branch" value={job.branch ?? ""} />
            <Field icon={CalendarDays} label="Deadline" value={fmtDate(job.dueDate)} />
            <Field icon={Clock} label="Est. hours" value={String(job.estimatedHours ?? "—")} />
            <Field icon={Flag} label="Priority" value={job.priority} tone={job.priority === "high" ? "text-destructive capitalize" : "capitalize"} />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] text-muted-foreground">Job</p>
            <p className="line-clamp-4 text-xs leading-relaxed">{job.title}{job.jobOrderDetails ? ` — ${job.jobOrderDetails}` : ""}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Created on</p>
            <p className="text-xs font-medium">{fmtDate(job.createdAt)}</p>
          </div>
          <Button type="button" variant="outline" className="mt-auto w-full" onClick={() => onOpen(job)}>
            View full details <ArrowRight className="ms-1 h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      )}
    </Card>
  );
}

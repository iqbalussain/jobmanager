import type { JobStatus } from "@/types/jobOrder";

export const JOB_STATUSES = Constants.public.Enums.job_status;

export const STATUS_META: Record<JobStatus, { label: string; dot: string; locked?: boolean }> = {
  pending:       { label: "Pending",      dot: "bg-amber-500" },
  "in-progress": { label: "In progress",  dot: "bg-sky-500" },
  designing:     { label: "Designing",    dot: "bg-violet-500" },
  out:           { label: "Out",          dot: "bg-orange-500" },
  completed:     { label: "Completed",    dot: "bg-emerald-500" },
  finished:      { label: "Finished",     dot: "bg-teal-500" },
  foc_sample:    { label: "FOC / Sample", dot: "bg-pink-500" },
  invoiced:      { label: "Invoiced",     dot: "bg-slate-700 dark:bg-slate-300", locked: true },
  cancelled:     { label: "Cancelled",    dot: "bg-slate-400" },
};

export const statusLabel = (s: string) => STATUS_META[s as JobStatus]?.label ?? s;

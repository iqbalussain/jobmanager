import { Constants } from "@/integrations/supabase/types";
import type { JobStatus } from "@/types/jobOrder";

export const JOB_STATUSES = Constants.public.Enums.job_status;

export const STATUS_META: Record<JobStatus, { label: string; dot: string; chip: string; locked?: boolean }> = {
  pending:       { label: "Pending",      dot: "bg-amber-500",   chip: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200" },
  designing:     { label: "Designing",    dot: "bg-violet-500",  chip: "bg-violet-100 text-violet-900 dark:bg-violet-400/15 dark:text-violet-200" },
  "in-progress": { label: "In progress",  dot: "bg-blue-500",    chip: "bg-blue-100 text-blue-900 dark:bg-blue-400/15 dark:text-blue-200" },
  out:           { label: "Out",          dot: "bg-cyan-500",    chip: "bg-cyan-100 text-cyan-900 dark:bg-cyan-400/15 dark:text-cyan-200" },
  foc_sample:    { label: "FOC / Sample", dot: "bg-sky-500",     chip: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200" },
  completed:     { label: "Completed",    dot: "bg-teal-500",    chip: "bg-teal-100 text-teal-900 dark:bg-teal-400/15 dark:text-teal-200" },
  finished:      { label: "Finished",     dot: "bg-teal-600",    chip: "bg-teal-100 text-teal-900 ring-1 ring-inset ring-teal-300 dark:bg-teal-400/15 dark:text-teal-200 dark:ring-teal-400/30" },
  invoiced:      { label: "Invoiced",     dot: "bg-green-600",   chip: "bg-green-100 text-green-900 dark:bg-green-400/15 dark:text-green-200", locked: true },
  cancelled:     { label: "Cancelled",    dot: "bg-slate-400",   chip: "bg-slate-100 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300" },
};

export const statusLabel = (s: string) => STATUS_META[s as JobStatus]?.label ?? s;

/** Badge classes (chip + border) for a status, shared by every job card and table. */
export const statusChipClass = (s: string) =>
  STATUS_META[s as JobStatus]?.chip ?? "bg-muted text-muted-foreground";

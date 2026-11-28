import { useState, useEffect } from "react";
import type { Job } from "@/pages/Index";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  PenTool,
  User,
  X,
} from "lucide-react";

function fmtDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
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

/** Portrait Bestiary-inspired Job Card & Pending Approval Carousel */
export function SelectedJobPanel({
  job,
  pendingJobs = [],
  onOpen,
  onSelectJob,
  onApprove,
  onReject,
  className = "",
}: SelectedJobPanelProps) {
  // Filter jobs waiting for acceptance if a list is passed, or fallback to current job
  const waitingJobs = pendingJobs.filter((j) => j.approval_status === "pending_approval" || j.status === "pending");

  const [slideIndex, setSlideIndex] = useState(0);

  // Sync carousel index when an external job is clicked in the work center
  useEffect(() => {
    if (!job || waitingJobs.length === 0) return;
    const foundIdx = waitingJobs.findIndex((j) => j.id === job.id);
    if (foundIdx !== -1) setSlideIndex(foundIdx);
  }, [job, waitingJobs]);

  const activeJob = waitingJobs.length > 0 ? waitingJobs[slideIndex % waitingJobs.length] : job;

  const plusSlides = (step: number) => {
    if (waitingJobs.length === 0) return;
    const next = (slideIndex + step + waitingJobs.length) % waitingJobs.length;
    setSlideIndex(next);
    onSelectJob?.(waitingJobs[next]);
  };

  // Priority-based hero gradient matching the Witcher card themes
  const getHeroGradient = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-[radial-gradient(closest-side,#91262d,#2b1416)]"; // Vampire crimson
      case "medium":
        return "bg-[radial-gradient(closest-side,#6c7d9e,#292d39)]"; // Troll slate-blue
      default:
        return "bg-[radial-gradient(closest-side,#2d694f,#1d5248)]"; // Leshen emerald
    }
  };

  const getStatBoxTone = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-[#6d3030] border-[#8f4242]";
      case "medium":
        return "bg-[#292d39] border-[#3f4659]";
      default:
        return "bg-[#163a33] border-[#24594f]";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`} aria-label="Selected job portrait">
      {/* Main Portrait Card Container (Witcher Bestiary Aesthetic) */}
      <div className="relative flex w-full max-w-[380px] flex-col items-center bg-[#201f1e] text-[#e0dede] shadow-2xl outline outline-4 outline-[#83868a] outline-offset-2 transition-all duration-300">
        {/* Carousel Prev / Next Controls */}
        {waitingJobs.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => plusSlides(-1)}
              aria-label="Previous pending job"
              className="absolute -left-4 top-36 z-30 rounded-md border border-[#383838] bg-[#3a3939]/90 p-2 text-[#a8a2a2] backdrop-blur-sm transition hover:bg-[#444343] hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => plusSlides(1)}
              aria-label="Next pending job"
              className="absolute -right-4 top-36 z-30 rounded-md border border-[#383838] bg-[#3a3939]/90 p-2 text-[#a8a2a2] backdrop-blur-sm transition hover:bg-[#444343] hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {!activeJob ? (
          <div className="flex h-[460px] w-full flex-col items-center justify-center p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#83868a]">No Active Contract</p>
            <p className="mt-2 text-sm text-[#a8a2a2]">
              Pick a job from the work center or wait for incoming approvals.
            </p>
          </div>
        ) : (
          <div key={activeJob.id} className="w-full animate-in fade-in duration-500">
            {/* Top Portrait Figure / Banner */}
            <div
              className={`relative flex h-[220px] w-full flex-col justify-between p-5 ${getHeroGradient(
                activeJob.priority,
              )}`}
            >
              <div className="flex items-center justify-between">
                <span className="border border-white/20 bg-black/40 px-2.5 py-0.5 font-mono text-xs tracking-widest text-white">
                  {activeJob.jobOrderNumber}
                </span>
                <StatusBadge status={activeJob.status} />
              </div>

              <div className="my-auto text-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
                  {activeJob.branch || "Main Guild"}
                </p>
                <h3 className="mt-1 line-clamp-2 text-xl font-light uppercase tracking-[1.5px] text-white">
                  {activeJob.customer}
                </h3>
              </div>

              {/* Metadata Pills */}
              <div className="flex items-center justify-between border-t border-white/15 pt-2.5 text-[11px] text-white/80">
                <span className="flex items-center gap-1 truncate">
                  <User className="h-3 w-3 shrink-0" /> {activeJob.salesman || "Unassigned"}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <PenTool className="h-3 w-3 shrink-0" /> {activeJob.designer || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Middle Content / Description */}
            <div className="px-5 pt-4 text-left">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#83868a]">Contract Brief</span>
                <span className="text-[11px] text-[#a8a2a2]">{fmtDate(activeJob.createdAt)}</span>
              </div>
              <p className="line-clamp-3 min-h-[3.75rem] text-sm font-light leading-relaxed tracking-wide text-[#cacac9]">
                {activeJob.title}
                {activeJob.jobOrderDetails ? ` — ${activeJob.jobOrderDetails}` : ""}
              </p>
            </div>

            {/* Footer 3-Column Stat Boxes (Witcher Details Grid) */}
            <div className="mx-auto mt-4 grid w-[92%] grid-cols-3 gap-1.5 bg-[#201f1d] p-1">
              <div className={`border p-2 ${getStatBoxTone(activeJob.priority)}`}>
                <h6 className="flex items-center gap-1 text-[9px] uppercase tracking-[1.1px] text-white/75">
                  <CalendarDays className="h-2.5 w-2.5" /> Deadline
                </h6>
                <p className="mt-1.5 truncate text-xs font-medium tracking-wider text-white">
                  {fmtDate(activeJob.dueDate)}
                </p>
              </div>

              <div className={`border p-2 ${getStatBoxTone(activeJob.priority)}`}>
                <h6 className="flex items-center gap-1 text-[9px] uppercase tracking-[1.1px] text-white/75">
                  <Clock className="h-2.5 w-2.5" /> Est. Hours
                </h6>
                <p className="mt-1.5 truncate text-xs font-medium tracking-wider text-white">
                  {activeJob.estimatedHours ?? "—"} hrs
                </p>
              </div>

              <div className={`border p-2 ${getStatBoxTone(activeJob.priority)}`}>
                <h6 className="flex items-center gap-1 text-[9px] uppercase tracking-[1.1px] text-white/75">
                  <Flag className="h-2.5 w-2.5" /> Priority
                </h6>
                <p className="mt-1.5 truncate text-xs font-medium capitalize tracking-wider text-white">
                  {activeJob.priority || "Normal"}
                </p>
              </div>
            </div>

            {/* Approve & Reject Action Buttons */}
            <div className="mt-4 flex flex-col gap-2 px-4 pb-4">
              {(activeJob.approval_status === "pending_approval" || activeJob.status === "pending") && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove?.(activeJob.id)}
                    className="flex items-center justify-center gap-1.5 border border-[#2d694f] bg-[#163a33] py-2 text-xs font-medium uppercase tracking-widest text-emerald-200 transition hover:bg-[#22574c]"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject?.(activeJob.id)}
                    className="flex items-center justify-center gap-1.5 border border-[#8f4242] bg-[#6d3030] py-2 text-xs font-medium uppercase tracking-widest text-rose-200 transition hover:bg-[#8c3d3d]"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => onOpen(activeJob)}
                className="flex w-full items-center justify-center gap-1.5 border border-[#403d3d] bg-[#302f30] py-2 text-xs uppercase tracking-widest text-[#e0dede] transition hover:bg-[#3d3c3d]"
              >
                View full details <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Jobs Waiting for Acceptance (Card Queue) */}
      {waitingJobs.length > 0 && (
        <div className="w-full max-w-[380px]">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Waiting for Acceptance ({waitingJobs.length})
            </h4>
            <span className="text-[11px] text-muted-foreground">
              {slideIndex + 1} / {waitingJobs.length}
            </span>
          </div>

          <div className="flex max-h-[280px] flex-col gap-2.5 overflow-y-auto pr-1">
            {waitingJobs.map((pendingJob, idx) => {
              const isSelected = activeJob?.id === pendingJob.id;
              return (
                <div
                  key={pendingJob.id}
                  onClick={() => {
                    setSlideIndex(idx);
                    onSelectJob?.(pendingJob);
                  }}
                  className={`cursor-pointer border p-3 transition-all ${
                    isSelected
                      ? "border-[#83868a] bg-[#201f1e] text-[#e0dede] shadow-md"
                      : "border-border bg-card hover:border-[#83868a]/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold">{pendingJob.jobOrderNumber}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                        pendingJob.priority === "high" ? "bg-[#6d3030] text-rose-200" : "bg-[#292d39] text-slate-200"
                      }`}
                    >
                      {pendingJob.priority}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs font-medium">{pendingJob.customer}</p>
                  <p className="line-clamp-1 text-[11px] opacity-75">{pendingJob.title}</p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="flex items-center gap-1 text-[10px] opacity-70">
                      <Building2 className="h-3 w-3" /> {pendingJob.branch || "—"}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onApprove?.(pendingJob.id)}
                        className="rounded bg-[#163a33] px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-200 hover:bg-[#22574c]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject?.(pendingJob.id)}
                        className="rounded bg-[#6d3030] px-2 py-0.5 text-[10px] uppercase tracking-wider text-rose-200 hover:bg-[#8c3d3d]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Job } from "@/pages/Index";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { JobStatusOverview } from "@/components/dashboard/JobStatusOverview";
import { ApprovalBox } from "@/components/dashboard/ApprovalBox";
import { HighPriorityReminder } from "@/components/dashboard/HighPriorityReminder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Palette, FileCheck2, Cog, Receipt, UserRound, ChevronLeft, ChevronRight } from "lucide-react";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "settings" | "admin" | "admin-management" | "reports") => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

interface WorkflowBucketProps {
  title: string;
  jobs: Job[];
  icon: ComponentType<{ className?: string }>;
  assigneeFor: (job: Job) => string;
  onSelect: (job: Job) => void;
}

function WorkflowBucket({
  title,
  jobs: bucketJobs,
  icon: Icon,
  assigneeFor,
  onSelect,
  animationDelay,
}: WorkflowBucketProps & { animationDelay: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const wheelDeltaX = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(0, bucketJobs.length - 1)));
  }, [bucketJobs.length]);

  useEffect(() => () => {
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current || dragStartX.current === null) return;
      setDragOffset(event.clientX - dragStartX.current);
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current || dragStartX.current === null) return;
      const distance = event.clientX - dragStartX.current;
      if (Math.abs(distance) > 60) {
        setActiveIndex((index) => {
          const nextIndex = Math.max(0, Math.min(bucketJobs.length - 1, index + (distance < 0 ? 1 : -1)));
          if (nextIndex !== index) suppressClick.current = true;
          return nextIndex;
        });
      }
      dragStartX.current = null;
      activePointerId.current = null;
      setDragOffset(0);
      setIsDragging(false);
    };

    const cancelDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current) return;
      dragStartX.current = null;
      activePointerId.current = null;
      setDragOffset(0);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", cancelDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", cancelDrag);
    };
  }, [bucketJobs.length, isDragging]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary) return;
    dragStartX.current = event.clientX;
    activePointerId.current = event.pointerId;
    setIsDragging(true);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLButtonElement>) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 5) return;
    event.preventDefault();
    wheelDeltaX.current += event.deltaX;
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => {
      if (Math.abs(wheelDeltaX.current) >= 30) {
        const direction = wheelDeltaX.current < 0 ? 1 : -1;
        setActiveIndex((index) => Math.max(0, Math.min(bucketJobs.length - 1, index + direction)));
      }
      wheelDeltaX.current = 0;
      wheelTimeout.current = null;
    }, 80);
  };

  const activeJob = bucketJobs[activeIndex];

  return (
    <Card className="dashboard-card-enter" style={{ animationDelay: `${animationDelay}ms` }}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{bucketJobs.length}</span>
      </CardHeader>
      <CardContent className="pt-0">
        {bucketJobs.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">Nothing waiting here.</p>
        ) : (
          <div className="mx-auto w-full max-w-2xl">
            <div className="relative h-40 sm:h-36">
              {Array.from({ length: Math.min(3, bucketJobs.length) }, (_, index) => {
                const depth = Math.min(3, bucketJobs.length) - index - 1;
                return (
                  <div
                    key={`workflow-card-layer-${depth}`}
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-full rounded-lg border bg-card shadow-md transition-[transform,opacity] duration-300 ease-out motion-reduce:duration-0"
                    style={{
                      zIndex: index,
                      opacity: 1 - depth * 0.18,
                      transform: `translateY(${depth * 9}px) scale(${1 - depth * 0.025})`,
                    }}
                  />
                );
              })}
              <button
                key={activeJob?.id}
                type="button"
                onClick={(event) => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    event.preventDefault();
                    return;
                  }
                  if (activeJob) onSelect(activeJob);
                }}
                onPointerDown={handlePointerDown}
                onWheel={handleWheel}
                className="absolute inset-x-0 top-0 z-10 flex h-full items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left shadow-xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/30 motion-reduce:duration-0"
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${dragOffset / 35}deg)`,
                  transition: isDragging ? "none" : undefined,
                  touchAction: "pan-y",
                }}
              >
                {activeJob && (
                  <>
                    <span className="min-w-0 space-y-1">
                      <span className="block truncate text-sm font-semibold">{activeJob.jobOrderNumber} · {activeJob.title}</span>
                      <span className="block truncate text-sm text-muted-foreground">{activeJob.customer}</span>
                      <span className="block pt-1 text-xs text-muted-foreground">{activeIndex + 1} of {bucketJobs.length} in queue</span>
                    </span>
                    <span className="flex max-w-[40%] shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{assigneeFor(activeJob)}</span>
                    </span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Previous ${title.toLowerCase()} job`}
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                disabled={activeIndex === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">
                {activeIndex + 1} / {bucketJobs.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Next ${title.toLowerCase()} job`}
                onClick={() => setActiveIndex((index) => Math.min(bucketJobs.length - 1, index + 1))}
                disabled={activeIndex >= bucketJobs.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ModernDashboard({ jobs }: ModernDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled';
    title: string;
  } | null>(null);

  const searchFilteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    inProgress: jobs.filter(job => job.status === "in-progress").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length,
    cancelled: jobs.filter(job => job.status === "cancelled").length,
  };

  const pendingApprovalJobs = jobs.filter(
    job => job.approval_status === "pending_approval" &&
      job.status !== "completed" &&
      job.status !== "finished" &&
      job.status !== "invoiced" &&
      job.status !== "cancelled",
  );
  const pendingDesignJobs = jobs.filter(
    job => (job.status === "pending" || job.status === "designing") &&
      job.approval_status !== "pending_approval",
  );
  const executionJobs = jobs.filter(
    job => job.status === "in-progress" || job.status === "out" || job.status === "foc_sample",
  );
  const pendingInvoiceJobs = jobs.filter(job => job.status === "completed" || job.status === "finished");
  const assignedTo = (job: Job) =>
    [job.assignee, job.designer, job.salesman].find((name) => name && name !== "Unassigned") || "Unassigned";

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleStatusClick = (
    status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled',
    title: string
  ) => {
    setSelectedStatus({ status, title });
    setStatusModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <div className="dashboard-card-enter flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your job orders and team activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="pl-10 w-64"
            />
            {showSearchDropdown && searchFilteredJobs.length > 0 && (
              <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    Found {searchFilteredJobs.length} job{searchFilteredJobs.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1">
                    {searchFilteredJobs.slice(0, 10).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-muted border border-transparent hover:border-border cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-foreground">{job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{job.jobOrderNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">{job.customer}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleViewDetails(job);
                            setShowSearchDropdown(false);
                            setSearchQuery("");
                          }}
                          className="ml-2 h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {searchFilteredJobs.length > 10 && (
                    <div className="text-xs text-center text-muted-foreground mt-2 pb-1">
                      And {searchFilteredJobs.length - 10} more...
                    </div>
                  )}
                </div>
              </div>
            )}
            {showSearchDropdown && searchQuery && searchFilteredJobs.length === 0 && (
              <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg z-50 p-4">
                <div className="text-center text-sm text-muted-foreground">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  No jobs found matching "{searchQuery}"
                </div>
              </div>
            )}
          </div>
          <DashboardNotifications />
        </div>
      </div>

      {/* High Priority Reminder Banner */}
      <div className="dashboard-card-enter" style={{ animationDelay: "80ms" }}>
        <HighPriorityReminder jobs={jobs} onViewJob={handleViewDetails} />
      </div>

      <section
        aria-label="Uncompleted work and bottlenecks"
        className="dashboard-card-enter space-y-3"
        style={{ animationDelay: "140ms" }}
      >
        <div>
          <h2 className="text-xl font-semibold">Uncompleted Work</h2>
          <p className="text-sm text-muted-foreground">Current workflow queues and the person or team responsible.</p>
        </div>
        <div className="flex flex-col gap-4">
          <WorkflowBucket
            title="Pending Design"
            jobs={pendingDesignJobs}
            icon={Palette}
            assigneeFor={(job) => job.designer && job.designer !== "Unassigned" ? job.designer : assignedTo(job)}
            onSelect={handleViewDetails}
            animationDelay={180}
          />
          <WorkflowBucket
            title="Pending Approval"
            jobs={pendingApprovalJobs}
            icon={FileCheck2}
            assigneeFor={(job) => job.assignee && job.assignee !== "Unassigned" ? job.assignee : "Management / Admin"}
            onSelect={handleViewDetails}
            animationDelay={240}
          />
          <WorkflowBucket
            title="In Production / Execution"
            jobs={executionJobs}
            icon={Cog}
            assigneeFor={assignedTo}
            onSelect={handleViewDetails}
            animationDelay={300}
          />
          <WorkflowBucket
            title="Pending Invoicing"
            jobs={pendingInvoiceJobs}
            icon={Receipt}
            assigneeFor={(job) => job.assignee && job.assignee !== "Unassigned" ? job.assignee : "Admin"}
            onSelect={handleViewDetails}
            animationDelay={360}
          />
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <div className="dashboard-card-enter" style={{ animationDelay: "420ms" }}>
          <ApprovalBox />
        </div>

        <div className="dashboard-card-enter" style={{ animationDelay: "480ms" }}>
          <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
        </div>
      </div>

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />

      <JobStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        jobs={jobs}
        status={selectedStatus?.status || 'total'}
        title={selectedStatus?.title || 'All'}
      />
    </div>
  );
}

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Job } from "@/pages/Index";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { JobStatusOverview } from "@/components/dashboard/JobStatusOverview";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectedJobPanel } from "@/components/dashboard/SelectedJobPanel";
import { KpiStrip } from "@/components/command/KpiStrip";
import { RevenueTrend } from "@/components/dashboard/insights/RevenueTrend";
import { JobSummaryGauge } from "@/components/dashboard/insights/JobSummaryGauge";
import { ProductionPipeline, type PipelineRow } from "@/components/dashboard/insights/ProductionPipeline";
import { RecentJobs } from "@/components/dashboard/insights/JobLists";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { LaunchPromotions } from "@/components/dashboard/LaunchPromotions";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { listPendingApprovalJobs } from "@/data/jobs";
import { AlertCircle, ArrowRight, CalendarClock, Receipt } from "lucide-react";

interface ModernDashboardProps {
  jobs: Job[];
  isActive?: boolean;
  onViewChange?: (view: string) => void;
  onOpenJob?: (job: Job) => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
  quickWidget?: ReactNode;
}

type WorkQueue = "approvals" | "unapproved" | "urgent" | "production" | "invoice";

interface DashboardSummary {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    designing: number;
    completed: number;
    invoiced: number;
    cancelled: number;
  };
  statusCounts: Record<string, number>;
  pipeline: PipelineRow[];
  waitingInvoiceJobs: Job[];
  waitingInvoiceCount: number;
  waitingInvoiceValue: number;
  activeJobs: number;
  urgentJobs: Job[];
  urgentCount: number;
  highPriorityCount: number;
  overdueCount: number;
  unapprovedJobs: Job[];
  unapprovedCount: number;
  productionJobs: Job[];
  productionCount: number;
  recentJobs: Job[];
}

const CLOSED_STATUSES = new Set(["completed", "finished", "invoiced", "cancelled"]);
const ACTIVE_STATUSES = new Set(["pending", "in-progress", "designing", "out", "foc_sample"]);
const QUEUE_LIMIT = 8;
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const PIPELINE_STAGES: Array<{ label: string; statuses: string[]; bar: string }> = [
  { label: "Pending", statuses: ["pending"], bar: "bg-peach-foreground" },
  { label: "Design", statuses: ["designing"], bar: "bg-primary" },
  { label: "Production", statuses: ["in-progress", "out", "foc_sample"], bar: "bg-sky-foreground" },
  { label: "Ready to bill", statuses: ["completed", "finished"], bar: "bg-mint-foreground" },
];

function insertSortedLimit(list: Job[], job: Job, compare: (left: Job, right: Job) => number) {
  const index = list.findIndex((current) => compare(job, current) < 0);
  list.splice(index < 0 ? list.length : index, 0, job);
  if (list.length > QUEUE_LIMIT) list.pop();
}

function isPastDue(value: string, today: string, todayTime: number) {
  const dateOnly = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly < today;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return false;
  parsed.setHours(0, 0, 0, 0);
  return parsed.getTime() < todayTime;
}

function deriveDashboardSummary(jobs: Job[], now: number): DashboardSummary {
  const statusCounts: Record<string, number> = {};
  const pipelineValues = PIPELINE_STAGES.map((stage) => ({ ...stage, count: 0, value: 0 }));
  const stats: DashboardSummary["stats"] = {
    total: jobs.length,
    pending: 0,
    inProgress: 0,
    designing: 0,
    completed: 0,
    invoiced: 0,
    cancelled: 0,
  };
  const waitingInvoiceJobs: Job[] = [];
  const urgentJobs: Job[] = [];
  const unapprovedJobs: Job[] = [];
  const productionJobs: Job[] = [];
  const recentJobs: Job[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);
  let activeJobs = 0;
  let waitingInvoiceCount = 0;
  let waitingInvoiceValue = 0;
  let urgentCount = 0;
  let highPriorityCount = 0;
  let overdueCount = 0;
  let unapprovedCount = 0;
  let productionCount = 0;

  const dueDateOrder = (left: Job, right: Job) =>
    (left.dueDate || "9999-12-31").localeCompare(right.dueDate || "9999-12-31");

  for (const job of jobs) {
    statusCounts[job.status] = (statusCounts[job.status] ?? 0) + 1;
    if (job.status === "pending") stats.pending += 1;
    if (job.status === "in-progress") stats.inProgress += 1;
    if (job.status === "designing") stats.designing += 1;
    if (job.status === "completed") stats.completed += 1;
    if (job.status === "invoiced") stats.invoiced += 1;
    if (job.status === "cancelled") stats.cancelled += 1;
    if (ACTIVE_STATUSES.has(job.status)) activeJobs += 1;

    const pipelineStage = pipelineValues.find((stage) => stage.statuses.includes(job.status));
    if (pipelineStage) {
      pipelineStage.count += 1;
      pipelineStage.value += Number(job.totalValue) || 0;
    }

    if (job.status === "completed" || job.status === "finished") {
      waitingInvoiceCount += 1;
      waitingInvoiceValue += Number(job.totalValue) || 0;
      insertSortedLimit(waitingInvoiceJobs, job, dueDateOrder);
    }

    const isOpen = !CLOSED_STATUSES.has(job.status);
    const isOverdue = isOpen && Boolean(job.dueDate) && isPastDue(job.dueDate, todayKey, today.getTime());
    if (isOverdue) {
      overdueCount += 1;
    }

    if (job.priority === "high" && isOpen) {
      highPriorityCount += 1;
    }
    if (isOpen && (job.priority === "high" || isOverdue)) {
      urgentCount += 1;
      insertSortedLimit(urgentJobs, job, dueDateOrder);
    }

    if (job.approval_status === "pending_approval") {
      unapprovedCount += 1;
      insertSortedLimit(unapprovedJobs, job, (left, right) => right.createdAt.localeCompare(left.createdAt));
    }

    const needsDesignAttention =
      job.approval_status !== "pending_approval" &&
      (job.status === "pending" || job.status === "designing");
    const needsExecutionAttention =
      job.status === "in-progress" || job.status === "out" || job.status === "foc_sample";
    if (needsDesignAttention || needsExecutionAttention) {
      productionCount += 1;
      insertSortedLimit(productionJobs, job, dueDateOrder);
    }

    insertSortedLimit(recentJobs, job, (left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  return {
    stats,
    statusCounts,
    pipeline: pipelineValues,
    waitingInvoiceJobs,
    waitingInvoiceCount,
    waitingInvoiceValue,
    activeJobs,
    urgentJobs,
    urgentCount,
    highPriorityCount,
    overdueCount,
    unapprovedJobs,
    unapprovedCount,
    productionJobs,
    productionCount,
    recentJobs,
  };
}

function QueueList({
  jobs,
  total,
  emptyMessage,
  onSelect,
}: {
  jobs: Job[];
  total: number;
  emptyMessage: string;
  onSelect: (job: Job) => void;
}) {
  if (total === 0) {
    return <p className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div>
      <ul className="divide-y">
        {jobs.map((job) => (
          <li key={job.id}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onSelect(job)}
              className="flex h-auto min-h-11 w-full min-w-0 justify-start rounded-none items-center gap-2 px-2 py-2 text-start text-sm font-normal"
            >
              <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{job.jobOrderNumber}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{job.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {job.customer}{job.assignee && job.assignee !== "Unassigned" ? ` · ${job.assignee}` : ""}
                </span>
              </span>
              <StatusBadge status={job.status} className="hidden shrink-0 sm:inline-flex" />
              {job.dueDate && (
                <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground md:inline">
                  {new Date(`${job.dueDate.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </span>
              )}
            </Button>
          </li>
        ))}
      </ul>
      {total > jobs.length && (
        <p className="border-t px-3 py-2 text-center text-xs text-muted-foreground">
          Showing {jobs.length} of {total} jobs
        </p>
      )}
    </div>
  );
}

function PriorityWorkCenter({
  active,
  queue,
  onQueueChange,
  summary,
  onOpenJob,
  onViewAll,
}: {
  active: boolean;
  queue: WorkQueue;
  onQueueChange: (queue: WorkQueue) => void;
  summary: DashboardSummary;
  onOpenJob: (job: Job) => void;
  onViewAll: () => void;
}) {
  return (
    <section id="priority-work-center" aria-label="Priority work center" className="scroll-mt-2 min-w-0 rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold">Priority work centre</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onViewAll} className="h-8">
          All jobs <ArrowRight className="ms-1 h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
        </Button>
      </div>

      <Tabs value={queue} onValueChange={(value) => onQueueChange(value as WorkQueue)}>
        <TabsList aria-label="Work queues" className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
          <TabsTrigger value="unapproved" className="min-w-0 px-2 py-1.5 text-xs">Unapproved</TabsTrigger>
          <TabsTrigger value="urgent" className="min-w-0 px-2 py-1.5 text-xs">Urgent</TabsTrigger>
          <TabsTrigger value="production" className="min-w-0 px-2 py-1.5 text-xs">Production</TabsTrigger>
          <TabsTrigger value="invoice" className="min-w-0 px-2 py-1.5 text-xs">Ready to invoice</TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <TabsContent value="unapproved" className="m-0">
            <CardContent className="p-0">
              <QueueList
                jobs={summary.unapprovedJobs}
                total={summary.unapprovedCount}
                emptyMessage="No jobs are waiting for approval."
                onSelect={onOpenJob}
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="urgent" className="m-0">
            <CardContent className="p-0">
              <QueueList
                jobs={summary.urgentJobs}
                total={summary.urgentCount}
                emptyMessage="No open high-priority jobs."
                onSelect={onOpenJob}
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="production" className="m-0">
            <CardContent className="p-0">
              <QueueList
                jobs={summary.productionJobs}
                total={summary.productionCount}
                emptyMessage="No production jobs need attention."
                onSelect={onOpenJob}
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="invoice" className="m-0">
            <CardContent className="p-0">
              <QueueList
                jobs={summary.waitingInvoiceJobs}
                total={summary.waitingInvoiceCount}
                emptyMessage="No jobs are ready to invoice."
                onSelect={onOpenJob}
              />
            </CardContent>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}

const alertButton =
  "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ModernDashboard({ jobs, quickWidget, onOpenJob, onViewChange, isActive = true }: ModernDashboardProps) {
  const [queue, setQueue] = useState<WorkQueue>("unapproved");
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "total" | "active" | "cancelled";
    title: string;
  } | null>(null);

  const dashboard = useMemo(() => deriveDashboardSummary(jobs, Date.now()), [jobs]);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const previewed = (previewJob && jobs.find((j) => j.id === previewJob.id)) || previewJob
    || dashboard.urgentJobs[0] || dashboard.unapprovedJobs[0] || dashboard.recentJobs[0] || null;
  const {
    data: pendingApprovalRecords,
    isError: approvalCountError,
    isLoading: approvalCountLoading,
    refetch: refetchApprovalCount,
  } = useQuery({
    queryKey: ["pending-approvals", user?.id],
    queryFn: listPendingApprovalJobs,
    enabled: Boolean(user) && isActive,
    staleTime: 30_000,
  });
  const pendingApprovals = pendingApprovalRecords?.length ?? dashboard.unapprovedCount;

  useEffect(() => {
    if (!isActive) {
      setIsJobDetailsOpen(false);
      setStatusModalOpen(false);
    }
  }, [isActive]);

  const handleViewDetails = (job: Job) => {
    if (onOpenJob) {
      onOpenJob(job);
      return;
    }
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleStatusClick = (
    status: "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "total" | "active" | "cancelled",
    title: string,
  ) => {
    setSelectedStatus({ status, title });
    setStatusModalOpen(true);
  };

  const goToWorkQueue = (nextQueue: WorkQueue) => {
    setQueue(nextQueue);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    requestAnimationFrame(() => {
      document.getElementById("priority-work-center")?.scrollIntoView({ behavior, block: "start" });
    });
  };

  return (
    <div className="workspace-page reference-dashboard flex flex-col gap-3 text-sm">

      <section aria-label="Operational alerts" className="flex shrink-0 flex-wrap items-center gap-1.5">
        {approvalCountError ? (
          <Button variant="outline"
            type="button"
            onClick={() => void refetchApprovalCount()}
            className={`${alertButton} border-destructive/30 bg-destructive/5 text-destructive`}
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            Approval queue unavailable · Retry
          </Button>
        ) : approvalCountLoading && pendingApprovalRecords === undefined ? (
          <span role="status" className="text-xs text-muted-foreground">Checking approval queue…</span>
        ) : pendingApprovals > 0 ? (
          <Button variant="outline"
            type="button"
            onClick={() => goToWorkQueue("unapproved")}
            className={`${alertButton} border-peach-foreground/20 bg-peach text-peach-foreground hover:bg-peach/80`}
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            {pendingApprovals} awaiting approval
            <span className="font-semibold">Review</span>
          </Button>
        ) : null}
        {dashboard.overdueCount > 0 && (
          <Button variant="outline"
            type="button"
            onClick={() => goToWorkQueue("urgent")}
            className={`${alertButton} border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10`}
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {dashboard.overdueCount} overdue jobs
          </Button>
        )}
        {dashboard.highPriorityCount > 0 && (
          <Button variant="outline"
            type="button"
            onClick={() => goToWorkQueue("urgent")}
            className={`${alertButton} border-peach-foreground/20 bg-peach text-peach-foreground hover:bg-peach/80`}
          >
            {dashboard.highPriorityCount} high-priority jobs
          </Button>
        )}
        {dashboard.waitingInvoiceCount > 0 && (
          <Button variant="outline"
            type="button"
            onClick={() => goToWorkQueue("invoice")}
            className={`${alertButton} border-sky-foreground/20 bg-sky text-sky-foreground hover:bg-sky/80`}
          >
            <Receipt className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {dashboard.waitingInvoiceCount} ready to invoice
          </Button>
        )}
      </section>

      <div className="shrink-0">
        <KpiStrip
          summary={{
            totalJobs: dashboard.stats.total,
            waitingInvoiceCount: dashboard.waitingInvoiceCount,
            waitingInvoiceValue: dashboard.waitingInvoiceValue,
            activeJobs: dashboard.activeJobs,
            urgentJobs: dashboard.highPriorityCount,
          }}
        />
      </div>

      <div className="grid min-w-0 gap-3 xl:grid-cols-12">
        <div className="grid min-w-0 gap-3 xl:col-span-9">
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <RevenueTrend jobs={jobs} className="h-80" />
            <PriorityWorkCenter
              active={isActive} queue={queue} onQueueChange={setQueue}
              summary={dashboard} onOpenJob={setPreviewJob}
              onViewAll={() => onViewChange?.("jobs")}
            />
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            <JobSummaryGauge counts={dashboard.statusCounts} />
            <div className="min-w-0">{quickWidget}</div>
            <ProductionPipeline rows={dashboard.pipeline} className="md:col-span-2 2xl:col-span-1" />
          </div>
          <JobStatusOverview stats={dashboard.stats} onStatusClick={handleStatusClick} />
        </div>
        <div className="flex min-w-0 flex-col gap-3 xl:col-span-3">
          <SelectedJobPanel job={previewed} onOpen={handleViewDetails} />
          <div className="mt-auto"><LaunchPromotions /></div>
        </div>
      </div>
      <RecentJobs
        jobs={jobs} recentJobs={dashboard.recentJobs}
        onOpenJob={handleViewDetails} onViewAll={() => onViewChange?.("jobs")}
      />

      <JobDetails
        isOpen={isActive && isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />

      <JobStatusModal
        isOpen={isActive && statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        jobs={jobs}
        status={selectedStatus?.status || "total"}
        title={selectedStatus?.title || "All"}
      />
    </div>
  );
}

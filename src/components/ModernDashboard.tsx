import { useState } from "react";
import { Job } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { JobStatusOverview } from "@/components/dashboard/JobStatusOverview";
import { DailyTrendsChart } from "@/components/dashboard/DailyTrendsChart";
import { QuickSearch } from "@/components/dashboard/QuickSearch";
import { ActivitiesSection } from "@/components/dashboard/ActivitiesSection";
import { ShortcutGadgets } from "@/components/dashboard/ShortcutGadgets";
import { useChartData } from "@/hooks/useChartData";
import { Plus } from "lucide-react";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";
import { JobOrder } from "@/types/jobOrder";
import { useJobOrders } from "@/hooks/useJobOrders";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled';
    title: string;
  } | null>(null);
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null);
  const [showApprovalJobModal, setShowApprovalJobModal] = useState(false);

  const { dailyJobData, isLoading: chartLoading } = useChartData();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    "in-progress": jobs.filter(job => job.status === "in-progress").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length,
    cancelled: jobs.filter(job => job.status === "cancelled").length
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleCreateJobClick = () => {
    if (onViewChange) {
      onViewChange("create");
    }
  };

  const notifications = [
    {id: '1', type: 'job_created', message: 'New job created', time: '2 hours ago', read: false},
    {id: '2', type: 'status_change', message: 'Job status updated', time: '3 hours ago', read: false},
  ];

  // This hook returns JobOrder[] not Job[], so we import it here for the PendingApprovals list
  const { jobOrders } = useJobOrders();

  // ---- Start shadcn layout
  return (
    <div className="relative min-h-screen flex flex-col gap-8 p-8 bg-background">
      <div className="flex items-center justify-between bg-card rounded-2xl px-6 py-5 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardNotifications notifications={notifications} />
          <Button 
            onClick={handleCreateJobClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>
      {/* ADMIN APPROVALS */}
      <PendingApprovals
        jobs={jobOrders}
        onView={(jobOrder) => {
          setSelectedJobOrder(jobOrder);
          setShowApprovalJobModal(true);
        }}
      />
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-6">
          <div className="h-[400px]">
            <DailyTrendsChart dailyJobData={dailyJobData} isLoading={chartLoading} />
          </div>
        </div>
        <div className="col-span-4">
          <div className="h-[400px]">
            <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-6 relative">
        <div className="col-span-4">
          <QuickSearch 
            searchQuery={searchQuery}
            filteredJobs={filteredJobs}
            onViewDetails={handleViewDetails}
            onSearchChange={setSearchQuery}
          />
        </div>
        <div className="col-span-4">
          <ActivitiesSection />
        </div>
        <ShortcutGadgets onViewChange={onViewChange} floating />
      </div>
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
      {/* Show job details modal for approvals */}
      <JobDetails
        isOpen={showApprovalJobModal}
        onClose={() => setShowApprovalJobModal(false)}
        job={
          selectedJobOrder
            ? {
                id: selectedJobOrder.id,
                jobOrderNumber: selectedJobOrder.job_order_number,
                title: selectedJobOrder.title ?? "",
                customer: selectedJobOrder.customer?.name ?? "Unknown Customer",
                assignee: selectedJobOrder.assignee ?? "Unassigned",
                // Map JobOrder 'urgent' priority to 'high'
                priority:
                  selectedJobOrder.priority === "urgent"
                    ? "high"
                    : (selectedJobOrder.priority as "low" | "medium" | "high"),
                status: selectedJobOrder.status,
                dueDate: selectedJobOrder.due_date ?? "",
                createdAt: selectedJobOrder.created_at,
                estimatedHours: selectedJobOrder.estimated_hours ?? 0,
                branch: selectedJobOrder.branch ?? "",
                designer: selectedJobOrder.designer?.name ?? "Unassigned",
                salesman: selectedJobOrder.salesman?.name ?? "Unassigned",
                jobOrderDetails: selectedJobOrder.job_order_details ?? ""
              }
            : null
        }
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

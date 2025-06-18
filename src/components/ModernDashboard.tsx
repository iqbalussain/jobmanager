
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
import { ApprovalBox } from "@/components/dashboard/ApprovalBox";
import { ShortcutGadgets } from "@/components/dashboard/ShortcutGadgets";
import { useChartData } from "@/hooks/useChartData";
import { Plus } from "lucide-react";

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

  const { dailyJobData, isLoading: chartLoading } = useChartData();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    inProgress: jobs.filter(job => job.status === "in-progress").length,
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

  const handleStatusClick = (status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled', title: string) => {
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

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardNotifications notifications={notifications} />
          <Button 
            onClick={handleCreateJobClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-6">
          <DailyTrendsChart dailyJobData={dailyJobData} isLoading={chartLoading} />
        </div>
        
        <div className="col-span-4">
          <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
        </div>
      </div>

      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-3">
          <QuickSearch 
            searchQuery={searchQuery}
            filteredJobs={filteredJobs}
            onViewDetails={handleViewDetails}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="col-span-3">
          <ActivitiesSection />
        </div>

        <div className="col-span-2">
          <ApprovalBox />
        </div>

        <div className="col-span-2">
          <ShortcutGadgets onViewChange={onViewChange} />
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

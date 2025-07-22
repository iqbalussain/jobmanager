
import { useState } from "react";
import { Job } from "@/pages/Index";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { JobStatusOverview } from "@/components/dashboard/JobStatusOverview";
import { QuickSearch } from "@/components/dashboard/QuickSearch";
import { ActivitiesSection } from "@/components/dashboard/ActivitiesSection";
import { ApprovalBox } from "@/components/dashboard/ApprovalBox";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "settings" | "admin" | "admin-management" | "reports") => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
  onViewJob?: (job: Job) => void;
}

export function ModernDashboard({ jobs, onViewChange, onViewJob }: ModernDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active' | 'cancelled';
    title: string;
  } | null>(null);

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

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 text-sm lg:text-lg xl:text-xl">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Cards for Mobile */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Jobs</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</h3>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Top Row - Approvals and Status Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div className="xl:col-span-6">
            <div className="glass-effect rounded-2xl p-6 h-full min-h-[400px] xl:min-h-[450px]">
              <ApprovalBox onViewJob={onViewJob} />
            </div>
          </div>
          
          <div className="xl:col-span-4">
            <div className="glass-effect rounded-2xl p-6 h-full min-h-[400px] xl:min-h-[450px]">
              <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
            </div>
          </div>
        </div>

        {/* Bottom Row - Search and Activities */}
        <div className="grid grid-cols-1 xl:grid-cols-8 gap-6 lg:gap-8">
          <div className="xl:col-span-2">
            <div className="glass-effect rounded-2xl p-6 h-full min-h-[400px] xl:min-h-[450px]">
              <QuickSearch 
                searchQuery={searchQuery}
                filteredJobs={filteredJobs}
                onViewDetails={handleViewDetails}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>

          <div className="xl:col-span-6">
            <div className="glass-effect rounded-2xl p-6 h-full min-h-[400px] xl:min-h-[450px]">
              <ActivitiesSection />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        {/* Approval Box */}
        <div className="glass-effect rounded-xl p-4">
          <ApprovalBox onViewJob={onViewJob} />
        </div>

        {/* Job Status Overview */}
        <div className="glass-effect rounded-xl p-4">
          <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
        </div>

        {/* Quick Search */}
        <div className="glass-effect rounded-xl p-4">
          <QuickSearch 
            searchQuery={searchQuery}
            filteredJobs={filteredJobs}
            onViewDetails={handleViewDetails}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Activities */}
        <div className="glass-effect rounded-xl p-4">
          <ActivitiesSection />
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

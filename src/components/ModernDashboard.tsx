
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

  const notifications = [
    {id: '1', type: 'job_created', message: 'New job created', time: '2 hours ago', read: false},
    {id: '2', type: 'status_change', message: 'Job status updated', time: '3 hours ago', read: false},
  ];

  return (
    <div className="space-y-8 p-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl">Welcome back to Printwaves Job Manager! @user_name.</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardNotifications notifications={notifications} />
        </div>
      </div>

      {/* Top Row - Approvals and Status Overview */}
      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-6">
          <div className="glass-effect rounded-xl p-1">
            <ApprovalBox />
          </div>
        </div>
        
        <div className="col-span-4">
          <div className="glass-effect rounded-xl p-1">
            <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
          </div>
        </div>
      </div>

      {/* Bottom Row - Search and Activities */}
      <div className="grid grid-cols-8 gap-4 h-[400px]">
        <div className="col-span-2">
          <div className="glass-effect rounded-xl p-1 h-full">
            <QuickSearch 
              searchQuery={searchQuery}
              filteredJobs={filteredJobs}
              onViewDetails={handleViewDetails}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        <div className="col-span-6">
          <div className="glass-effect rounded-xl p-1 h-full">
            <ActivitiesSection />
          </div>
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

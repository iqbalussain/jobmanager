import { useState } from "react";
import { Job } from "@/pages/Index";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { JobStatusOverview } from "@/components/dashboard/JobStatusOverview";
import { QuickSearch } from "@/components/dashboard/QuickSearch";
import { ApprovalBox } from "@/components/dashboard/ApprovalBox";
import { HighPriorityReminder } from "@/components/dashboard/HighPriorityReminder";
import { TasbiCounter } from "@/components/dashboard/TasbiCounter";
import { useRamadanTheme } from "@/App";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "settings" | "admin" | "admin-management" | "reports") => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
  const { isRamadan } = useRamadanTheme();
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
    if (status === 'cancelled') {
      setSelectedStatus({ status, title });
      setStatusModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          {isRamadan ? (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌙</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ramadan Kareem
              </h1>
              <span className="text-2xl">✦</span>
            </div>
          ) : (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
          )}
          <p className="text-muted-foreground text-lg">
            {isRamadan ? "رمضان كريم — Wishing you a blessed month ☪" : "Welcome back! Here's what's happening with your projects."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardNotifications />
        </div>
      </div>

      {/* High Priority Reminder Banner */}
      <HighPriorityReminder jobs={jobs} onViewJob={handleViewDetails} />

      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-6 relative">
          {isRamadan && <span className="absolute top-2 right-3 text-primary/10 text-2xl pointer-events-none z-10">☪</span>}
          <div className="glass-effect rounded-xl p-1">
            <ApprovalBox />
          </div>
        </div>
        
        <div className="col-span-4 relative">
          {isRamadan && <span className="absolute top-2 left-3 text-accent/15 text-lg pointer-events-none z-10">✦</span>}
          <div className="glass-effect rounded-xl p-1">
            <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 glass-effect rounded-xl p-1 h-[400px] relative">
          {isRamadan && <span className="absolute top-2 right-3 text-accent/10 text-xl pointer-events-none z-10">☪</span>}
          <QuickSearch
            searchQuery={searchQuery}
            filteredJobs={filteredJobs}
            onViewDetails={handleViewDetails}
            onSearchChange={setSearchQuery}
          />
        </div>
        {isRamadan && (
          <div className="lg:col-span-1">
            <TasbiCounter />
          </div>
        )}
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

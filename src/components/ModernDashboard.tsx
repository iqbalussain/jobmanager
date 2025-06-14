
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

  // --- Start Glassmorphism/Dark Mode Wrapper ---
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#030712] to-[#232946] dark:from-[#02101f] dark:to-[#1d2238] flex flex-col gap-8 transition-colors duration-300">
      <div className="w-full rounded-2xl shadow-2xl border border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-md mb-3 px-8 py-6 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(120deg, rgba(30,32,41,0.65) 0%, rgba(51,62,80,0.75) 100%)",
          boxShadow: "0 8px 32px 0 rgba(12,17,35,0.23)"
        }}>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-2 drop-shadow-xl">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardNotifications notifications={notifications} />
          <Button
            onClick={handleCreateJobClick}
            className="bg-blue-700/80 hover:bg-blue-900/80 text-white px-6 py-2 rounded-xl shadow-xl hover:scale-[1.03] transition-all duration-300 backdrop-blur"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-6">
          <div className="h-full rounded-2xl shadow-xl border border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-lg p-4 transition-all duration-300">
            <DailyTrendsChart dailyJobData={dailyJobData} isLoading={chartLoading} />
          </div>
        </div>

        <div className="col-span-4">
          <div className="h-full rounded-2xl shadow-xl border border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-lg p-4 transition-all duration-300">
            <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-4">
          <div className="h-full rounded-2xl shadow-xl border border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-lg p-4">
            <QuickSearch
              searchQuery={searchQuery}
              filteredJobs={filteredJobs}
              onViewDetails={handleViewDetails}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        <div className="col-span-4">
          <div className="h-full rounded-2xl shadow-xl border border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-lg p-4">
            <ActivitiesSection />
          </div>
        </div>

        <div className="col-span-2">
          <div className="h-full rounded-2xl shadow-xl border border-white/10 bg-white/20 dark:bg-black/30 backdrop-blur-lg p-4">
            <ShortcutGadgets onViewChange={onViewChange} />
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


import { useState } from "react";
import { Job } from "@/pages/Index";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { JobStatusOverview } from "@/components/dashboard/JobStatusOverview";
import { ApprovalBox } from "@/components/dashboard/ApprovalBox";
import { HighPriorityReminder } from "@/components/dashboard/HighPriorityReminder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "settings" | "admin" | "admin-management" | "reports") => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
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
    cancelled: jobs.filter(job => job.status === "cancelled").length
  };

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="pl-10 w-64 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
            {showSearchDropdown && searchFilteredJobs.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">
                    Found {searchFilteredJobs.length} job{searchFilteredJobs.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1">
                    {searchFilteredJobs.slice(0, 10).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-500 truncate">{job.jobOrderNumber}</p>
                          <p className="text-xs text-gray-400 truncate">{job.customer}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleViewDetails(job);
                              setShowSearchDropdown(false);
                              setSearchQuery("");
                            }}
                            className="p-1 h-7 w-7 rounded-full border-blue-200 hover:bg-blue-100"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {searchFilteredJobs.length > 10 && (
                    <div className="text-xs text-gray-500 text-center mt-2 pb-1">
                      And {searchFilteredJobs.length - 10} more...
                    </div>
                  )}
                </div>
              </div>
            )}
            {showSearchDropdown && searchQuery && searchFilteredJobs.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border z-50 p-4">
                <div className="text-center text-gray-500 text-sm">
                  <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  No jobs found matching "{searchQuery}"
                </div>
              </div>
            )}
          </div>
          <DashboardNotifications />
        </div>
      </div>

      {/* High Priority Reminder Banner */}
      <HighPriorityReminder jobs={jobs} onViewJob={handleViewDetails} />

      <div className="grid grid-cols-10 gap-6 h-[400px]">
        <div className="col-span-6 relative">
          <div className="glass-effect rounded-xl p-1">
            <ApprovalBox />
          </div>
        </div>
        
        <div className="col-span-4 relative">
          <div className="glass-effect rounded-xl p-1">
            <JobStatusOverview stats={stats} onStatusClick={handleStatusClick} />
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

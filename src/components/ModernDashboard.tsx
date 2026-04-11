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
import { useGamingMode } from "@/App";
import { cn } from "@/lib/utils";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "settings" | "admin" | "admin-management" | "reports") => void;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
  const { gamingMode } = useGamingMode();
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
    <div className={cn(
      "space-y-6 p-6 min-h-screen transition-all duration-500",
      gamingMode && "relative"
    )}>
      {gamingMode && (
        <>
          {/* Animated background grid */}
          <div className="fixed inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-cyan-900/20"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 150, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 150, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          {/* Scanline effect */}
          <div className="fixed inset-0 pointer-events-none opacity-5">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-green-400/20 to-transparent"></div>
          </div>
        </>
      )}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className={cn(
            "text-4xl font-bold mb-2 transition-all duration-500",
            gamingMode 
              ? "bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,150,0.5)]" 
              : "bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent"
          )}>
            {gamingMode ? "COMMAND CENTER" : "Dashboard"}
          </h1>
          <p className={cn(
            "text-lg transition-all duration-500",
            gamingMode ? "text-green-400/80 font-mono tracking-wide" : "text-muted-foreground"
          )}>
            {gamingMode ? "SYSTEM STATUS: OPERATIONAL // MISSION CONTROL ACTIVE" : "Welcome back! Here's what's happening with your projects."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300",
              gamingMode ? "text-green-400" : "text-gray-400"
            )} />
            <Input
              placeholder={gamingMode ? "SCAN DATABASE..." : "Search jobs..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className={cn(
                "pl-10 w-64 rounded-full border-2 transition-all duration-300",
                gamingMode 
                  ? "border-green-400/50 bg-gray-900/50 text-green-400 placeholder-green-400/50 focus:border-green-400 focus:shadow-[0_0_20px_rgba(0,255,150,0.3)] backdrop-blur-sm" 
                  : "border-gray-200 focus:border-blue-500"
              )}
            />
            {showSearchDropdown && searchFilteredJobs.length > 0 && (
              <div className={cn(
                "absolute top-full mt-2 w-full rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto transition-all duration-300",
                gamingMode 
                  ? "bg-gray-900/95 border-green-400/30 shadow-green-500/20 backdrop-blur-xl" 
                  : "bg-white border-gray-200"
              )}>
                <div className="p-2">
                  <div className={cn(
                    "text-xs mb-2 px-2",
                    gamingMode ? "text-green-400" : "text-gray-500"
                  )}>
                    {gamingMode ? `TARGETS ACQUIRED: ${searchFilteredJobs.length}` : `Found ${searchFilteredJobs.length} job${searchFilteredJobs.length !== 1 ? 's' : ''}`}
                  </div>
                  <div className="space-y-1">
                    {searchFilteredJobs.slice(0, 10).map((job) => (
                      <div key={job.id} className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:scale-105",
                        gamingMode 
                          ? "bg-green-900/20 border-green-400/20 hover:bg-green-800/30 hover:border-green-400/50 hover:shadow-[0_0_10px_rgba(0,255,150,0.2)]" 
                          : "bg-gray-50 hover:bg-blue-50 border-gray-100 hover:shadow-md"
                      )}>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            gamingMode ? "text-green-300" : "text-gray-900"
                          )}>{job.title}</p>
                          <p className={cn(
                            "text-xs truncate",
                            gamingMode ? "text-green-400/70" : "text-gray-500"
                          )}>{job.jobOrderNumber}</p>
                          <p className={cn(
                            "text-xs truncate",
                            gamingMode ? "text-cyan-400/70" : "text-gray-400"
                          )}>{job.customer}</p>
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
                            className={cn(
                              "p-1 h-7 w-7 rounded-full transition-all duration-200 hover:scale-110",
                              gamingMode 
                                ? "border-green-400/50 text-green-400 hover:bg-green-400/20 hover:border-green-400 hover:shadow-[0_0_10px_rgba(0,255,150,0.3)]" 
                                : "border-blue-200 hover:bg-blue-100"
                            )}
                          >
                            <Eye className={cn(
                              "w-3 h-3",
                              gamingMode ? "text-green-400" : "text-blue-600"
                            )} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {searchFilteredJobs.length > 10 && (
                    <div className={cn(
                      "text-xs text-center mt-2 pb-1",
                      gamingMode ? "text-green-400/70" : "text-gray-500"
                    )}>
                      {gamingMode ? `ADDITIONAL TARGETS: ${searchFilteredJobs.length - 10}` : `And ${searchFilteredJobs.length - 10} more...`}
                    </div>
                  )}
                </div>
              </div>
            )}
            {showSearchDropdown && searchQuery && searchFilteredJobs.length === 0 && (
              <div className={cn(
                "absolute top-full mt-2 w-full rounded-lg shadow-xl border z-50 p-4 transition-all duration-300",
                gamingMode 
                  ? "bg-gray-900/95 border-red-400/30 shadow-red-500/20 backdrop-blur-xl" 
                  : "bg-white border-gray-200"
              )}>
                <div className={cn(
                  "text-center text-sm",
                  gamingMode ? "text-red-400" : "text-gray-500"
                )}>
                  <Search className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    gamingMode ? "text-red-400/50" : "text-gray-300"
                  )} />
                  {gamingMode ? `NO TARGETS FOUND: "${searchQuery}"` : `No jobs found matching "${searchQuery}"`}
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
          <div className={cn(
            "rounded-xl p-1 transition-all duration-500",
            gamingMode 
              ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-green-400/30 shadow-[0_0_30px_rgba(0,255,150,0.1)]" 
              : "glass-effect"
          )}>
            <ApprovalBox />
          </div>
        </div>
        
        <div className="col-span-4 relative">
          <div className={cn(
            "rounded-xl p-1 transition-all duration-500",
            gamingMode 
              ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,100,0.1)]" 
              : "glass-effect"
          )}>
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

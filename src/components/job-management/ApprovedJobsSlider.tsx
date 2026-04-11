
import { useState, useEffect, useMemo, useCallback } from "react";
import { useGamingMode } from "@/App";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { JobDetails } from "@/components/JobDetails";
import { 
  Building, 
  Calendar, 
  User, 
  Briefcase, 
  ChevronUp, 
  ChevronDown,
  Eye,
  Edit,
  Search,
  RefreshCw
} from "lucide-react";

interface ApprovedJobsSliderProps {
  jobs: Job[];
  onStatusUpdate?: (jobId: string, status: string) => void;
  isSyncing?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const getStatusColor = (status: string) => {
  const colors = {
    "pending": "from-yellow-400 to-yellow-600",
    "in-progress": "from-blue-400 to-blue-600",
    "designing": "from-purple-400 to-purple-600",
    "completed": "from-green-400 to-green-600",
    "invoiced": "from-emerald-400 to-emerald-600",
    "cancelled": "from-red-400 to-red-600"
  };
  return colors[status as keyof typeof colors] || "from-gray-400 to-gray-600";
};

const getPriorityColor = (priority: string) => {
  const colors = {
    "high": "from-red-400 to-red-600",
    "medium": "from-orange-400 to-orange-600",
    "low": "from-green-400 to-green-600"
  };
  return colors[priority as keyof typeof colors] || "from-gray-400 to-gray-600";
};

function CyberCard({ icon: Icon, title, value, sub, gamingMode }: {
  icon: any;
  title: string;
  value: string;
  sub?: string;
  gamingMode: boolean;
}) {
  return (
    <div className={
      `cyber-card p-4 rounded-xl transition-all duration-300 ${gamingMode
        ? 'bg-slate-950/70 border border-cyan-400/20 shadow-[0_0_20px_rgba(0,255,204,0.1)] hover:shadow-[0_0_25px_rgba(0,255,204,0.3)]'
        : 'bg-gray-50'
      }`
    }>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-cyan-300" />
        <div>
          <p className="text-xs opacity-70">{title}</p>
          <p className="font-semibold">{value}</p>
          {sub && <p className="text-xs opacity-60">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export function ApprovedJobsSlider({ jobs, onStatusUpdate, isSyncing, isLoading, onRefresh }: ApprovedJobsSliderProps) {
  const { gamingMode } = useGamingMode();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedSalesman, setSelectedSalesman] = useState<string>("all");
  const [selectedDesigner, setSelectedDesigner] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("approved");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get unique branches
  const branches = Array.from(new Set(jobs.map(job => job.branch).filter(Boolean)));
  branches.unshift("all"); // Add "all" option

  // Get unique salesmen - sorted alphabetically (case-insensitive)
  const salesmen = Array.from(new Set(jobs.map(job => job.salesman).filter(Boolean)))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  salesmen.unshift("all"); // Add "all" option

  // Get unique designers - sorted alphabetically (case-insensitive)
  const designers = Array.from(new Set(jobs.map(job => job.designer).filter(Boolean)))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  designers.unshift("all"); // Add "all" option

  // Get unique customers - sorted alphabetically (case-insensitive)
  const customers = Array.from(new Set(jobs.map(job => job.customer).filter(Boolean)))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  customers.unshift("all"); // Add "all" option

  // Get unique statuses with approval status included
  const uniqueStatuses = Array.from(new Set(jobs.map(job => job.status).filter(Boolean)));
  const statuses = ["all", "approved", ...uniqueStatuses];

  // Filter jobs by branch, salesman, designer, customer, status, and search query
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const branchMatch = selectedBranch === "all" || job.branch === selectedBranch;
      const salesmanMatch = selectedSalesman === "all" || job.salesman === selectedSalesman;
      const designerMatch = selectedDesigner === "all" || job.designer === selectedDesigner;
      const customerMatch = selectedCustomer === "all" || job.customer === selectedCustomer;
      const statusMatch = selectedStatus === "all" || 
        (selectedStatus === "approved" ? job.approval_status === "approved" : job.status === selectedStatus);
      
      const searchMatch = searchQuery === "" || (() => {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        const searchableText = [
          job.jobOrderNumber,
          job.title,
          job.customer,
          job.clientName,
          job.jobOrderDetails,
          job.assignee,
          job.salesman,
          job.designer
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      })();
      
      return branchMatch && salesmanMatch && designerMatch && customerMatch && statusMatch && searchMatch;
    });
  }, [jobs, selectedBranch, selectedSalesman, selectedDesigner, selectedCustomer, selectedStatus, searchQuery]);

  const currentJob = useMemo(() => filteredJobs[selectedJobIndex] ?? null, [filteredJobs, selectedJobIndex]);

  // Reset index when filters change
  useEffect(() => {
    setSelectedJobIndex(0);
  }, [selectedBranch, selectedSalesman, selectedDesigner, selectedCustomer, selectedStatus, searchQuery]);

  const handleJobSelect = (jobNumber: string) => {
    const index = filteredJobs.findIndex(job => job.jobOrderNumber === jobNumber);
    if (index !== -1) {
      setSelectedJobIndex(index);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate && currentJob) {
      onStatusUpdate(currentJob.id, newStatus);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setIsEditMode(false);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setIsEditMode(true);
  };


  const handlePrevious = useCallback(() => {
    setSelectedJobIndex(prev => prev > 0 ? prev - 1 : filteredJobs.length - 1);
  }, [filteredJobs.length]);

  const handleNext = useCallback(() => {
    setSelectedJobIndex(prev => prev < filteredJobs.length - 1 ? prev + 1 : 0);
  }, [filteredJobs.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevious();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrevious]);

  if (filteredJobs.length === 0) {
    return (
      <div className={`p-6 min-h-screen ${gamingMode ? 'bg-[#020a12] text-cyan-100' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'}`}>
        <h1 className={`text-3xl font-bold mb-6 ${gamingMode ? 'text-cyan-300' : 'text-gray-900'}`}>Approved Jobs</h1>
        <Card className={`${gamingMode ? 'bg-slate-950/80 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,204,0.15)]' : 'text-center p-12'}`}>
          <p className={`${gamingMode ? 'text-cyan-200' : 'text-gray-500'}`}>No approved jobs found for the selected filters.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen relative ${gamingMode ? 'bg-[#020a12] text-cyan-100' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'}`}>
      {/* Sync Loading Overlay */}
      {(isSyncing || isLoading) && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-xl shadow-lg border">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? 'Loading jobs...' : 'Syncing jobs...'}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${gamingMode ? 'text-cyan-300' : 'text-gray-900'}`}>Job Orders</h1>
          <p className={`${gamingMode ? 'text-cyan-200' : 'text-gray-600'}`}>Interactive job order slider view - Total: {filteredJobs.length} jobs</p>
        </div>
        <div className="flex items-center gap-4">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isSyncing || isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${gamingMode ? 'text-cyan-300' : 'text-gray-400'}`} />
            <Input
              placeholder="Search job orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 w-64 ${gamingMode ? 'bg-slate-900/80 text-cyan-100 border-cyan-500/20' : ''}`}
            />
          </div>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.slice(1).map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Salesman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salesmen</SelectItem>
              {salesmen.slice(1).map((salesman) => (
                <SelectItem key={salesman} value={salesman}>
                  {salesman}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDesigner} onValueChange={setSelectedDesigner}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Designer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designers</SelectItem>
              {designers.slice(1).map((designer) => (
                <SelectItem key={designer} value={designer}>
                  {designer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.slice(1).map((customer) => (
                <SelectItem key={customer} value={customer}>
                  {customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved Jobs</SelectItem>
              {statuses.slice(2).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Selection Panel */}
        <Card className={` ${gamingMode ? 'bg-slate-950/80 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,204,0.15)]' : 'bg-white/90 backdrop-blur-sm shadow-xl'}`}>
          <CardHeader>
            <CardTitle className={`text-lg ${gamingMode ? 'text-cyan-200' : ''}`}>Job Orders ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className={`space-y-2 max-h-[500px] overflow-y-auto scroll-smooth snap-y snap-mandatory ${gamingMode ? 'text-cyan-100' : ''}`}>
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                onClick={() => handleJobSelect(job.jobOrderNumber)}
                className={`relative snap-start p-3 rounded-lg cursor-pointer transition-all duration-300 transform ${
                  index === selectedJobIndex
                    ? gamingMode
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_30px_rgba(0,255,204,0.4)] scale-[1.05] cyber-active'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                    : gamingMode
                      ? 'bg-slate-900/70 hover:bg-slate-800/80 text-cyan-100 hover:scale-[1.02]'
                      : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {index === selectedJobIndex && gamingMode && (
                  <div className="absolute right-2 top-2 text-xs uppercase opacity-75 tracking-[0.15em] text-cyan-200">
                    ▶ ACTIVE
                  </div>
                )}
                <div className="font-medium text-sm">{job.jobOrderNumber}</div>
                <div className="text-xs opacity-80 truncate">{job.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Job Details Panel */}
        <Card className={`lg:col-span-2 min-h-[600px] ${gamingMode ? 'bg-slate-950/80 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,204,0.15)]' : 'bg-white/90 backdrop-blur-sm shadow-xl'}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <div className={`text-sm ${gamingMode ? 'text-cyan-200' : 'text-gray-500'}`}>
                    {selectedJobIndex + 1} of {filteredJobs.length}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(currentJob)}
                  className={gamingMode ? 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,204,0.5)]' : ''}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditJob(currentJob)}
                  className={gamingMode ? 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,204,0.5)]' : ''}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Cyber Header */}
            <div className={
              `relative p-6 rounded-xl overflow-hidden ${gamingMode 
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-400/10 border border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,204,0.2)]'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              }`
            }>
              {gamingMode && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,204,0.2),transparent)] pointer-events-none" />
              )}
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-sm opacity-70">JOB ID</p>
                  <h2 className="text-2xl font-bold">{currentJob.jobOrderNumber}</h2>
                  <p className="opacity-80">{currentJob.title}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={gamingMode ? 'bg-cyan-400 text-black' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'}>
                    {currentJob.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CyberCard
                icon={Building}
                title="Customer"
                value={currentJob.customer}
                sub={currentJob.clientName}
                gamingMode={gamingMode}
              />

              <CyberCard
                icon={User}
                title="Salesman"
                value={currentJob.salesman}
                gamingMode={gamingMode}
              />

              <CyberCard
                icon={Calendar}
                title="Due Date"
                value={new Date(currentJob.dueDate).toLocaleDateString()}
                gamingMode={gamingMode}
              />

              <CyberCard
                icon={Briefcase}
                title="Estimated Hours"
                value={`${currentJob.estimatedHours}h`}
                gamingMode={gamingMode}
              />
            </div>

            {currentJob.jobOrderDetails && (
              <div className={
                `p-4 rounded-xl font-mono text-sm ${gamingMode
                  ? 'bg-black/80 border border-cyan-400/20 text-cyan-200 shadow-inner'
                  : 'bg-gray-50 text-gray-800'
                }`
              }>
                <p className="mb-2 text-xs opacity-60">SYSTEM LOG</p>
                <pre className="whitespace-pre-wrap leading-relaxed">{currentJob.jobOrderDetails}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}

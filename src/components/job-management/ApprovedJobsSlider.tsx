
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  RefreshCw,
  Zap,
  Shield,
  Clock,
  FileText
} from "lucide-react";

interface ApprovedJobsSliderProps {
  jobs: Job[];
  onStatusUpdate?: (jobId: string, status: string) => void;
  isSyncing?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "pending": "from-yellow-400 to-yellow-600",
    "in-progress": "from-blue-400 to-blue-600",
    "designing": "from-purple-400 to-purple-600",
    "completed": "from-green-400 to-green-600",
    "invoiced": "from-emerald-400 to-emerald-600",
    "cancelled": "from-red-400 to-red-600"
  };
  return colors[status] || "from-gray-400 to-gray-600";
};

const getStatusOptions = () => [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "designing", label: "Designing" },
  { value: "completed", label: "Completed" },
  { value: "finished", label: "Finished" },
  { value: "invoiced", label: "Invoiced" },
  { value: "cancelled", label: "Cancelled" }
];

const getNeonStatusColor = (status: string) => {
  const colors: Record<string, { border: string; glow: string; text: string }> = {
    "pending": { border: "border-yellow-400/60", glow: "shadow-[0_0_20px_rgba(250,204,21,0.4)]", text: "text-yellow-300" },
    "in-progress": { border: "border-blue-400/60", glow: "shadow-[0_0_20px_rgba(96,165,250,0.4)]", text: "text-blue-300" },
    "designing": { border: "border-purple-400/60", glow: "shadow-[0_0_20px_rgba(192,132,252,0.4)]", text: "text-purple-300" },
    "completed": { border: "border-green-400/60", glow: "shadow-[0_0_20px_rgba(74,222,128,0.4)]", text: "text-green-300" },
    "invoiced": { border: "border-emerald-400/60", glow: "shadow-[0_0_20px_rgba(52,211,153,0.4)]", text: "text-emerald-300" },
    "cancelled": { border: "border-red-400/60", glow: "shadow-[0_0_20px_rgba(248,113,113,0.4)]", text: "text-red-300" },
  };
  return colors[status] || { border: "border-cyan-400/40", glow: "shadow-[0_0_20px_rgba(0,255,204,0.3)]", text: "text-cyan-300" };
};

function HoloDetailCard({ icon: Icon, label, value, sub, gamingMode }: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  gamingMode: boolean;
}) {
  if (!gamingMode) {
    return (
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="holo-detail-card group relative p-4 rounded-xl bg-slate-950/60 border border-cyan-400/20 overflow-hidden transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,255,204,0.2)]">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,204,0.08),transparent_70%)]" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
          <Icon className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,204,0.6)]" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60 font-mono">{label}</p>
          <p className="font-semibold text-cyan-100 text-sm">{value}</p>
          {sub && <p className="text-xs text-cyan-300/50">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

/* 3D Dialer Component */
function JobDialer({ 
  jobs, 
  selectedIndex, 
  onSelect 
}: { 
  jobs: Job[]; 
  selectedIndex: number; 
  onSelect: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const VISIBLE_COUNT = 7;
  const ITEM_ANGLE = 25; // degrees of rotation per slot

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      onSelect(Math.min(selectedIndex + 1, jobs.length - 1));
    } else {
      onSelect(Math.max(selectedIndex - 1, 0));
    }
  }, [selectedIndex, jobs.length, onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Calculate visible items window
  const halfVisible = Math.floor(VISIBLE_COUNT / 2);
  const visibleItems: { job: Job; offset: number; realIndex: number }[] = [];

  for (let offset = -halfVisible; offset <= halfVisible; offset++) {
    const realIndex = selectedIndex + offset;
    if (realIndex >= 0 && realIndex < jobs.length) {
      visibleItems.push({ job: jobs[realIndex], offset, realIndex });
    }
  }

  return (
    <div 
      ref={containerRef}
      className="dialer-container relative flex flex-col items-center justify-center"
      style={{ height: '520px', perspective: '800px' }}
    >
      {/* Up arrow */}
      <button 
        onClick={() => onSelect(Math.max(selectedIndex - 1, 0))}
        className="absolute top-2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 transition-all animate-pulse"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Dialer items */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center">
        {visibleItems.map(({ job, offset, realIndex }) => {
          const absOffset = Math.abs(offset);
          const rotateX = offset * ITEM_ANGLE;
          const scale = 1 - absOffset * 0.12;
          const opacity = 1 - absOffset * 0.22;
          const translateZ = -absOffset * 30;
          const isActive = offset === 0;

          return (
            <div
              key={job.id}
              onClick={() => onSelect(realIndex)}
              className="dialer-item absolute w-[85%] cursor-pointer"
              style={{
                transform: `perspective(800px) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`,
                opacity: Math.max(opacity, 0.15),
                zIndex: VISIBLE_COUNT - absOffset,
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                top: `calc(50% + ${offset * 58}px - 28px)`,
              }}
            >
              <div className={`
                relative px-4 py-3 rounded-xl border transition-all duration-300
                ${isActive 
                  ? 'dialer-item-active bg-gradient-to-r from-cyan-500/20 to-teal-400/10 border-cyan-400/60 shadow-[0_0_35px_rgba(0,255,204,0.4),inset_0_0_20px_rgba(0,255,204,0.1)]' 
                  : 'bg-slate-900/60 border-cyan-400/10 hover:border-cyan-400/30'
                }
              `}>
                {/* Neon glow line on active */}
                {isActive && (
                  <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-mono font-bold text-sm tracking-wider ${isActive ? 'text-cyan-200 drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]' : 'text-cyan-400/70'}`}>
                      {job.jobOrderNumber}
                    </p>
                    <p className={`text-xs truncate max-w-[160px] ${isActive ? 'text-cyan-100/80' : 'text-cyan-300/40'}`}>
                      {job.title}
                    </p>
                  </div>
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,204,0.8)] animate-pulse' : 'bg-cyan-400/30'}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Down arrow */}
      <button 
        onClick={() => onSelect(Math.min(selectedIndex + 1, jobs.length - 1))}
        className="absolute bottom-2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 transition-all animate-pulse"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-14 font-mono text-[10px] tracking-[0.3em] text-cyan-400/50 uppercase">
        {selectedIndex + 1} / {jobs.length}
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

  const branches = Array.from(new Set(jobs.map(job => job.branch).filter(Boolean)));
  branches.unshift("all");

  const salesmen = Array.from(new Set(jobs.map(job => job.salesman).filter(Boolean)))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  salesmen.unshift("all");

  const designers = Array.from(new Set(jobs.map(job => job.designer).filter(Boolean)))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  designers.unshift("all");

  const customers = Array.from(new Set(jobs.map(job => job.customer).filter(Boolean)))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  customers.unshift("all");

  const uniqueStatuses = Array.from(new Set(jobs.map(job => job.status).filter(Boolean)));
  const statuses = ["all", "approved", ...uniqueStatuses];

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
          job.jobOrderNumber, job.title, job.customer, job.clientName,
          job.jobOrderDetails, job.assignee, job.salesman, job.designer
        ].filter(Boolean).join(' ').toLowerCase();
        return searchTerms.some(term => searchableText.includes(term));
      })();
      
      return branchMatch && salesmanMatch && designerMatch && customerMatch && statusMatch && searchMatch;
    });
  }, [jobs, selectedBranch, selectedSalesman, selectedDesigner, selectedCustomer, selectedStatus, searchQuery]);

  const currentJob = useMemo(() => filteredJobs[selectedJobIndex] ?? null, [filteredJobs, selectedJobIndex]);

  useEffect(() => {
    setSelectedJobIndex(0);
  }, [selectedBranch, selectedSalesman, selectedDesigner, selectedCustomer, selectedStatus, searchQuery]);

  const handleJobSelect = useCallback((jobNumber: string) => {
    const index = filteredJobs.findIndex(job => job.jobOrderNumber === jobNumber);
    if (index !== -1) setSelectedJobIndex(index);
  }, [filteredJobs]);

  const handleJobSelectByIndex = useCallback((index: number) => {
    setSelectedJobIndex(index);
  }, []);

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate && currentJob) onStatusUpdate(currentJob.id, newStatus);
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
      if (e.key === "ArrowUp") { e.preventDefault(); handlePrevious(); }
      if (e.key === "ArrowDown") { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrevious]);

  if (filteredJobs.length === 0) {
    return (
      <div className={`p-6 min-h-screen ${gamingMode ? 'bg-[#020a12] text-cyan-100' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'}`}>
        <h1 className={`text-3xl font-bold mb-6 ${gamingMode ? 'text-cyan-300' : 'text-gray-900'}`}>Approved Jobs</h1>
        <Card className={`${gamingMode ? 'bg-slate-950/80 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,204,0.15)]' : 'text-center p-12'}`}>
          <p className={`p-8 ${gamingMode ? 'text-cyan-200' : 'text-gray-500'}`}>No approved jobs found for the selected filters.</p>
        </Card>
      </div>
    );
  }

  const statusNeon = currentJob ? getNeonStatusColor(currentJob.status) : getNeonStatusColor('');

  // ─── GAMING MODE RENDER ────────────────────────────────────────────
  if (gamingMode) {
    return (
      <div className="p-6 min-h-screen relative bg-[#020a12] text-cyan-100 overflow-hidden">
        {/* Animated energy background */}
        <div className="holographic-bg absolute inset-0 pointer-events-none" />
        <div className="data-stream-bg absolute inset-0 pointer-events-none opacity-[0.03]" />

        {/* Sync overlay */}
        {(isSyncing || isLoading) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-slate-950 border border-cyan-400/30 px-5 py-4 rounded-xl shadow-[0_0_40px_rgba(0,255,204,0.3)]">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span className="text-sm font-mono text-cyan-200 tracking-wider">
                {isLoading ? '[ LOADING DATA... ]' : '[ SYNCING... ]'}
              </span>
            </div>
          </div>
        )}

        {/* Header bar */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,204,0.4)]">
              ◈ COMMAND CENTER
            </h1>
            <p className="text-xs text-cyan-400/50 font-mono tracking-[0.3em] mt-1">
              ACTIVE OPERATIONS: {filteredJobs.length}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isSyncing || isLoading}
                className="bg-cyan-400/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 font-mono text-xs">
                <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} /> SYNC
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
              <Input placeholder="SEARCH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-52 bg-slate-950/80 text-cyan-100 border-cyan-400/20 font-mono text-xs placeholder:text-cyan-400/30 focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(0,255,204,0.2)]" />
            </div>
            {[
              { val: selectedBranch, set: setSelectedBranch, items: branches, label: "BRANCH", w: "w-40" },
              { val: selectedSalesman, set: setSelectedSalesman, items: salesmen, label: "SALESMAN", w: "w-36" },
              { val: selectedDesigner, set: setSelectedDesigner, items: designers, label: "DESIGNER", w: "w-36" },
              { val: selectedCustomer, set: setSelectedCustomer, items: customers, label: "CUSTOMER", w: "w-40" },
              { val: selectedStatus, set: setSelectedStatus, items: statuses, label: "STATUS", w: "w-40" },
            ].map(({ val, set, items, label, w }) => (
              <Select key={label} value={val} onValueChange={set}>
                <SelectTrigger className={`${w} bg-slate-950/80 border-cyan-400/20 text-cyan-200 font-mono text-xs`}>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-cyan-400/20 text-cyan-200">
                  <SelectItem value="all">ALL {label}S</SelectItem>
                  {items.slice(1).map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>

        {/* Main layout: Dialer + Holographic Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* LEFT: 3D Dialer */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl border border-cyan-400/20 bg-slate-950/60 backdrop-blur-sm overflow-hidden shadow-[0_0_40px_rgba(0,255,204,0.08)]">
              {/* Dialer header */}
              <div className="px-4 py-3 border-b border-cyan-400/10">
                <p className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50 uppercase">Job Selector</p>
              </div>
              <JobDialer 
                jobs={filteredJobs} 
                selectedIndex={selectedJobIndex} 
                onSelect={handleJobSelectByIndex} 
              />
            </div>
          </div>

          {/* RIGHT: Holographic Detail Panel */}
          <div className="lg:col-span-9">
            <div className="holographic-panel relative rounded-2xl border border-cyan-400/20 bg-slate-950/40 backdrop-blur-md overflow-hidden min-h-[600px] shadow-[0_0_60px_rgba(0,255,204,0.1)]">
              {/* Animated border travel */}
              <div className="border-travel-effect absolute inset-0 rounded-2xl pointer-events-none" />
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,204,0.1)_2px,rgba(0,255,204,0.1)_4px)]" />

              {/* Header section */}
              <div className="relative p-6 border-b border-cyan-400/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Hex priority badge */}
                    <div className="hex-priority relative w-14 h-14 flex items-center justify-center">
                      <div className={`absolute inset-0 hex-priority-shape ${
                        currentJob?.priority === 'high' ? 'bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.5)]' :
                        currentJob?.priority === 'medium' ? 'bg-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.5)]' :
                        'bg-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                      }`} />
                      <Zap className={`w-6 h-6 relative z-10 ${
                        currentJob?.priority === 'high' ? 'text-red-400' :
                        currentJob?.priority === 'medium' ? 'text-orange-400' :
                        'text-green-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50">MISSION ID</p>
                      <h2 className="text-3xl font-bold font-mono text-cyan-200 tracking-wider drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]">
                        {currentJob?.jobOrderNumber}
                      </h2>
                      <p className="text-sm text-cyan-300/60 mt-0.5">{currentJob?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Status select with ring */}
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${statusNeon.glow}`} />
                      <Select 
                        value={currentJob?.status || ''} 
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className={`relative w-40 bg-slate-950/80 border ${statusNeon.border} ${statusNeon.text} font-mono text-xs tracking-wider ${statusNeon.glow}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-cyan-400/20 text-cyan-200">
                          {getStatusOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => currentJob && handleViewDetails(currentJob)}
                      className="bg-cyan-400/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] font-mono text-xs transition-all">
                      <Eye className="w-4 h-4 mr-1" /> VIEW
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => currentJob && handleEditJob(currentJob)}
                      className="bg-cyan-400/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] font-mono text-xs transition-all">
                      <Edit className="w-4 h-4 mr-1" /> EDIT
                    </Button>
                  </div>
                </div>
              </div>

              {/* Detail cards grid */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <HoloDetailCard icon={Building} label="Customer" value={currentJob?.customer || '—'} sub={currentJob?.clientName} gamingMode />
                  <HoloDetailCard icon={User} label="Salesman" value={currentJob?.salesman || '—'} gamingMode />
                  <HoloDetailCard icon={Calendar} label="Due Date" value={currentJob?.dueDate ? new Date(currentJob.dueDate).toLocaleDateString() : '—'} gamingMode />
                  <HoloDetailCard icon={Clock} label="Est. Hours" value={currentJob?.estimatedHours ? `${currentJob.estimatedHours}h` : '—'} gamingMode />
                </div>

                {/* Additional info row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <HoloDetailCard icon={Shield} label="Priority" value={currentJob?.priority?.toUpperCase() || '—'} gamingMode />
                  <HoloDetailCard icon={Briefcase} label="Branch" value={currentJob?.branch || '—'} gamingMode />
                  <HoloDetailCard icon={FileText} label="Designer" value={currentJob?.designer || '—'} gamingMode />
                </div>

                {/* Job details / system log */}
                {currentJob?.jobOrderDetails && (
                  <div className="relative p-5 rounded-xl bg-black/60 border border-cyan-400/15 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,204,0.15)_2px,rgba(0,255,204,0.15)_4px)]" />
                    <p className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/40 mb-3 relative z-10">◈ MISSION BRIEFING</p>
                    <pre className="whitespace-pre-wrap leading-relaxed text-sm text-cyan-200/80 font-mono relative z-10">
                      {currentJob.jobOrderDetails}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
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

  // ─── NORMAL MODE RENDER ────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900">
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Job Orders</h1>
          <p className="text-gray-600">Interactive job order slider view - Total: {filteredJobs.length} jobs</p>
        </div>
        <div className="flex items-center gap-4">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isSyncing || isLoading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search job orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
          </div>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Branch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.slice(1).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Salesman" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salesmen</SelectItem>
              {salesmen.slice(1).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedDesigner} onValueChange={setSelectedDesigner}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Designer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designers</SelectItem>
              {designers.slice(1).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Customer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.slice(1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved Jobs</SelectItem>
              {statuses.slice(2).map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Job Orders ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredJobs.map((job, index) => (
              <div key={job.id} onClick={() => handleJobSelect(job.jobOrderNumber)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  index === selectedJobIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                <div className="font-medium text-sm">{job.jobOrderNumber}</div>
                <div className="text-xs opacity-80 truncate">{job.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 min-h-[600px] bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handlePrevious} className="rounded-full w-8 h-8 p-0">
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <div className="text-sm text-gray-500">{selectedJobIndex + 1} of {filteredJobs.length}</div>
                <Button variant="outline" size="sm" onClick={handleNext} className="rounded-full w-8 h-8 p-0">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Select 
                  value={currentJob?.status || ''} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStatusOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => currentJob && handleViewDetails(currentJob)}>
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => currentJob && handleEditJob(currentJob)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`relative p-6 rounded-xl overflow-hidden bg-gradient-to-r ${getStatusColor(currentJob?.status || 'pending')} text-white`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">JOB ID</p>
                  <h2 className="text-2xl font-bold">{currentJob?.jobOrderNumber}</h2>
                  <p className="opacity-80">{currentJob?.title}</p>
                </div>
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">{currentJob?.priority}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HoloDetailCard icon={Building} label="Customer" value={currentJob?.customer || '—'} sub={currentJob?.clientName} gamingMode={false} />
              <HoloDetailCard icon={User} label="Salesman" value={currentJob?.salesman || '—'} gamingMode={false} />
              <HoloDetailCard icon={Calendar} label="Due Date" value={currentJob?.dueDate ? new Date(currentJob.dueDate).toLocaleDateString() : '—'} gamingMode={false} />
              <HoloDetailCard icon={Briefcase} label="Est. Hours" value={currentJob?.estimatedHours ? `${currentJob.estimatedHours}h` : '—'} gamingMode={false} />
            </div>
            {currentJob?.jobOrderDetails && (
              <div className="p-4 rounded-xl bg-gray-50 text-gray-800">
                <p className="mb-2 text-xs opacity-60">DETAILS</p>
                <pre className="whitespace-pre-wrap leading-relaxed text-sm">{currentJob.jobOrderDetails}</pre>
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

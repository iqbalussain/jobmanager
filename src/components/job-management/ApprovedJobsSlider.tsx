
import { useState, useRef, useEffect } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobDetails } from "@/components/JobDetails";
import { CylindricalJobSlider } from "./CylindricalJobSlider";
import { 
  Building, 
  Calendar, 
  User, 
  Briefcase,
  Eye,
  Edit
} from "lucide-react";

interface ApprovedJobsSliderProps {
  jobs: Job[];
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ApprovedJobsSlider({ jobs, onStatusUpdate }: ApprovedJobsSliderProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get unique branches
  const branches = Array.from(new Set(jobs.map(job => job.branch).filter(Boolean)));
  branches.unshift("all");

  // Filter jobs by branch
  const filteredJobs = selectedBranch === "all" 
    ? jobs 
    : jobs.filter(job => job.branch === selectedBranch);

  // Reset index when branch changes
  useEffect(() => {
    setSelectedJobIndex(0);
  }, [selectedBranch]);

  const handleJobSelect = (index: number) => {
    setSelectedJobIndex(index);
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

  if (filteredJobs.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Approved Jobs</h1>
        <Card className="text-center p-12">
          <p className="text-gray-500">No approved jobs found for the selected branch.</p>
        </Card>
      </div>
    );
  }

  const currentJob = filteredJobs[selectedJobIndex];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Approved Jobs</h1>
          <p className="text-blue-200">3D Interactive Job Order Slider</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 3D Cylindrical Job Slider */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-lg shadow-2xl border-white/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <CardTitle className="text-white text-lg">
                Job Orders ({filteredJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CylindricalJobSlider
                jobs={filteredJobs}
                selectedIndex={selectedJobIndex}
                onJobSelect={handleJobSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Job Details Panel */}
        <Card className="lg:col-span-3 bg-white/5 backdrop-blur-lg shadow-2xl border-white/10 min-h-[600px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-sm text-blue-200">
                  Job {selectedJobIndex + 1} of {filteredJobs.length}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(currentJob)}
                  className="bg-blue-500/20 border-blue-400/30 text-white hover:bg-blue-500/30"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditJob(currentJob)}
                  className="bg-purple-500/20 border-purple-400/30 text-white hover:bg-purple-500/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Job Header */}
            <div className={`p-6 rounded-xl bg-gradient-to-r ${getStatusColor(currentJob.status)} text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6" />
                  <span className="font-bold text-lg">#{currentJob.jobOrderNumber}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={`bg-gradient-to-r ${getPriorityColor(currentJob.priority)} border-0 text-white shadow-md`}>
                    {currentJob.priority} Priority
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {currentJob.status}
                  </Badge>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">{currentJob.title}</h2>
            </div>

            {/* Job Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-lg backdrop-blur-sm border border-blue-400/20">
                  <Building className="w-5 h-5 text-blue-300" />
                  <div>
                    <div className="text-sm text-blue-200">Customer</div>
                    <div className="font-medium text-white">{currentJob.customer}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-400/20">
                  <User className="w-5 h-5 text-green-300" />
                  <div>
                    <div className="text-sm text-green-200">Salesman</div>
                    <div className="font-medium text-white">{currentJob.salesman}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-400/20">
                  <Calendar className="w-5 h-5 text-purple-300" />
                  <div>
                    <div className="text-sm text-purple-200">Due Date</div>
                    <div className="font-medium text-white">{new Date(currentJob.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/20">
                  <Briefcase className="w-5 h-5 text-orange-300" />
                  <div>
                    <div className="text-sm text-orange-200">Estimated Hours</div>
                    <div className="font-medium text-white">{currentJob.estimatedHours}h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            {currentJob.jobOrderDetails && (
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                <h3 className="font-medium text-blue-200 mb-2">Job Details</h3>
                <p className="text-sm text-white/80 whitespace-pre-wrap">
                  {currentJob.jobOrderDetails}
                </p>
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

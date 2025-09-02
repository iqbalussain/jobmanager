
import { useState, useRef, useEffect } from "react";
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
  Search
} from "lucide-react";

interface ApprovedJobsSliderProps {
  jobs: Job[];
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ApprovedJobsSlider({ jobs, onStatusUpdate }: ApprovedJobsSliderProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedSalesman, setSelectedSalesman] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Get unique branches
  const branches = Array.from(new Set(jobs.map(job => job.branch).filter(Boolean)));
  branches.unshift("all"); // Add "all" option

  // Get unique salesmen
  const salesmen = Array.from(new Set(jobs.map(job => job.salesman).filter(Boolean)));
  salesmen.unshift("all"); // Add "all" option

  // Get unique statuses
  const uniqueStatuses = Array.from(new Set(jobs.map(job => job.status).filter(Boolean)));
  const statuses = ["all", ...uniqueStatuses];

  // Filter jobs by branch, salesman, status, and search query
  const filteredJobs = jobs.filter(job => {
    const branchMatch = selectedBranch === "all" || job.branch === selectedBranch;
    const salesmanMatch = selectedSalesman === "all" || job.salesman === selectedSalesman;
    const statusMatch = selectedStatus === "all" || job.status === selectedStatus;
    
    // Enhanced search functionality - split search query into words and check for partial matches
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
      
      // Check if any search term matches any part of the searchable text
      return searchTerms.some(term => searchableText.includes(term));
    })();
    
    return branchMatch && salesmanMatch && statusMatch && searchMatch;
  });

  // Reset index when filters change
  useEffect(() => {
    setSelectedJobIndex(0);
  }, [selectedBranch, selectedSalesman, selectedStatus, searchQuery]);

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

  const handlePrevious = () => {
    setSelectedJobIndex(prev => prev > 0 ? prev - 1 : filteredJobs.length - 1);
  };

  const handleNext = () => {
    setSelectedJobIndex(prev => prev < filteredJobs.length - 1 ? prev + 1 : 0);
  };

  if (filteredJobs.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Approved Jobs</h1>
        <Card className="text-center p-12">
          <p className="text-gray-500">No approved jobs found for the selected filters.</p>
        </Card>
      </div>
    );
  }

  const currentJob = filteredJobs[selectedJobIndex];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approved Jobs</h1>
          <p className="text-gray-600">Interactive job order slider view</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search job orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
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
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Salesman" />
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.slice(1).map((status) => (
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
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Job Orders ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                onClick={() => handleJobSelect(job.jobOrderNumber)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  index === selectedJobIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-sm">{job.jobOrderNumber}</div>
                <div className="text-xs opacity-80 truncate">{job.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Job Details Panel */}
        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl min-h-[600px]">
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
                  <div className="text-sm text-gray-500">
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
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditJob(currentJob)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Job Header */}
            <div className={`p-6 rounded-xl bg-gradient-to-r ${getStatusColor(currentJob.status)} text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6" />
                  <span className="font-bold text-lg">{currentJob.jobOrderNumber}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={`bg-gradient-to-r ${getPriorityColor(currentJob.priority)} border-0 text-white`}>
                    {currentJob.priority} Priority
                  </Badge>
                  <Select value={currentJob.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-white/20 text-white border-0 h-6 text-xs min-w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="designing">Designing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">{currentJob.title}</h2>
            </div>

            {/* Job Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Customer</div>
                    <div className="font-medium">{currentJob.customer}</div>
                    {currentJob.clientName && (
                      <div className="text-sm text-gray-500">Client: {currentJob.clientName}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Salesman</div>
                    <div className="font-medium">{currentJob.salesman}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Due Date</div>
                    <div className="font-medium">{new Date(currentJob.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">Estimated Hours</div>
                    <div className="font-medium">{currentJob.estimatedHours}h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            {currentJob.jobOrderDetails && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Job Details</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
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

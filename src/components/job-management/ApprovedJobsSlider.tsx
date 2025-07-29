// Updated ApprovedJobsSlider.tsx
import { useState, useRef, useEffect } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";

interface ApprovedJobsSliderProps {
  jobs: Job[];
  userRole: string;
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ApprovedJobsSlider({ jobs, userRole, onStatusUpdate }: ApprovedJobsSliderProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedSalesman, setSelectedSalesman] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const branches = Array.from(new Set(jobs.map((job) => job.branch).filter(Boolean)));
  branches.unshift("all");

  const salesmen = Array.from(new Set(jobs.map((job) => job.salesman).filter(Boolean)));
  salesmen.unshift("all");

  const filteredJobs = jobs.filter((job) => {
    const branchMatch = selectedBranch === "all" || job.branch === selectedBranch;
    const salesmanMatch = selectedSalesman === "all" || job.salesman === selectedSalesman;
    const searchMatch =
      searchQuery === "" ||
      (job.jobOrderDetails && job.jobOrderDetails.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase());

    return branchMatch && salesmanMatch && searchMatch;
  });

  useEffect(() => {
    setSelectedJobIndex(null);
    setSelectedJob(null);
  }, [selectedBranch, selectedSalesman, searchQuery]);

  const handleJobSelect = (jobNumber: string) => {
    const index = filteredJobs.findIndex((job) => job.jobOrderNumber === jobNumber);
    if (index !== -1) {
      setSelectedJobIndex(index);
      setSelectedJob(filteredJobs[index]);
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
      pending: "from-yellow-400 to-yellow-600",
      "in-progress": "from-blue-400 to-blue-600",
      designing: "from-purple-400 to-purple-600",
      completed: "from-green-400 to-green-600",
      invoiced: "from-emerald-400 to-emerald-600",
      cancelled: "from-red-400 to-red-600",
    };
    return colors[status as keyof typeof colors] || "from-gray-400 to-gray-600";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "from-red-400 to-red-600",
      medium: "from-orange-400 to-orange-600",
      low: "from-green-400 to-green-600",
    };
    return colors[priority as keyof typeof colors] || "from-gray-400 to-gray-600";
  };

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
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch === "all" ? "All Branches" : branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Salesman" />
            </SelectTrigger>
            <SelectContent>
              {salesmen.map((salesman) => (
                <SelectItem key={salesman} value={salesman}>
                  {salesman === "all" ? "All Salesmen" : salesman}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Job Orders ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobSelect(job.jobOrderNumber)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedJob?.jobOrderNumber === job.jobOrderNumber
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-sm">{job.jobOrderNumber}</div>
                <div className="text-xs opacity-80 truncate">{job.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Job Detail */}
        {selectedJob && (
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl min-h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(selectedJob)}
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </Button>
                  {userRole !== "salesman" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditJob(selectedJob)}
                    >
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-6 rounded-xl bg-gradient-to-r ${getStatusColor(selectedJob.status)} text-white`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6" />
                    <span className="font-bold text-lg">{selectedJob.jobOrderNumber}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge className={`bg-gradient-to-r ${getPriorityColor(selectedJob.priority)} border-0 text-white`}>
                      {selectedJob.priority} Priority
                    </Badge>
                    <Select
                      value={selectedJob.status}
                      onValueChange={(val) => onStatusUpdate?.(selectedJob.id, val)}
                    >
                      <SelectTrigger className="bg-white/20 text-white border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="designing">Designing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="invoiced">Invoiced</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <h2 className="text-xl font-bold mt-4">{selectedJob.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Customer</div>
                    <div className="font-medium">{selectedJob.customer}</div>
                  </div>
                  {selectedJob.customer === "Cash Customer" && selectedJob.clientName && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-gray-600">Client Name</div>
                      <div className="font-medium">{selectedJob.clientName}</div>
                    </div>
                  )}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">Salesman</div>
                    <div className="font-medium">{selectedJob.salesman}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600">Due Date</div>
                    <div className="font-medium">{new Date(selectedJob.dueDate).toLocaleDateString("en-GB")}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600">Estimated Hours</div>
                    <div className="font-medium">{selectedJob.estimatedHours}h</div>
                  </div>
                </div>
              </div>
              {selectedJob.jobOrderDetails && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Job Details</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedJob.jobOrderDetails}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
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


import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobDetails } from "@/components/JobDetails";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar,
  User,
  Building,
  Eye,
  Edit,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle2
} from "lucide-react";

interface JobListProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
}

export function JobList({ jobs, onStatusUpdate }: JobListProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuth();

  // Filter jobs based on requirements
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split('T')[0];
  
  const filteredJobs = jobs.filter(job => {
    // Show pending, working, designing jobs
    if (['pending', 'working', 'designing'].includes(job.status)) {
      return true;
    }
    
    // Show completed and invoiced jobs only from current date
    if (['completed', 'invoiced'].includes(job.status)) {
      const jobCompletedDate = new Date(job.createdAt).toISOString().split('T')[0];
      return jobCompletedDate === currentDateString;
    }
    
    return false;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
    setIsEditMode(false);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
    setIsEditMode(true);
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    onStatusUpdate(jobId, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "working": return "bg-orange-100 text-orange-800 border-orange-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "working": return "Working";
      case "pending": return "Pending";
      case "designing": return "Designing";
      case "completed": return "Completed";
      case "invoiced": return "Invoiced";
      default: return status;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header with gradient and stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Job Management</h1>
            <p className="text-blue-100 text-lg">Active jobs and today's completed work</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">{filteredJobs.length}</span>
              </div>
              <p className="text-blue-100 text-sm">Total Jobs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-2xl font-bold">{filteredJobs.filter(j => j.status === 'working').length}</span>
              </div>
              <p className="text-blue-100 text-sm">Working</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-2xl font-bold">{filteredJobs.filter(j => j.status === 'completed').length}</span>
              </div>
              <p className="text-blue-100 text-sm">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Job Orders</h3>
            <p className="text-gray-500">All jobs are up to date!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
              {/* Card Header with gradient */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b">
                <CardHeader className="p-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span className="font-medium">{job.jobOrderNumber}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getPriorityColor(job.priority) + " text-xs px-2 py-1 shadow-sm"}>
                        {job.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg text-gray-900 line-clamp-2 leading-tight">
                    {job.title}
                  </CardTitle>
                </CardHeader>
              </div>
              
              <CardContent className="p-4">
                {/* Status Dropdown */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Status</label>
                  <Select
                    value={job.status}
                    onValueChange={(value) => handleStatusChange(job.id, value as JobStatus)}
                  >
                    <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                      <SelectValue>
                        <Badge className={getStatusColor(job.status) + " text-xs px-2 py-1"}>
                          {getStatusDisplayName(job.status)}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-xl">
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="working">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Working
                        </div>
                      </SelectItem>
                      <SelectItem value="designing">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Designing
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="invoiced">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Invoiced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4 flex-shrink-0 text-blue-500" />
                    <span className="text-sm truncate">{job.customer}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0 text-purple-500" />
                    <span className="text-sm">Salesman: {job.salesman}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0 text-orange-500" />
                    <span className="text-sm">{job.estimatedHours}h estimated</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-200/50">
                  <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{job.branch || 'No branch'}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(job)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs shadow-sm"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    onClick={() => handleEditJob(job)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all text-xs shadow-sm"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>

                {job.status === 'pending' && (
                  <Button
                    onClick={() => onStatusUpdate(job.id, 'working')}
                    className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs"
                    size="sm"
                  >
                    Start Working
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JobDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}

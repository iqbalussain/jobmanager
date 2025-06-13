
import { useState, useEffect } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Clock
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Orders</h1>
        <p className="text-gray-600">Active jobs and today's completed work</p>
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Job Orders</h3>
            <p className="text-gray-500">All jobs are up to date!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span className="font-medium">{job.jobOrderNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getPriorityColor(job.priority) + " text-xs px-2 py-1 shadow-sm"}>
                      {job.priority}
                    </Badge>
                    <Badge className={getStatusColor(job.status) + " text-xs px-2 py-1 shadow-sm"}>
                      {job.status === 'working' ? 'Working' : job.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-lg text-gray-900 line-clamp-2 leading-tight">
                  {job.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{job.customer}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Salesman: {job.salesman}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{job.estimatedHours}h estimated</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-200/50">
                  <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span>{job.branch || 'No branch'}</span>
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

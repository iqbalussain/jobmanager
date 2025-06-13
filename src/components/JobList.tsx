
import { useState } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { 
  Calendar,
  User,
  Clock,
  Building,
  ChevronRight,
  Eye,
  Edit,
  X,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobListProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
}

export function JobList({ jobs, onStatusUpdate }: JobListProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
  useState(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        setIsAdmin(!!data);
      }
    };
    checkAdminRole();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNextStatus = (currentStatus: JobStatus): JobStatus | null => {
    switch (currentStatus) {
      case "pending": return "in-progress";
      case "in-progress": return "completed";
      default: return null;
    }
  };

  const getStatusButtonText = (currentStatus: JobStatus): string => {
    switch (currentStatus) {
      case "pending": return "Start Job";
      case "in-progress": return "Complete Job";
      default: return "";
    }
  };

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

  const handleCancelJob = async (job: Job) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can cancel jobs",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to cancel job "${job.title}"?`)) {
      try {
        const { error } = await supabase
          .from('job_orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', job.id);

        if (error) throw error;

        onStatusUpdate(job.id, 'cancelled');
        toast({
          title: "Success",
          description: "Job has been cancelled",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to cancel job",
          variant: "destructive",
        });
      }
    }
  };

  // Show empty state if no jobs are available
  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Orders</h1>
          <p className="text-gray-600">Manage and track all your work orders</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Job Orders Found</h3>
            <p className="text-gray-500 mb-6">
              {user ? "You don't have access to any job orders yet, or no job orders have been created." : "Please log in to view job orders."}
            </p>
            {user && (
              <p className="text-sm text-gray-400">
                If you're a manager or admin and can't see job orders, please contact your system administrator.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Orders</h1>
        <p className="text-gray-600">Manage and track all your work orders</p>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-gray-900 mb-2">{job.title}</CardTitle>
                  {job.jobOrderDetails && (
                    <p className="text-gray-600">{job.jobOrderDetails}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(job.priority)}>
                    {job.priority} priority
                  </Badge>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span className="text-sm">{job.customer}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{job.assignee}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{job.estimatedHours}h estimated</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Created: {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(job)}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleEditJob(job)}
                    variant="outline"
                    className="border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {isAdmin && job.status !== 'cancelled' && (
                    <Button
                      onClick={() => handleCancelJob(job)}
                      variant="outline"
                      className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  {getNextStatus(job.status) && job.status !== 'cancelled' && (
                    <Button
                      onClick={() => onStatusUpdate(job.id, getNextStatus(job.status)!)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {getStatusButtonText(job.status)}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <JobDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}

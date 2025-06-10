
import { useState } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { 
  Calendar,
  User,
  Building,
  ChevronRight,
  Eye,
  Edit,
  X,
  AlertCircle,
  FileText
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card 
            key={job.id} 
            className="group relative bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 perspective-1000"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.05)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-3 h-3" />
                  <span className="font-medium">{job.jobOrderNumber}</span>
                </div>
                <div className="flex gap-1">
                  <Badge className={`${getPriorityColor(job.priority)} text-xs px-2 py-1`}>
                    {job.priority}
                  </Badge>
                  <Badge className={`${getStatusColor(job.status)} text-xs px-2 py-1`}>
                    {job.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              
              <CardTitle className="text-lg text-gray-900 line-clamp-2 leading-tight mb-2">
                {job.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0 relative z-10">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{job.customer}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Created by: Admin</span>
                </div>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewDetails(job)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                
                <Button
                  onClick={() => handleEditJob(job)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-300 hover:bg-blue-50 transition-colors text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                
                {isAdmin && job.status !== 'cancelled' && (
                  <Button
                    onClick={() => handleCancelJob(job)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors text-xs px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {getNextStatus(job.status) && job.status !== 'cancelled' && (
                <Button
                  onClick={() => onStatusUpdate(job.id, getNextStatus(job.status)!)}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs"
                  size="sm"
                >
                  {getStatusButtonText(job.status)}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
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

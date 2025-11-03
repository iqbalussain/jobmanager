import { useState } from "react";
import { Job } from "@/types/jobOrder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { EmptyJobState } from "@/components/job-list/EmptyJobState";
import { CheckCircle, Eye, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UnapprovedJobsListProps {
  jobs: Job[];
  userRole: string;
  onJobApproved?: () => void;
}

export function UnapprovedJobsList({ jobs, userRole, onJobApproved }: UnapprovedJobsListProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const { toast } = useToast();

  const unapprovedJobs = jobs.filter(job => job.approval_status === 'pending_approval');

  const handleApproval = async (jobId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('job_orders')
        .update({ 
          approval_status: status,
          approved_by: status === 'approved' ? (await supabase.auth.getUser()).data.user?.id : null,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: `Job ${status}`,
        description: `Job has been ${status} successfully.`,
      });

      onJobApproved?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job approval status.",
        variant: "destructive",
      });
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  if (unapprovedJobs.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Briefcase className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs pending approval</h3>
          <p className="text-gray-600">All jobs have been reviewed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unapproved Jobs</h1>
          <p className="text-gray-600">{unapprovedJobs.length} jobs pending approval</p>
        </div>
      </div>
      
      <div className="grid gap-4">
        {unapprovedJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-600">
                    Customer: {job.customer} | Job #{job.jobOrderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewJob(job)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  {userRole === 'admin' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproval(job.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApproval(job.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}

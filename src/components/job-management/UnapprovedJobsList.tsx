import { useState } from "react";
import { Job } from "@/types/job";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { JobListHeader } from "@/components/job-list/JobListHeader";
import { JobCard } from "@/components/job-list/JobCard";
import { EmptyJobState } from "@/components/job-list/EmptyJobState";
import { CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isWithinInterval } from "date-fns";

interface UnapprovedJobsListProps {
  jobs: Job[];
  userRole: string;
  onJobApproved?: () => void;
}

export function UnapprovedJobsList({ jobs, userRole, onJobApproved }: UnapprovedJobsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [approvingJobs, setApprovingJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter?.from) {
      const jobDate = new Date(job.createdAt);
      if (dateFilter.to) {
        matchesDate = isWithinInterval(jobDate, { start: dateFilter.from, end: dateFilter.to });
      } else {
        matchesDate = jobDate >= dateFilter.from;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleApproveJob = async (jobId: string) => {
    if (!['admin', 'manager'].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve jobs.",
        variant: "destructive",
      });
      return;
    }

    setApprovingJobs(prev => new Set(prev).add(jobId));

    try {
      const { error } = await supabase
        .from('job_orders')
        .update({ 
          approval_status: 'approved',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Approved",
        description: "Job has been approved successfully.",
      });

      if (onJobApproved) {
        onJobApproved();
      }
    } catch (error) {
      console.error('Error approving job:', error);
      toast({
        title: "Error",
        description: "Failed to approve job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApprovingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as "all" | "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "cancelled");
  };

  const canApprove = ['admin', 'manager'].includes(userRole);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unapproved Jobs</h1>
          <p className="text-gray-600">Jobs pending approval</p>
        </div>
      </div>

      <JobListHeader
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={handleStatusFilterChange}
        onDateFilterChange={setDateFilter}
      />

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  onViewDetails={handleViewDetails}
                  onStatusChange={() => {}} // No status change for unapproved jobs
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(job)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {canApprove && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveJob(job.id)}
                      disabled={approvingJobs.has(job.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {approvingJobs.has(job.id) ? 'Approving...' : 'Approve'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredJobs.length === 0 && <EmptyJobState />}

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}

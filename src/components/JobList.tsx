
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { JobDetails } from "@/components/JobDetails";
import { JobListHeader } from "@/components/job-list/JobListHeader";
import { JobStatsCards } from "@/components/job-list/JobStatsCards";
import { JobCard } from "@/components/job-list/JobCard";
import { EmptyJobState } from "@/components/job-list/EmptyJobState";

interface JobListProps {
  jobs: Job[];
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function JobList({ jobs, onStatusUpdate }: JobListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in-progress" | "designing" | "completed" | "invoiced" | "cancelled">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  const handleStatusFilterChange = (value: string) => {
    const validStatuses = [
      "all",
      "pending",
      "in-progress",
      "designing",
      "completed",
      "invoiced",
      "cancelled",
    ];
    if (validStatuses.includes(value)) {
      setStatusFilter(value as typeof statusFilter);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(jobId, newStatus);
    }
  };

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    inProgress: jobs.filter(job => job.status === "in-progress").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length,
    cancelled: jobs.filter(job => job.status === "cancelled").length
  };

  return (
    <div className="space-y-8 p-0 md:p-6 bg-gradient-to-tr from-blue-50 from-10% via-white via-80% to-blue-200 min-h-screen transition-all duration-300">
      <JobListHeader
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <JobStatsCards stats={stats} />

      <Card className="bg-white/95 dark:bg-slate-950/80 border-0 shadow-2xl backdrop-blur-2xl ring-1 ring-blue-100/50">
        <CardContent className="p-0 md:p-6">
          <div className="flex flex-col gap-7">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
              />
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


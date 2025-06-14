
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

  // wrap setStatusFilter in type guard
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
      setStatusFilter(value as typeof statusFilter); // safe cast
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
    <div className="space-y-6 p-6 min-h-screen animated-gradient-border bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
      <JobListHeader
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <JobStatsCards stats={stats} />

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

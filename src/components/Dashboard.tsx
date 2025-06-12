
import { useState } from "react";
import { Job } from "@/pages/Index";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { useChartData } from "@/hooks/useChartData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { QuickSearch } from "@/components/dashboard/QuickSearch";
import { ActivitiesSection } from "@/components/dashboard/ActivitiesSection";

interface DashboardProps {
  jobs: Job[];
}

export function Dashboard({ jobs }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active';
    title: string;
  } | null>(null);

  const { dailyJobData, isLoading: chartLoading } = useChartData();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    working: jobs.filter(job => job.status === "working").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length
  };

  // Gauge data for pie chart
  const gaugeData = [
    { name: 'Pending', value: stats.pending, color: '#3B82F6' },
    { name: 'Working', value: stats.working, color: '#F59E0B' },
    { name: 'Designing', value: stats.designing, color: '#8B5CF6' },
    { name: 'Completed', value: stats.completed, color: '#10B981' },
    { name: 'Invoiced', value: stats.invoiced, color: '#059669' }
  ];

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleStatusClick = (status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active', title: string) => {
    setSelectedStatus({ status, title });
    setStatusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <StatsCards 
        stats={stats}
        onStatusClick={handleStatusClick}
      />

      <ChartsSection 
        dailyJobData={dailyJobData}
        gaugeData={gaugeData}
        chartLoading={chartLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickSearch 
          searchQuery={searchQuery}
          filteredJobs={filteredJobs}
          onViewDetails={handleViewDetails}
          onSearchChange={setSearchQuery}
        />

        <ActivitiesSection />
      </div>

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />

      <JobStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        jobs={jobs}
        status={selectedStatus?.status || 'total'}
        title={selectedStatus?.title || 'All'}
      />
    </div>
  );
}

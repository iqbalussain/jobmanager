
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useJobTransform } from "@/hooks/useJobTransform";
import { JobDetails } from "@/components/JobDetails";
import { Job, JobStatus } from "@/types/job";

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const { jobOrders, isLoading, updateStatus, updateJobData, refetch } = useJobOrders();
  
  const transformedJobs = useJobTransform(jobOrders);

  const handleStatusUpdate = (jobId: string, status: JobStatus) => {
    updateStatus({ id: jobId, status });
  };

  const handleJobDataUpdate = (jobData: { id: string; [key: string]: any }) => {
    updateJobData(jobData);
  };

  const handleJobApproved = () => {
    refetch(); // Refresh job orders after approval
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  return (
    <MainLayout>
      <ContentRenderer
        jobs={transformedJobs}
        isLoading={isLoading}
        onStatusUpdate={handleStatusUpdate}
        onJobApproved={handleJobApproved}
        onViewJob={handleViewJob}
      />
      
      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
        onJobUpdated={handleJobDataUpdate}
      />
    </MainLayout>
  );
};

export default Index;

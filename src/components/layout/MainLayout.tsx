
import { useState, lazy, Suspense } from "react";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { JobDetails } from "@/components/JobDetails";
import { Job } from "@/types/job";

// Lazy loaded components for performance
const ModernDashboard = lazy(() => import("@/components/ModernDashboard").then(m => ({ default: m.ModernDashboard })));
const JobFormWithImageUpload = lazy(() => import("@/components/job-form/JobFormWithImageUpload").then(m => ({ default: m.JobFormWithImageUpload })));
const JobList = lazy(() => import("@/components/JobList").then(m => ({ default: m.JobList })));
const SettingsView = lazy(() => import("@/components/SettingsView").then(m => ({ default: m.SettingsView })));
const AdminJobManagement = lazy(() => import("@/components/AdminJobManagement").then(m => ({ default: m.AdminJobManagement })));
const AdminManagement = lazy(() => import("@/components/AdminManagement").then(m => ({ default: m.AdminManagement })));
const ReportsPage = lazy(() => import("@/components/ReportsPage").then(m => ({ default: m.ReportsPage })));
const UnapprovedJobsList = lazy(() => import("@/components/job-management/UnapprovedJobsList").then(m => ({ default: m.UnapprovedJobsList })));
const ApprovedJobsList = lazy(() => import("@/components/job-management/ApprovedJobsList").then(m => ({ default: m.ApprovedJobsList })));
const BranchJobQueue = lazy(() => import("@/components/BranchJobQueue").then(m => ({ default: m.BranchJobQueue })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  const handleJobDataUpdate = (jobData: { id: string; [key: string]: any }) => {
    // This will be passed down to child components that need it
    console.log('Job data updated:', jobData);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  return (
    <div className="flex h-screen">
      <MinimalistSidebar />
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </div>

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
        onJobUpdated={handleJobDataUpdate}
      />
    </div>
  );
}

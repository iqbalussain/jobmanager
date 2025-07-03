
import { lazy, Suspense } from "react";
import { useCurrentView, ViewType } from "@/utils/routeUtils";
import { useUserRole } from "@/hooks/useUserRole";
import { Job, JobStatus } from "@/types/job";

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

interface ContentRendererProps {
  jobs: Job[];
  isLoading: boolean;
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
  onJobApproved: () => void;
  onViewJob: (job: Job) => void;
}

export function ContentRenderer({ 
  jobs, 
  isLoading, 
  onStatusUpdate, 
  onJobApproved, 
  onViewJob 
}: ContentRendererProps) {
  const currentView = useCurrentView();
  const userRole = useUserRole();

  if (isLoading) return <LoadingSpinner />;

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <ModernDashboard jobs={jobs} onViewChange={() => {}} />
      case "jobs":
        return <JobList jobs={jobs} onStatusUpdate={onStatusUpdate} />;
      case "create":
        return <JobFormWithImageUpload onCancel={() => window.history.back()} />;
      case "settings":
        return <SettingsView />;
      case "admin":
        return <AdminJobManagement jobs={jobs} onStatusUpdate={onStatusUpdate} />;
      case "admin-management":
        return <AdminManagement />;
      case "reports":
        return <ReportsPage />;
      case "unapproved-jobs":
        return (
          <UnapprovedJobsList
            jobs={jobs.filter(job => job.approval_status === 'pending_approval')}
            userRole={userRole}
            onJobApproved={onJobApproved}
          />
        );
      case "approved-jobs":
        return (
          <ApprovedJobsList
            jobs={jobs.filter(job => job.approval_status === 'approved')}
            onStatusUpdate={onStatusUpdate}
          />
        );
      case "branch-queue":
        return (
          <BranchJobQueue
            jobs={jobs}
            onViewJob={onViewJob}
          />
        );
      default:
        return <JobList jobs={jobs} onStatusUpdate={onStatusUpdate} />;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {renderContent()}
    </Suspense>
  );
}

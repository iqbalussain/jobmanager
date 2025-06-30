import { useState, lazy, Suspense, useEffect } from "react";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { JobDetails } from "@/components/JobDetails";

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

export type JobStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "designing"
  | "finished"
  | "invoiced";

export interface Job {
  id: string;
  jobOrderNumber: string;
  title: string;
  customer: string;
  assignee?: string;
  designer?: string;
  salesman?: string;
  priority: "low" | "medium" | "high";
  status: JobStatus;
  dueDate: string;
  estimatedHours: number;
  createdAt: string;
  branch?: string;
  jobOrderDetails?: string;
  invoiceNumber?: string;
  totalValue?: number;
  customer_id?: string;
  job_title_id?: string;
  created_by?: string;
  approval_status?: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

const Index = () => {

const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "jobs"
    | "create"
    | "settings"
    | "admin"
    | "admin-management"
    | "reports"
    | "unapproved-jobs"
    | "approved-jobs"
    | "branch-queue"
  >("dashboard");

  const [userRole, setUserRole] = useState<string>("employee");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const { user } = useAuth();
  const { jobOrders, isLoading, updateStatus, updateJobData, refetch } = useJobOrders();

  // Fetch role on load
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data?.role) setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRole();
  }, [user]);

  const transformedJobs: Job[] = jobOrders.map((order) => ({
    id: order.id,
    jobOrderNumber: order.job_order_number,
    title: order.title || order.job_order_details || `Job Order ${order.job_order_number}`,
    description: order.description || "",
    customer: order.customer?.name || "Unknown Customer",
    assignee: order.assignee || "Unassigned",
    priority: order.priority as Job["priority"],
    status: order.status as JobStatus,
    dueDate: order.due_date || new Date().toISOString().split("T")[0],
    createdAt: order.created_at.split("T")[0],
    estimatedHours: order.estimated_hours || 0,
    branch: order.branch || "",
    designer: order.designer?.name || "Unassigned",
    salesman: order.salesman?.name || "Unassigned",
    jobOrderDetails: order.job_order_details || "",
    totalValue: order.total_value || 0,
    created_by: order.created_by,
    invoiceNumber: order.invoice_number || "",
    approval_status: order.approval_status,
  }));

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

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;

    switch (currentView) {
       case "dashboard":
        return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />
      case "jobs":
        return <JobList jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
      case "create":
        return <JobFormWithImageUpload onCancel={() => setCurrentView("jobs")} />;
      case "settings":
        return <SettingsView />;
      case "admin":
        return <AdminJobManagement jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
      case "admin-management":
        return <AdminManagement />;
      case "reports":
        return <ReportsPage />;
      case "unapproved-jobs":
        return (
          <UnapprovedJobsList
            jobs={transformedJobs.filter(job => job.approval_status === 'pending_approval')}
            userRole={userRole}
            onJobApproved={handleJobApproved}
          />
        );
      case "approved-jobs":
        return (
          <ApprovedJobsList
            jobs={transformedJobs.filter(job => job.approval_status === 'approved')}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case "branch-queue":
        return (
          <BranchJobQueue
            jobs={transformedJobs}
            onViewJob={handleViewJob}
          />
        );
      default:
        return <JobList jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
    }
  };

  return (
    <div className="ml-20 flex-1 overflow-y-auto">
      <MinimalistSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
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
};

export default Index;

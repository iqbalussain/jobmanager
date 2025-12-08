
import { useState, lazy, Suspense, useEffect } from "react";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { useDexieJobs } from "@/hooks/useDexieJobs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { JobDetails } from "@/components/JobDetails";
import { CreateJobOrderDialog } from "@/components/CreateJobOrderDialog";
import { useJobActions } from "@/hooks/useJobActions";
import { updateJobInCache } from "@/services/syncService";

// Lazy loaded components for performance
const ModernDashboard = lazy(() => import("@/components/ModernDashboard").then(m => ({ default: m.ModernDashboard })));
const SettingsView = lazy(() => import("@/components/SettingsView").then(m => ({ default: m.SettingsView })));
const AdminJobManagement = lazy(() => import("@/components/AdminJobManagement").then(m => ({ default: m.AdminJobManagement })));
const AdminManagement = lazy(() => import("@/components/AdminManagement").then(m => ({ default: m.AdminManagement })));
const ReportsPage = lazy(() => import("@/components/ReportsPage").then(m => ({ default: m.ReportsPage })));
const ApprovedJobsList = lazy(() => import("@/components/job-management/ApprovedJobsList").then(m => ({ default: m.ApprovedJobsList })));
const UserAccessManagement = lazy(() => import("@/components/UserAccessManagement").then(m => ({ default: m.default })));

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
  deliveredAt?: string;
  clientName?: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

const Index = () => {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "approved-jobs"
    | "settings"
    | "admin"
    | "admin-management"
    | "reports"
    | "user-access"
  >("dashboard");

  const [userRole, setUserRole] = useState<string>("employee");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const { user } = useAuth();
  
  // Use Dexie for offline-first job data
  const { jobs: dexieJobs, isLoading, isSyncing, refresh } = useDexieJobs();
  const { setJobStatus } = useJobActions();

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
      } catch {
        // Handle error silently
      }
    };
    fetchUserRole();
  }, [user]);

  // Transform Dexie jobs to the Job interface
  const transformedJobs: Job[] = (dexieJobs || []).map((order) => ({
    id: order.id,
    jobOrderNumber: order.job_order_number,
    title: order.job_order_details || `Job Order ${order.job_order_number}`,
    customer: order.customer_name || "Unknown Customer",
    assignee: order.assignee || "Unassigned",
    priority: order.priority as Job["priority"],
    status: order.status as JobStatus,
    dueDate: order.due_date || new Date().toISOString().split("T")[0],
    createdAt: order.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    estimatedHours: order.estimated_hours || 0,
    branch: order.branch || "",
    designer: order.designer_name || "Unassigned",
    salesman: order.salesman_name || "Unassigned",
    jobOrderDetails: order.job_order_details || "",
    totalValue: order.total_value || 0,
    created_by: order.created_by,
    invoiceNumber: order.invoice_number || "",
    approval_status: order.approval_status,
    deliveredAt: order.delivered_at || "",
    clientName: order.client_name || "",
  }));

  const handleStatusUpdate = async (jobId: string, status: JobStatus) => {
    await setJobStatus(jobId, status);
  };

  const handleJobDataUpdate = async (jobData: { id: string; [key: string]: any }) => {
    // Update job in Supabase then sync to Dexie
    try {
      await supabase.from("job_orders").update(jobData).eq("id", jobData.id);
      await updateJobInCache(jobData.id);
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  const handleJobApproved = () => {
    refresh(); // Refresh job orders after approval
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleCreateJob = () => {
    setIsCreateJobOpen(true);
  };

  const handleViewChange = (view: string) => {
    if (view === "create") {
      handleCreateJob();
    } else {
      setCurrentView(view as any);
    }
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;

    switch (currentView) {
      case "dashboard":
        return (
          <ModernDashboard 
            jobs={transformedJobs} 
            onViewChange={handleViewChange}
          />
        );
      case "approved-jobs":
        return (
          <ApprovedJobsList
            jobs={transformedJobs}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case "settings":
        return <SettingsView />;
      case "admin":
        return <AdminJobManagement onStatusUpdate={handleStatusUpdate} />;
      case "admin-management":
        return <AdminManagement />;
      case "reports":
        return <ReportsPage />;
      case "user-access":
        return <UserAccessManagement />;
      default:
        return <ModernDashboard jobs={transformedJobs} onViewChange={handleViewChange} />;
    }
  };

  const handleSidebarViewChange = (view: 
    | "dashboard"
    | "approved-jobs"
    | "settings"
    | "admin"
    | "admin-management"
    | "reports"
    | "user-access"
  ) => {
    setCurrentView(view);
  };

  return (
    <div className="ml-20 flex-1 overflow-y-auto min-h-screen" style={{ background: 'var(--gradient-background)' }}>
      <MinimalistSidebar 
        currentView={currentView} 
        onViewChange={handleSidebarViewChange}
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

      {/* Create Job Order Dialog */}
      <CreateJobOrderDialog
        open={isCreateJobOpen}
        onOpenChange={setIsCreateJobOpen}
      />
    </div>
  );
};

export default Index;

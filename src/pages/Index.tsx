import { useState, lazy, Suspense, useEffect } from "react";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  >("dashboard");

  const [userRole, setUserRole] = useState<string>("employee");
  const { user } = useAuth();
  const { jobOrders, isLoading, updateStatus, refetch } = useJobOrders();

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

  const filteredJobOrders =
    currentView === "admin"
      ? jobOrders
      : jobOrders.filter((order) => order.status !== "pending");

  const transformedJobs: Job[] = filteredJobOrders.map((order) => ({
    id: order.id,
    jobOrderNumber: order.job_order_number,
    title: order.title,
    description: order.description || "",
    customer: order.customer?.name || "Unknown Customer",
    assignee: order.assignee || "Unassigned",
    priority: order.priority as Job["priority"],
    status: order.status as JobStatus,
    dueDate: order.due_date || new Date().toISOString().split("T")[0],
    createdAt: order.created_at.split("T")[0],
    estimatedHours: order.estimated_hours,
    branch: order.branch || "",
    designer: order.designer?.name || "Unassigned",
    salesman: order.salesman?.name || "Unassigned",
    jobOrderDetails: order.job_order_details || "",
    totalValue: order.total_value || 0,
    created_by: order.created_by,
  }));

  const handleStatusUpdate = (jobId: string, status: JobStatus) => {
    updateStatus({ id: jobId, status });
  };

  const handleJobApproved = () => {
    refetch(); // ✅ Refresh job orders without full page reload
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;

    switch (currentView) {
      case "dashboard":
        return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />;
      case "jobs":
        return <JobList jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
      case "create":
        return <JobFormWithImageUpload onCancel={() => setCurrentView("dashboard")} />;
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
            jobs={transformedJobs}
            userRole={userRole}
            onJobApproved={handleJobApproved}
          />
        );
      case "approved-jobs":
        return (
          <ApprovedJobsList
            jobs={transformedJobs}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      default:
        return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen">
      <MinimalistSidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default Index;

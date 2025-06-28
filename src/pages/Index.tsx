
import { useState, lazy, Suspense } from "react";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

// Lazy load components for better performance
const ModernDashboard = lazy(() => import("@/components/ModernDashboard").then(module => ({ default: module.ModernDashboard })));
const JobFormWithImageUpload = lazy(() => import("@/components/job-form/JobFormWithImageUpload").then(module => ({ default: module.JobFormWithImageUpload })));
const JobList = lazy(() => import("@/components/JobList").then(module => ({ default: module.JobList })));
const SettingsView = lazy(() => import("@/components/SettingsView").then(module => ({ default: module.SettingsView })));
const AdminJobManagement = lazy(() => import("@/components/AdminJobManagement").then(module => ({ default: module.AdminJobManagement })));
const AdminManagement = lazy(() => import("@/components/AdminManagement").then(module => ({ default: module.AdminManagement })));
const ReportsPage = lazy(() => import("@/components/ReportsPage").then(module => ({ default: module.ReportsPage })));
const UnapprovedJobsList = lazy(() => import("@/components/job-management/UnapprovedJobsList").then(module => ({ default: module.UnapprovedJobsList })));
const ApprovedJobsList = lazy(() => import("@/components/job-management/ApprovedJobsList").then(module => ({ default: module.ApprovedJobsList })));

export type JobStatus = "pending" | "in-progress" | "completed" | "cancelled" | "designing" | "finished" | "invoiced";

export interface Job {
  id: string;
  jobOrderNumber: string;
  title: string;
  customer: string;
  assignee?: string;
  designer?: string;
  salesman?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'designing' | 'finished' | 'invoiced';
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
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "create" | "settings" | "admin" | "admin-management" | "reports" | "unapproved-jobs" | "approved-jobs">("dashboard");
  const [userRole, setUserRole] = useState<string>('employee');
  const { jobOrders, isLoading, updateStatus } = useJobOrders();
  const { user } = useAuth();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data?.role) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  // Filter out pending jobs from view (unless in admin view)
  const filteredJobOrders = currentView === "admin" ? jobOrders : jobOrders.filter(order => order.status !== "pending");

  // Transform database job orders to match the existing Job interface
  const transformedJobs: Job[] = filteredJobOrders.map(order => ({
    id: order.id,
    jobOrderNumber: order.job_order_number,
    title: order.title,
    description: order.description || "",
    customer: order.customer?.name || "Unknown Customer",
    assignee: order.assignee || "Unassigned",
    priority: order.priority as "low" | "medium" | "high",
    status: order.status as JobStatus,
    dueDate: order.due_date || new Date().toISOString().split('T')[0],
    createdAt: order.created_at.split('T')[0],
    estimatedHours: order.estimated_hours,
    branch: order.branch || "",
    designer: order.designer?.name || "Unassigned",
    salesman: order.salesman?.name || "Unassigned",
    jobOrderDetails: order.job_order_details || "",
    totalValue: order.total_value || 0,
    created_by: order.created_by
  }));

  const handleStatusUpdate = (jobId: string, status: JobStatus) => {
    updateStatus({ id: jobId, status });
  };

  const handleJobApproved = () => {
    // Refresh job orders when a job is approved
    window.location.reload(); // Simple refresh - could be optimized with better state management
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

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
        return <UnapprovedJobsList jobs={transformedJobs} userRole={userRole} onJobApproved={handleJobApproved} />;
      case "approved-jobs":
        return <ApprovedJobsList jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
      default:
        return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MinimalistSidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 ml-16 overflow-auto">
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </main>
    </div>
  );
};

export default Index;

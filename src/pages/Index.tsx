
import { useState, lazy, Suspense } from "react";
import { ModernSidebar } from "@/components/ModernSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useJobOrders } from "@/hooks/useJobOrders";

// Lazy load components for better performance
const ModernDashboard = lazy(() => import("@/components/ModernDashboard").then(module => ({ default: module.ModernDashboard })));
const JobForm = lazy(() => import("@/components/JobForm").then(module => ({ default: module.JobForm })));
const JobList = lazy(() => import("@/components/JobList").then(module => ({ default: module.JobList })));
const SettingsView = lazy(() => import("@/components/SettingsView").then(module => ({ default: module.SettingsView })));
const AdminJobManagement = lazy(() => import("@/components/AdminJobManagement").then(module => ({ default: module.AdminJobManagement })));
const AdminManagement = lazy(() => import("@/components/AdminManagement").then(module => ({ default: module.AdminManagement })));
const ReportsPage = lazy(() => import("@/components/ReportsPage").then(module => ({ default: module.ReportsPage })));

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
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "create" | "settings" | "admin" | "admin-management" | "reports">("dashboard");
  const { jobOrders, isLoading, updateStatus } = useJobOrders();

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
    totalValue: order.total_value || 0
  }));

  const handleStatusUpdate = (jobId: string, status: JobStatus) => {
    updateStatus({ id: jobId, status });
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
        return <JobForm onCancel={() => setCurrentView("dashboard")} />;
      case "settings":
        return <SettingsView />;
      case "admin":
        return <AdminJobManagement jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
      case "admin-management":
        return <AdminManagement />;
      case "reports":
        return <ReportsPage />;
      default:
        return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <ModernSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;

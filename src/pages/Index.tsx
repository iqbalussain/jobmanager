import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ModernDashboard } from "@/components/ModernDashboard";
import { JobForm } from "@/components/JobForm";
import { JobList } from "@/components/JobList";
import { SettingsView } from "@/components/SettingsView";
import { AdminJobManagement } from "@/components/AdminJobManagement";
import { AdminManagement } from "@/components/AdminManagement";
import { ReportsPage } from "@/components/ReportsPage";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useJobOrders } from "@/hooks/useJobOrders";

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

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "create" | "settings" | "admin" | "admin-management" | "reports">("dashboard");
  const { jobOrders, isLoading, updateStatus } = useJobOrders();

  // Transform database job orders to match the existing Job interface
  const transformedJobs: Job[] = jobOrders.map(order => ({
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
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading job orders...</div>
        </div>
      );
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;


import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ModernDashboard } from "@/components/ModernDashboard";
import { JobForm } from "@/components/JobForm";
import { JobList } from "@/components/JobList";
import { CalendarView } from "@/components/CalendarView";
import { SettingsView } from "@/components/SettingsView";
import { AdminJobManagement } from "@/components/AdminJobManagement";
import { AdminManagement } from "@/components/AdminManagement";
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
}

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management">("dashboard");
  const { jobOrders, isLoading, updateStatus } = useJobOrders();

  // Transform database job orders to match the existing Job interface
  const transformedJobs: Job[] = jobOrders.map(order => ({
    id: order.id,
    jobOrderNumber: order.job_order_number,
    title: order.title,
    // description: order.description || "", // REMOVE, jobOrder.description does not exist!
    customer: order.customer?.name || "Unknown Customer",
    assignee: order.assignee || "Unassigned",
    // Map JobOrder 'urgent' priority to 'high'
    priority: order.priority === "urgent" ? "high" : (order.priority as "low" | "medium" | "high"),
    status: order.status as JobStatus,
    dueDate: order.due_date || new Date().toISOString().split('T')[0],
    createdAt: order.created_at.split('T')[0],
    estimatedHours: order.estimated_hours,
    branch: order.branch || "",
    designer: order.designer?.name || "Unassigned",
    salesman: order.salesman?.name || "Unassigned",
    jobOrderDetails: order.job_order_details || ""
  }));

  const handleStatusUpdate = (jobId: string, status: JobStatus) => {
    updateStatus({ id: jobId, status });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64 glass-gaming-strong gaming-pulse mx-2 sm:mx-2 my-2">
          <div className="text-lg text-gaming-primary">Loading job orders...</div>
        </div>
      );
    }

    return (
      <div className="
        glass-gaming-strong
        w-full
        max-w-7xl
        mx-auto
        my-2
        px-2 sm:px-4 md:px-8
        py-4 md:py-6
        rounded-2xl
        shadow-xl
        border
        min-h-[80vh]
        transition-all
        backdrop-blur-md
        gaming-pulse
      ">
        {/* All main content rendered here as glassy cards */}
        {(() => {
          switch (currentView) {
            case "dashboard":
              return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />;
            case "jobs":
              return <JobList jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
            case "create":
              return <JobForm onCancel={() => setCurrentView("dashboard")} />;
            case "calendar":
              return <CalendarView jobs={transformedJobs} />;
            case "settings":
              return <SettingsView />;
            case "admin":
              return <AdminJobManagement jobs={transformedJobs} onStatusUpdate={handleStatusUpdate} />;
            case "admin-management":
              return <AdminManagement />;
            default:
              return <ModernDashboard jobs={transformedJobs} onViewChange={setCurrentView} />;
          }
        })()}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-transparent">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="
          flex-1 flex flex-col items-center justify-center
          bg-transparent
          min-w-0
          px-1 xs:px-1 sm:px-1 md:px-1 lg:px-1
          pt-2 pb-4 md:pt-6 md:pb-8
          overflow-x-hidden
        ">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;


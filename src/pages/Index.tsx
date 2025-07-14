
import { useState } from "react";
import { ModernDashboard } from "@/components/ModernDashboard";
import { JobList } from "@/components/JobList";
import { CalendarView } from "@/components/CalendarView";
import { ReportsPage } from "@/components/ReportsPage";
import { SettingsView } from "@/components/SettingsView";
import { AdminManagement } from "@/components/AdminManagement";
import { BranchJobQueue } from "@/components/BranchJobQueue";
import { useJobOrdersQuery } from "@/hooks/useJobOrdersQuery";

// Re-export types for backward compatibility
export type { Job, JobStatus } from "@/types/job";

type ViewType = 'dashboard' | 'jobs' | 'calendar' | 'reports' | 'settings' | 'admin' | 'branch-queue';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { jobOrders = [], isLoading } = useJobOrdersQuery();

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ModernDashboard jobs={jobOrders} onViewChange={handleViewChange} />;
      case 'jobs':
        return <JobList jobs={jobOrders} />;
      case 'calendar':
        return <CalendarView jobs={jobOrders} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminManagement />;
      case 'branch-queue':
        return <BranchJobQueue jobs={jobOrders} onViewJob={() => {}} />;
      default:
        return <ModernDashboard jobs={jobOrders} onViewChange={handleViewChange} />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentView()}
    </div>
  );
};

export default Index;

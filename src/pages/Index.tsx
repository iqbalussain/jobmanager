
import React, { useState } from 'react';
import { ModernDashboard } from '@/components/ModernDashboard';
import { JobList } from '@/components/JobList';
import { SettingsView } from '@/components/SettingsView';
import { AdminManagement } from '@/components/AdminManagement';
import { ReportsPage } from '@/components/ReportsPage';
import { UnapprovedJobsList } from '@/components/job-management/UnapprovedJobsList';
import { ApprovedJobsList } from '@/components/job-management/ApprovedJobsList';
import { BranchJobQueue } from '@/components/BranchJobQueue';
import { useAuth } from '@/hooks/useAuth';

// Re-export types for backward compatibility
export type { Job, JobStatus } from '@/types/job';

type ViewType = 'dashboard' | 'jobs' | 'settings' | 'admin' | 'admin-management' | 'reports' | 'unapproved-jobs' | 'approved-jobs' | 'branch-queue';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { user } = useAuth();

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ModernDashboard onViewChange={handleViewChange} />;
      case 'jobs':
        return <JobList />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminManagement />;
      case 'admin-management':
        return <AdminManagement />;
      case 'reports':
        return <ReportsPage />;
      case 'unapproved-jobs':
        return <UnapprovedJobsList />;
      case 'approved-jobs':
        return <ApprovedJobsList />;
      case 'branch-queue':
        return <BranchJobQueue />;
      default:
        return <ModernDashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentView()}
    </div>
  );
};

export default Index;

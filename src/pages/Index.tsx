import React, { useState } from 'react';
import { JobList } from '@/components/JobList';
import { JobForm } from '@/components/JobForm';
import { JobDetails } from '@/components/JobDetails';
import { ModernDashboard } from '@/components/ModernDashboard';
import { CalendarView } from '@/components/CalendarView';
import { ReportsPage } from '@/components/ReportsPage';
import { AdminManagement } from '@/components/AdminManagement';
import { SettingsView } from '@/components/SettingsView';
import { MinimalistSidebar } from '@/components/MinimalistSidebar';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/components/LoginPage';

export interface Job {
  id: string;
  jobOrderNumber: string;
  customer: string;
  title: string;
  status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  branch?: string;
  designer?: string;
  salesman?: string;
  assignee?: string;
  jobOrderDetails?: string;
  createdAt?: string;
  customer_id?: string;
  job_title_id?: string;
  invoiceNumber?: string;
}

type ViewType = 'dashboard' | 'jobs' | 'calendar' | 'reports' | 'admin' | 'settings';

export default function Index() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user, isLoading } = useAuth();

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setIsEditMode(false);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
    setIsEditMode(true);
  };

  const handleCloseJobDetails = () => {
    setIsJobDetailsOpen(false);
    setSelectedJob(null);
    setIsEditMode(false);
  };

  const handleCreateJob = () => {
    setIsJobFormOpen(true);
  };

  const handleCloseJobForm = () => {
    setIsJobFormOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ModernDashboard />;
      case 'jobs':
        return <JobList onViewJob={handleViewJob} onEditJob={handleEditJob} onCreateJob={handleCreateJob} />;
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <ReportsPage />;
      case 'admin':
        return <AdminManagement />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ModernDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MinimalistSidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>

      <JobForm 
        isOpen={isJobFormOpen} 
        onClose={handleCloseJobForm} 
      />

      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={handleCloseJobDetails}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}

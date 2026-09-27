import { useState, lazy, Suspense, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MinimalistSidebar } from "@/components/MinimalistSidebar";
import { useDexieJobs } from "@/hooks/useDexieJobs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { JobDetails } from "@/components/JobDetails";
import { CreateJobOrderDialog } from "@/components/CreateJobOrderDialog";
import { useJobActions } from "@/hooks/useJobActions";
import { removeJobFromCache, updateJobInCache } from "@/services/syncService";
import { HighPriorityModal } from "@/components/HighPriorityModal";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { DashboardJob as Job, JobOrderRecord, JobOrderUpdatePayload, JobStatus } from "@/types/jobOrder";
import { transformDexieJobOrder } from "@/utils/jobOrderTransforms";
import { updateJobOrder } from "@/services/jobOrdersApi";
import Unauthorized from "./Unauthorized";

// Lazy loaded components for performance
const ModernDashboard = lazy(() => import("@/components/ModernDashboard").then(m => ({ default: m.ModernDashboard })));
const SettingsView = lazy(() => import("@/components/SettingsView").then(m => ({ default: m.SettingsView })));
const AdminJobManagement = lazy(() => import("@/components/AdminJobManagement").then(m => ({ default: m.AdminJobManagement })));
const AdminManagement = lazy(() => import("@/components/AdminManagement").then(m => ({ default: m.AdminManagement })));
const ReportsPage = lazy(() => import("@/components/ReportsPage").then(m => ({ default: m.ReportsPage })));
const ApprovedJobsList = lazy(() => import("@/components/job-management/ApprovedJobsList").then(m => ({ default: m.ApprovedJobsList })));
const UserAccessManagement = lazy(() => import("@/components/UserAccessManagement").then(m => ({ default: m.default })));

export type { DashboardJob as Job, JobStatus } from "@/types/jobOrder";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = useMemo(() => {
    switch (location.pathname) {
      case "/jobs/approved":
        return "approved-jobs" as const;
      case "/settings":
        return "settings" as const;
      case "/admin/jobs":
        return "admin" as const;
      case "/admin/users":
        return "admin-management" as const;
      case "/admin/access":
        return "user-access" as const;
      case "/reports":
        return "reports" as const;
      default:
        return "dashboard" as const;
    }
  }, [location.pathname]);

  const [userRole, setUserRole] = useState<string>("employee");
  const [userRoleLoading, setUserRoleLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const { user } = useAuth();
  
  // Use Dexie for offline-first job data
  // Pass true for returnAllJobs to get all jobs for dashboard stats
  const { jobs: dexieJobs, isLoading, isSyncing, syncError, refresh } = useDexieJobs({}, 1, 50, true);
  const { setJobStatus } = useJobActions();

  const restrictedRoles: Partial<Record<typeof currentView, string[]>> = {
    admin: ["admin", "manager"],
    "admin-management": ["admin", "manager"],
    "user-access": ["admin"],
    reports: ["admin", "manager", "salesman"],
  };

  // Fetch role on load
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRoleLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data?.role) setUserRole(data.role);
      } catch {
        setUserRole("employee");
      } finally {
        setUserRoleLoading(false);
      }
    };
    setUserRoleLoading(true);
    fetchUserRole();
  }, [user]);

  // Real-time subscription to job_orders for live updates
  useEffect(() => {
    const channel = supabase
      .channel('job-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_orders'
        },
        async (payload: RealtimePostgresChangesPayload<JobOrderRecord>) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            try {
              if (!user) return;
              await updateJobInCache(payload.new.id, user.id);
              refresh();
            } catch (e) {
              console.error('[Realtime] Failed to update cache:', e);
            }
          } else if (payload.eventType === 'DELETE') {
            if (!user) return;
            const deletedJobId = payload.old.id;
            if (typeof deletedJobId === 'string') {
              await removeJobFromCache(deletedJobId, user.id);
            }
            refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, user]);

  const transformedJobs: Job[] = (dexieJobs || []).map(transformDexieJobOrder);

  const handleStatusUpdate = async (jobId: string, status: JobStatus) => {
    await setJobStatus(jobId, status);
  };

  const handleJobDataUpdate = async (jobData: JobOrderUpdatePayload) => {
    // Update job in Supabase then sync to Dexie
    try {
      const { id, ...updates } = jobData;
      await updateJobOrder(id, updates);
      if (!user) {
        throw new Error('A signed-in user is required to update the local cache');
      }
      await updateJobInCache(id, user.id);
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
      const paths: Record<string, string> = {
        dashboard: "/dashboard",
        "approved-jobs": "/jobs/approved",
        settings: "/settings",
        admin: "/admin/jobs",
        "admin-management": "/admin/users",
        "user-access": "/admin/access",
        reports: "/reports",
      };
      navigate(paths[view] || "/dashboard");
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
            isSyncing={isSyncing}
            isLoading={isLoading}
            onRefresh={refresh}
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
    handleViewChange(view);
  };

  const requiredRoles = restrictedRoles[currentView];
  if (userRoleLoading) {
    return <LoadingSpinner />;
  }
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Unauthorized />;
  }

  return (
    <div className="ml-20 flex-1 overflow-y-auto min-h-screen" style={{ background: 'var(--gradient-background)' }}>
      <MinimalistSidebar 
        currentView={currentView} 
        onViewChange={handleSidebarViewChange}
      />
      <div className="flex-1 overflow-y-auto">
        {(isSyncing || syncError) && (
          <div
            role="status"
            className={`px-4 py-2 text-sm ${
              syncError
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {syncError
              ? `Data sync failed: ${syncError}. Retry with Refresh.`
              : "Synchronizing the latest job data..."}
          </div>
        )}
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

      {/* High Priority Notifications Modal */}
      <HighPriorityModal />
    </div>
  );
};

export default Index;

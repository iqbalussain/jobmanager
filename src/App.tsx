import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { subscribeJobEdits } from "@/lib/realtime";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingCreateButton } from "@/components/FloatingCreateButton";
import { WorkflowAlertManager } from "@/components/WorkflowAlertManager";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { HighPriorityAlertModal } from "@/components/dashboard/HighPriorityAlertModal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000, // 5 minutes
      gcTime: 30 * 60_000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

function GlobalHighPriorityAlert() {
  const { highPriorityAlert, closeHighPriorityAlert } = useNotifications();

  return (
    <HighPriorityAlertModal
      isOpen={!!highPriorityAlert?.show}
      onClose={closeHighPriorityAlert}
      jobOrderNumber={highPriorityAlert?.jobOrderNumber}
      message={highPriorityAlert?.message}
    />
  );
}

function JobEditNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    return subscribeJobEdits((audit) => {
      const editorName = audit.edited_by_name || "Someone";
      toast({
        title: `Job #${audit.job_order_number} updated`,
        description: `${editorName} made changes to this job. Click to view.`,
      });
    }, userId);
  }, [userId, toast]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Sonner />
              <JobEditNotifications />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/jobs/approved" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/jobs" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/access" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <FloatingCreateButton />
              </BrowserRouter>
              <GlobalHighPriorityAlert />
              <WorkflowAlertManager />
            </div>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

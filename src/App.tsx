import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FloatingCreateButton } from "@/components/FloatingCreateButton";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { HighPriorityAlertModal } from "@/components/dashboard/HighPriorityAlertModal";
import { useState, useEffect, createContext, useContext } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Ramadan theme context
interface RamadanThemeContextType {
  isRamadan: boolean;
  toggleRamadan: () => void;
}
const RamadanThemeContext = createContext<RamadanThemeContextType>({ isRamadan: false, toggleRamadan: () => {} });
export const useRamadanTheme = () => useContext(RamadanThemeContext);

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

function App() {
  const [isRamadan, setIsRamadan] = useState(() => localStorage.getItem('ramadan-theme') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('ramadan', isRamadan);
    localStorage.setItem('ramadan-theme', String(isRamadan));
  }, [isRamadan]);

  const toggleRamadan = () => setIsRamadan(prev => !prev);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <RamadanThemeContext.Provider value={{ isRamadan, toggleRamadan }}>
            <TooltipProvider>
              <div className="min-h-screen" style={{ background: 'var(--gradient-background)' }}>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <FloatingCreateButton />
                </BrowserRouter>
                <GlobalHighPriorityAlert />
              </div>
            </TooltipProvider>
          </RamadanThemeContext.Provider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

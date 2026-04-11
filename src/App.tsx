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
import { GamingParticles } from "@/components/GamingParticles";
import { GamingBootScreen } from "@/components/GamingBootScreen";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Gaming Mode Context
interface GamingModeContextType {
  gamingMode: boolean;
  toggleGamingMode: () => void;
}
const GamingModeContext = createContext<GamingModeContextType>({ gamingMode: false, toggleGamingMode: () => {} });
export const useGamingMode = () => useContext(GamingModeContext);

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
  const [gamingMode, setGamingMode] = useState(() => localStorage.getItem('gaming-mode') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('gaming-mode', gamingMode);
    localStorage.setItem('gaming-mode', String(gamingMode));
  }, [gamingMode]);

  const toggleGamingMode = () => setGamingMode(prev => !prev);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <GamingModeContext.Provider value={{ gamingMode, toggleGamingMode }}>
            <TooltipProvider>
              <div className={`min-h-screen transition-all duration-500 ${
                gamingMode 
                  ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' 
                  : ''
              }`} style={{ background: gamingMode ? '' : 'var(--gradient-background)' }}>
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
          </GamingModeContext.Provider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

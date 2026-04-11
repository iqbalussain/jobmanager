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

// Ramadan Theme Context
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
  const [gamingMode, setGamingMode] = useState(() => localStorage.getItem('gaming-mode') === 'true');
  const [showBoot, setShowBoot] = useState(false);
  const [isRamadan, setIsRamadan] = useState(() => localStorage.getItem('ramadan-theme') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('gaming-mode', gamingMode);
    localStorage.setItem('gaming-mode', String(gamingMode));
  }, [gamingMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('ramadan', isRamadan);
    localStorage.setItem('ramadan-theme', String(isRamadan));
  }, [isRamadan]);

  const toggleGamingMode = useCallback(() => {
    setGamingMode(prev => {
      if (!prev) {
        const bootShown = sessionStorage.getItem('gaming-boot-shown');
        if (!bootShown) {
          setShowBoot(true);
          sessionStorage.setItem('gaming-boot-shown', 'true');
        }
      }
      return !prev;
    });
  }, []);

  const toggleRamadan = useCallback(() => setIsRamadan(prev => !prev), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <GamingModeContext.Provider value={{ gamingMode, toggleGamingMode }}>
            <RamadanThemeContext.Provider value={{ isRamadan, toggleRamadan }}>
              <TooltipProvider>
                <div className={`${gamingMode ? 'gaming gaming-mode' : 'normal'} min-h-screen transition-all duration-500`}>
                  {gamingMode && <GamingParticles />}
                  {showBoot && <GamingBootScreen onComplete={() => setShowBoot(false)} />}
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
          </GamingModeContext.Provider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

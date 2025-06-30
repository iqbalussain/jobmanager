import {
  Home,
  FileText,
  Settings,
  Shield,
  UsersRound,
  BarChart3,
  Plus,
  ClipboardList,
  CheckCircle,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface MinimalistSidebarProps {
  currentView: string;
  onViewChange: (
    view:
      | "dashboard"
      | "jobs"
      | "create"
      | "settings"
      | "admin"
      | "admin-management"
      | "reports"
      | "unapproved-jobs"
      | "approved-jobs"
  ) => void;
}

interface UserProfile {
  full_name: string;
  role: string;
  avatar_url?: string;
}

export function MinimalistSidebar({
  currentView,
  onViewChange,
}: MinimalistSidebarProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", user.id)
        .single();

      setUserProfile(
        data || {
          full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
          role: "employee",
        }
      );
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile({
        full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
        role: "employee",
      });
    }
  };

  const mainMenuItems = [
    { title: "Dashboard", icon: Home, view: "dashboard" as const },
    {
      title: "Unapproved Jobs",
      icon: ClipboardList,
      view: "unapproved-jobs" as const,
      roles: ["admin", "manager", "salesman", "designer"],
    },
    {
      title: "Approved Jobs",
      icon: CheckCircle,
      view: "approved-jobs" as const,
    },
    {
      title: "Create Job",
      icon: Plus,
      view: "create" as const,
      roles: ["admin", "manager", "salesman"],
    },
    { title: "Settings", icon: Settings, view: "settings" as const },
  ];

  const adminMenuItems = [
    {
      title: "Job Administration",
      icon: Shield,
      view: "admin" as const,
      roles: ["admin", "manager"],
    },
    {
      title: "User Management",
      icon: UsersRound,
      view: "admin-management" as const,
      roles: ["admin", "manager"],
    },
    {
      title: "Reports & Analytics",
      icon: BarChart3,
      view: "reports" as const,
      roles: ["admin", "manager", "salesman"],
    },
  ];

  const canAccessMenuItem = (item: any) => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile?.role);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div 
        className="fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-blue-500/20 to-indigo-600/20 backdrop-blur-lg text-white z-50 flex flex-col justify-between py-4 border-r border-white/10"
        initial={{ width: 80 }}
        animate={{ width: isHovered ? 220 : 80 }}
        transition={{ type: "spring", damping: 20 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Avatar with water effect */}
        <div className="flex justify-center px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="relative w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
                <motion.span 
                  className="relative z-10 text-xl font-bold text-white"
                  animate={{ scale: isHovered ? 1.2 : 1 }}
                >
                  {userProfile?.full_name?.charAt(0) || "U"}
                </motion.span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none">
              <p className="font-medium">{userProfile?.full_name || "User"}</p>
              <p className="text-xs text-gray-300 capitalize">{userProfile?.role || "Employee"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Menu with water ripple effect */}
        <div className="flex flex-col space-y-2 mt-10 px-2">
          {mainMenuItems.filter(canAccessMenuItem).map((item) => (
            <motion.div 
              key={item.view}
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.span 
                    className="absolute left-14 top-1/2 -translate-y-1/2 text-white text-sm font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewChange(item.view)}
                    className={cn(
                      "w-12 h-12 mx-auto rounded-xl transition-all duration-300 relative overflow-hidden group",
                      currentView === item.view
                        ? "bg-white/20 text-white shadow-lg"
                        : "hover:bg-white/10 text-white/80 hover:text-white"
                    )}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.1)_70%,transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <item.icon className="w-5 h-5 relative z-10" />
                    {currentView === item.view && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-b-xl"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </div>

        {/* Admin Menu with subtle wave effect */}
        <div className="flex flex-col space-y-2 mt-4 px-2">
          {adminMenuItems.filter(canAccessMenuItem).map((item) => (
            <motion.div 
              key={item.view}
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.span 
                    className="absolute left-14 top-1/2 -translate-y-1/2 text-white text-sm font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewChange(item.view)}
                    className={cn(
                      "w-12 h-12 mx-auto rounded-xl transition-all duration-300 relative overflow-hidden group",
                      currentView === item.view
                        ? "bg-white/20 text-white shadow-lg"
                        : "hover:bg-white/10 text-white/80 hover:text-white"
                    )}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.1)_70%,transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <item.icon className="w-5 h-5 relative z-10" />
                    {currentView === item.view && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400 rounded-b-xl"
                        layoutId="adminActiveIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </div>

        {/* Profile Icon Bottom with water drop effect */}
        <div className="flex justify-center px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="relative w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer group"
                whileHover={{ scale: 1.1 }}
              >
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.2)_70%,transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <User className="w-5 h-5 text-white/80 group-hover:text-white relative z-10" />
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      className="absolute left-14 top-1/2 -translate-y-1/2 text-white text-sm font-medium whitespace-nowrap"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      Profile
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none">
              <p>Profile Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Water flow effect at the bottom */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-30"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    </TooltipProvider>
  );
}
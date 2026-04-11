
import {
  Home,
  Settings,
  Shield,
  UsersRound,
  BarChart3,
  CheckCircle,
  UserCheck,
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
import { UserProfileDropdown } from "@/components/user-profile/UserProfileDropdown";
import { useGamingMode } from "@/App";
import { Switch } from "@/components/ui/switch";

interface MinimalistSidebarProps {
  currentView: string;
  onViewChange: (
    view:
      | "dashboard"
      | "approved-jobs"
      | "settings"
      | "admin"
      | "admin-management"
      | "reports"
      | "user-access"
  ) => void;
}

interface UserProfile {
  full_name: string;
  role: string;
}

export function MinimalistSidebar({
  currentView,
  onViewChange,
}: MinimalistSidebarProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const { gamingMode, toggleGamingMode } = useGamingMode();

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      setUserProfile(
        data || {
          full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
          role: "employee",
        }
      );
    } catch {
      setUserProfile({
        full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
        role: "employee",
      });
    }
  };

  const mainMenuItems = [
    { title: "Dashboard", icon: Home, view: "dashboard" as const },
    {
      title: "Approved Jobs",
      icon: CheckCircle,
      view: "approved-jobs" as const,
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
      title: "User Access Control",
      icon: UserCheck,
      view: "user-access" as const,
      roles: ["admin"],
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
      <div className={cn(
        "fixed left-0 top-0 h-full w-16 border-r shadow-lg z-50 flex flex-col transition-all duration-500",
        gamingMode 
          ? "bg-gray-900/95 backdrop-blur-xl border-green-400/30 shadow-green-500/20" 
          : "bg-white border-gray-200"
      )}>
        {/* Avatar */}
        <div className="p-3 border-b border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300",
                gamingMode 
                  ? "bg-gradient-to-r from-green-500 to-cyan-500 shadow-green-500/50 hover:shadow-green-400/70" 
                  : "bg-gradient-to-r from-indigo-600 to-purple-600"
              )}>
                <span className={cn(
                  "font-bold text-md",
                  gamingMode ? "text-black" : "text-white"
                )}>
                {userProfile?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className={cn(
              "border",
              gamingMode ? "bg-gray-900 text-green-400 border-green-400/30" : "bg-white text-gray-900"
            )}>
              <p className="font-medium">{userProfile?.full_name || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{userProfile?.role || "Employee"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Gaming Mode Toggle */}
        <div className="p-3 border-b border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center space-y-2">
                <span className={cn(
                  "text-xs font-medium transition-all duration-300",
                  gamingMode ? "text-green-400" : "text-gray-600"
                )}>
                  🎮
                </span>
                <Switch 
                  checked={gamingMode} 
                  onCheckedChange={toggleGamingMode}
                  className="scale-75"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className={cn(
              "border",
              gamingMode ? "bg-gray-900 text-green-400 border-green-400/30" : "bg-white text-gray-900"
            )}>
              <p>Gaming Mode {gamingMode ? 'ON' : 'OFF'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Menu */}
        <div className="flex flex-col space-y-2 mt-10">
          {mainMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    "w-10 h-10 mx-auto rounded-xl transition-all duration-300 hover:scale-110",
                    gamingMode ? (
                      currentView === item.view
                        ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg shadow-green-500/50 hover:shadow-green-400/70"
                        : "hover:bg-green-900/30 text-green-400 hover:text-green-300 hover:shadow-green-500/30"
                    ) : (
                      currentView === item.view
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                        : "hover:bg-gray-100 text-gray-600"
                    )
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white text-gray-900 border">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Admin Menu */}
        <div className="flex flex-col space-y-2 mt-4">
          {adminMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    "w-10 h-10 mx-auto rounded-xl transition-all duration-300 hover:scale-110",
                    gamingMode ? (
                      currentView === item.view
                        ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg shadow-green-500/50 hover:shadow-green-400/70"
                        : "hover:bg-green-900/30 text-green-400 hover:text-green-300 hover:shadow-green-500/30"
                    ) : (
                      currentView === item.view
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                        : "hover:bg-gray-100 text-gray-600"
                    )
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white text-gray-900 border">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center gap-2 p-3 border-t border-gray-100 mt-auto">
          <UserProfileDropdown userProfile={userProfile} />
        </div>
      </div>
    </TooltipProvider>
  );
}

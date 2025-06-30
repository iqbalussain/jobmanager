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
import { UserProfileDropdown } from "@/components/user-profile/UserProfileDropdown";

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
}

export function MinimalistSidebar({
  currentView,
  onViewChange,
}: MinimalistSidebarProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

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
      div className="fixed left-0 top-0 h-full w-14 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
        {/* Avatar */}
        <div className="p-3 border-b border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-black-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer>
                <span className="text-white font-bold text-sm">
                {userProfile?.full_name?.charAt(0) || "U"}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black text-white">
              <p className="font-medium">{userProfile?.full_name || "User"}</p>
              <p className="text-xs text-gray-300 capitalize">{userProfile?.role || "Employee"}</p>
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
                    "w-10 h-10 mx-auto rounded-xl transition-all duration-200",
                    currentView === item.view
                      ? "bg-white text-gray-200 shadow"
                      : "hover:bg-gray-400 text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
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
                    "w-10 h-10 mx-auto rounded-xl transition-all duration-200",
                    currentView === item.view
                      ? "bg-white text-gray-200 shadow"
                      : "hover:bg-gray-400 text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Profile Icon Bottom */}
        <div className="flex justify-center p-3 border-t border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-400 text-white">
              <p>Profile Settings</p>
            </TooltipContent>
          </Tooltip>
          <UserProfileDropdown userProfile={userProfile} />
        </div>
      </div>
    </TooltipProvider>
  );
}

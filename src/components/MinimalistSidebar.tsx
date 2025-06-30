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
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (data) {
        setUserProfile(data);
      } else {
        fallbackProfile();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      fallbackProfile();
    }
  };

  const fallbackProfile = () => {
    setUserProfile({
      full_name:
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "User",
      role: "employee",
    });
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
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
        {/* Avatar */}
        <div className="p-3 border-b border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer">
                <span className="text-white font-bold text-sm">
                  {userProfile?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white">
              <p className="font-medium">
                {userProfile?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-300 capitalize">
                {userProfile?.role || "Employee"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Menu */}
        <div className="flex-1 py-4 space-y-2">
          {mainMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    "w-10 h-10 mx-3 rounded-xl transition-all duration-200",
                    currentView === item.view
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Separator */}
          {adminMenuItems.filter(canAccessMenuItem).length > 0 && (
            <div className="mx-3 my-4 border-t border-gray-200" />
          )}

          {/* Admin Menu */}
          {adminMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    "w-10 h-10 mx-3 rounded-xl transition-all duration-200",
                    currentView === item.view
                      ? "bg-red-100 text-red-700 shadow-sm"
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Bottom Profile */}
        <div className="p-3 border-t border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-600"
              >
                <User className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white">
              <p>Profile Settings</p>
            </TooltipContent>
          </Tooltip>
          <UserProfileDropdown userProfile={userProfile} />
        </div>
      </div>
    </TooltipProvider>
  );
}

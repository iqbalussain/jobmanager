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
    { title: "Approved Jobs", icon: CheckCircle, view: "approved-jobs" as const },
    { title: "Settings", icon: Settings, view: "settings" as const },
  ];

  const adminMenuItems = [
    { title: "Job Administration", icon: Shield, view: "admin" as const, roles: ["admin", "manager"] },
    { title: "User Management", icon: UsersRound, view: "admin-management" as const, roles: ["admin", "manager"] },
    { title: "User Access Control", icon: UserCheck, view: "user-access" as const, roles: ["admin"] },
    { title: "Reports & Analytics", icon: BarChart3, view: "reports" as const, roles: ["admin", "manager", "salesman"] },
  ];

  const canAccessMenuItem = (item: any) => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile?.role);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed left-0 top-0 h-full w-16 border-r border-sidebar-border bg-sidebar shadow-sm z-50 flex flex-col">
        {/* Avatar */}
        <div className="p-3 border-b border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
                <span className="font-semibold text-sm text-primary-foreground">
                  {userProfile?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{userProfile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{userProfile?.role || "Employee"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Menu */}
        <div className="flex flex-col space-y-1 mt-4 px-2">
          {mainMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    "w-10 h-10 mx-auto rounded-md",
                    currentView === item.view
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
        <div className="flex flex-col space-y-1 mt-2 px-2">
          {adminMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    "w-10 h-10 mx-auto rounded-md",
                    currentView === item.view
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

        {/* Profile */}
        <div className="flex flex-col items-center gap-2 p-3 border-t border-sidebar-border mt-auto">
          <UserProfileDropdown userProfile={userProfile} />
        </div>
      </div>
    </TooltipProvider>
  );
}

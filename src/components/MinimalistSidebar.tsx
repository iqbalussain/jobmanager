
import {
  Home,
  Settings,
  Shield,
  UsersRound,
  BarChart3,
  CheckCircle,
  UserCheck,
  Truck,
  FileText,
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
      | "quotations"
      | "settings"
      | "admin"
      | "admin-management"
      | "reports"
      | "user-access"
      | "delivery-record"
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
      title: "Approved Jobs",
      icon: CheckCircle,
      view: "approved-jobs" as const,
    },
    {
      title: "Quotations",
      icon: FileText,
      view: "quotations" as const,
      roles: ["admin", "manager", "salesman"],
    },
    {
      title: "Delivery Record",
      icon: Truck,
      view: "delivery-record" as const,
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
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
        {/* Avatar */}
        <div className="p-3 border-b border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer">
                <span className="text-white font-bold text-md">
                {userProfile?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-white text-gray-900 border">
              <p className="font-medium">{userProfile?.full_name || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{userProfile?.role || "Employee"}</p>
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
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                      : "hover:bg-gray-100 text-gray-600"
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
                    "w-10 h-10 mx-auto rounded-xl transition-all duration-200",
                    currentView === item.view
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                      : "hover:bg-gray-100 text-gray-600"
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

        {/* Profile Icon Bottom */}
        <div className="flex justify-center p-3 border-t border-gray-100 mt-auto">
          <UserProfileDropdown userProfile={userProfile} />
        </div>
      </div>
    </TooltipProvider>
  );
}

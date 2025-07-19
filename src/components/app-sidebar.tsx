import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Settings,
  Shield,
  UsersRound,
  BarChart3,
  CheckCircle,
  UserCheck,
  Truck,
  Menu,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { UserProfileDropdown } from "@/components/user-profile/UserProfileDropdown";

interface UserProfile {
  full_name: string;
  role: string;
}

interface AppSidebarProps {
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
      | "delivery-record"
  ) => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { state, open } = useSidebar();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  const isActive = (view: string) => currentView === view;
  const isCollapsed = !open;

  return (
    <Sidebar className={cn(
      "border-r border-gray-200/50 bg-white/95 backdrop-blur-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with user info */}
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">
              {userProfile?.full_name?.charAt(0) || "U"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {userProfile?.role || "Employee"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold text-gray-500 uppercase tracking-wider",
            isCollapsed && "sr-only"
          )}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.view)}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                      isActive(item.view)
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                        : "hover:bg-gray-100 text-gray-700",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "w-5 h-5" : "w-4 h-4"
                    )} />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {adminMenuItems.filter(canAccessMenuItem).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
              "text-xs font-semibold text-gray-500 uppercase tracking-wider",
              isCollapsed && "sr-only"
            )}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.filter(canAccessMenuItem).map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.view)}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                        isActive(item.view)
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn(
                        "flex-shrink-0",
                        isCollapsed ? "w-5 h-5" : "w-4 h-4"
                      )} />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with profile dropdown */}
      <SidebarFooter className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-center">
          <UserProfileDropdown userProfile={userProfile} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

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
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserProfileDropdown } from "@/components/user-profile/UserProfileDropdown";

interface MinimalistSidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "jobs" | "create" | "settings" | "admin" | "admin-management" | "reports" | "unapproved-jobs" | "approved-jobs") => void;
}

interface UserProfile {
  full_name: string;
  role: string;
}

export function MinimalistSidebar({ currentView, onViewChange }: MinimalistSidebarProps) {
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
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserProfile(data);
      } else {
        setUserProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'employee'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: 'employee'
      });
    }
  };

  const mainMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      view: "dashboard" as const,
    },
    {
      title: "Unapproved Jobs",
      icon: ClipboardList,
      view: "unapproved-jobs" as const,
      roles: ["admin", "manager", "salesman", "designer"] // Show to relevant roles
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
      roles: ["admin", "manager", "salesman"] // Allow salesmen to create jobs
    },
    {
      title: "Settings",
      icon: Settings,
      view: "settings" as const,
    }
  ];

  const adminMenuItems = [
    {
      title: "Job Administration",
      icon: Shield,
      view: "admin" as const,
      roles: ["admin", "manager"] // Admin only
    },
    {
      title: "User Management",
      icon: UsersRound,
      view: "admin-management" as const,
      roles: ["admin", "manager"] // Admin only
    },
    {
      title: "Reports & Analytics",
      icon: BarChart3,
      view: "reports" as const,
      roles: ["admin", "manager", "salesman"] // Include salesmen for reports
    }
  ];

  const handleMenuClick = (view: any) => {
    onViewChange(view);
  };

  const canAccessMenuItem = (item: any) => {
    if (!item.roles) return true; // No role restriction
    return item.roles.includes(userProfile?.role);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-screen">
        {/* User Avatar */}
        <div className="overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer">
                <span className="text-white font-bold text-sm">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white">
              <p className="font-medium">{userProfile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-300 capitalize">{userProfile?.role || 'Employee'}</p>
            </TooltipContent>
          </Tooltip>
          </Suspense>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto">
          {mainMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMenuClick(item.view)}
                  className={cn(
                    "w-10 h-10 mx-3 rounded-xl transition-all duration-200",
                    currentView === item.view 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'hover:bg-gray-100 text-gray-600'
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

          {/* Separator - only show if there are admin items to show */}
          {adminMenuItems.filter(canAccessMenuItem).length > 0 && (
            <div className="mx-3 my-4 border-t border-gray-200"></div>
          )}

          {/* Admin Navigation */}
          {adminMenuItems.filter(canAccessMenuItem).map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMenuClick(item.view)}
                  className={cn(
                    "w-10 h-10 mx-3 rounded-xl transition-all duration-200",
                    currentView === item.view 
                      ? 'bg-red-100 text-red-700 shadow-sm' 
                      : 'hover:bg-gray-100 text-gray-600'
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

        {/* User Profile Dropdown at Bottom */}
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

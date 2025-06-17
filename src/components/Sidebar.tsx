import { 
  LayoutDashboard, 
  Briefcase, 
  Plus,
  Calendar,
  Settings,
  User,
  Shield,
  UsersRound,
  Menu,
  Home,
  FileText
} from "lucide-react";
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/UserProfile";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/ui/ThemeContext";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
}

interface UserProfile {
  full_name: string;
  role: string;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  const mainNavItems = [
    {
      title: "Home",
      icon: Home,
      onClick: () => {
        onViewChange("dashboard");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "dashboard",
    },
    {
      title: "All Files",
      icon: FileText,
      onClick: () => {
        onViewChange("jobs");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "jobs",
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => {
        onViewChange("settings");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "settings",
    },
    {
      title: "Calendar",
      icon: Calendar,
      onClick: () => {
        onViewChange("calendar");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "calendar",
    }
  ];

  const adminMenuItems = [
    {
      title: "Job Management",
      icon: Shield,
      onClick: () => {
        onViewChange("admin");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "admin"
    },
    {
      title: "User Management",
      icon: UsersRound,
      onClick: () => {
        onViewChange("admin-management");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "admin-management"
    }
  ];

  const getNavButtonStyles = (isActive: boolean) => {
    if (isDark) {
      return `
        flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95
        glass-gaming-strong
        ${isActive ? "neon-running-border scale-105 animate-glow" : "hover:scale-110 hover:gaming-pulse"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        h-14 w-full shadow-xl border-0
        text-white
      `;
    } else {
      return `
        flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95
        bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200
        ${isActive ? "bg-gradient-to-br from-blue-200 to-purple-200 scale-105 shadow-lg" : "hover:scale-110 hover:shadow-md hover:from-blue-150 hover:to-purple-150"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        h-14 w-full
        text-gray-800
      `;
    }
  };

  const getAdminButtonStyles = (isActive: boolean) => {
    if (isDark) {
      return `w-full flex gap-2 items-center px-3 py-2 rounded-lg transition-all
        ${isActive ? 'glass-gaming-strong text-white animate-glow' : 'hover:glass-gaming text-white/90'}`;
    } else {
      return `w-full flex gap-2 items-center px-3 py-2 rounded-lg transition-all
        ${isActive ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'hover:bg-gray-100 text-gray-700'}`;
    }
  };

  const SidebarContentComponent = () => (
    <>
      <SidebarHeader className={`border-b p-4 ${isDark ? 'border-border bg-card/50 backdrop-blur-md' : 'border-gray-200 bg-white/80'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary/80' : 'bg-primary'}`}>
            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-white'}`}>
              {userProfile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {userProfile?.full_name || 'User'}
            </h1>
            <p className={`text-xs capitalize ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {userProfile?.role || 'Employee'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 mb-3 mt-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    aria-label={item.title}
                    onClick={item.onClick}
                    className={getNavButtonStyles(item.isActive)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className={`text-[11px] font-semibold tracking-wide ${isDark ? 'text-white drop-shadow-[0_1px_8px_#00fff7aa]' : 'text-gray-800'}`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 mb-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={getAdminButtonStyles(item.isActive)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Card */}
        <div className={`
          mt-6 w-full aspect-square max-w-[15rem] mx-auto p-0 rounded-2xl
          ${isDark 
            ? 'bg-gradient-to-br from-blue-500/80 via-fuchsia-400/60 via-45% to-yellow-200/70 glass-gaming-strong border-2 border-white/10 neon-trace-card backdrop-blur-2xl' 
            : 'bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 border-2 border-blue-300 backdrop-blur-md bg-white/20'
          }
          shadow-xl transition-all duration-300 relative flex flex-col items-center justify-center
          ${isDark ? 'text-white' : 'text-gray-800'}
        `}>
          <div className="w-full h-full flex flex-col items-center justify-center p-5">
            <div className="flex items-center mb-3 w-full justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-0 shadow-inner border-4 ${isDark ? 'bg-white/20 border-white/30' : 'bg-blue-100 border-blue-300'}`}>
                <User className={`w-7 h-7 ${isDark ? 'text-white' : 'text-blue-700'}`} />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <p className={`font-bold text-base ${isDark ? 'text-white drop-shadow-[0_1px_6px_#fff5]' : 'text-gray-800'}`}>
                {userProfile?.full_name || 'User'}
              </p>
              <p className={`text-xs capitalize ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                {userProfile?.role || 'Employee'}
              </p>
            </div>
            <Button
              onClick={() => setShowProfile(!showProfile)}
              variant="secondary"
              size="sm"
              className={`w-full mt-4 text-xs shadow-inner rounded-2xl border-0 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
            >
              View Profile
            </Button>
            {showProfile && (
              <div className="mt-4 w-full">
                <UserProfile />
              </div>
            )}
          </div>
          {isDark && (
            <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent animate-glow"></span>
          )}
        </div>
      </SidebarContent>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <SidebarBase className={`hidden md:flex border-r w-64 ${isDark ? 'border-border bg-card/50 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-sm'}`}>
        <SidebarContentComponent />
      </SidebarBase>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`fixed top-4 left-4 z-50 ${isDark ? 'bg-card/80 border-border backdrop-blur-md' : 'bg-white/80 border-gray-300'}`}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={`p-0 w-64 ${isDark ? 'bg-card/95 backdrop-blur-md' : 'bg-white/95'}`}>
            <div className="h-full">
              <SidebarContentComponent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

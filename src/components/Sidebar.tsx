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
        // Fallback to user metadata if profile doesn't exist
        setUserProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'employee'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to user metadata
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
      bg: "bg-primary",
      fg: "text-primary-foreground"
    },
    {
      title: "All Files",
      icon: FileText,
      onClick: () => {
        onViewChange("jobs");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "jobs",
      bg: "bg-accent",
      fg: "text-accent-foreground"
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => {
        onViewChange("settings");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "settings",
      bg: "bg-muted",
      fg: "text-foreground"
    },
    {
      title: "Calendar",
      icon: Calendar,
      onClick: () => {
        onViewChange("calendar");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "calendar",
      bg: "bg-secondary",
      fg: "text-secondary-foreground"
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

  const SidebarContentComponent = () => (
    <>
      <SidebarHeader className="border-b border-border p-4 bg-card bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              {userProfile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">
              {userProfile?.full_name || 'User'}
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {userProfile?.role || 'Employee'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3 mb-3 mt-2 text-xs">
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
                    className={`
                      flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95
                      bg-gradient-to-tr from-blue-500 via-purple-600 to-green-400 
                      glass-gaming
                      ${item.isActive ? "neon-running-border scale-105" : "hover:scale-110"}
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                      h-14 w-full shadow-xl
                      border-0
                    `}
                    style={{
                      minWidth: 0,
                      transition: "box-shadow 350ms cubic-bezier(.45,1.7,.83,.67), transform 200ms",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-semibold tracking-wide text-white drop-shadow-[0_1px_8px_#00fff7aa]">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3 mb-2 text-xs">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={`w-full flex gap-2 items-center px-3 py-2 rounded-lg
                      ${item.isActive ? 'bg-destructive text-destructive-foreground' : 'hover:bg-accent text-foreground'}`}
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
        <div
          className={`
            mt-6 p-4 rounded-2xl
            bg-gradient-to-br from-blue-500/80 via-fuchsia-400/60 via-45% to-yellow-200/70
            glass-gaming-strong
            border-2 border-white/10
            neon-trace-card
            backdrop-blur-2xl
            shadow-xl
            transition-all duration-300
            relative
            text-white
          `}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3 border border-white/20 shadow-inner">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white drop-shadow-[0_1px_6px_#fff5]">{userProfile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-200 capitalize">{userProfile?.role || 'Employee'}</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowProfile(!showProfile)}
            variant="secondary"
            size="sm"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-0 text-xs shadow-inner"
          >
            View Profile
          </Button>
          {showProfile && (
            <div className="mt-3">
              <UserProfile />
            </div>
          )}
          {/* Subtle animated glow border (optional) */}
          <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent animate-glow"></span>
        </div>
      </SidebarContent>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <SidebarBase className="hidden md:flex border-r border-border bg-card w-64">
        <SidebarContentComponent />
      </SidebarBase>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-card border-border"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-card">
            <div className="h-full bg-card">
              <SidebarContentComponent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

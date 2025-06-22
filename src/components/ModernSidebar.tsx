
import { 
  Home,
  FileText,
  Settings,
  Shield,
  UsersRound,
  BarChart3,
  User,
  ChevronRight,
  Menu,
  X
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
  SidebarFooter
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/UserProfile";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ModernSidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "jobs" | "create" | "settings" | "admin" | "admin-management" | "reports") => void;
}

interface UserProfile {
  full_name: string;
  role: string;
}

export function ModernSidebar({ currentView, onViewChange }: ModernSidebarProps) {
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
      description: "Overview and analytics"
    },
    {
      title: "Job Management",
      icon: FileText,
      view: "jobs" as const,
      description: "Manage all job orders"
    },
    {
      title: "Settings",
      icon: Settings,
      view: "settings" as const,
      description: "System preferences"
    }
  ];

  const adminMenuItems = [
    {
      title: "Job Administration",
      icon: Shield,
      view: "admin" as const,
      description: "Admin job controls"
    },
    {
      title: "User Management",
      icon: UsersRound,
      view: "admin-management" as const,
      description: "Manage users & roles"
    },
    {
      title: "Reports & Analytics",
      icon: BarChart3,
      view: "reports" as const,
      description: "Business insights"
    }
  ];

  const handleMenuClick = (view: any) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  const SidebarContentComponent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <SidebarHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">
              {userProfile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">
              {userProfile?.full_name || 'User'}
            </h2>
            <p className="text-xs text-gray-500 capitalize">
              {userProfile?.role || 'Employee'}
            </p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </SidebarHeader>
      
      {/* Main Content */}
      <SidebarContent className="flex-1 p-4">
        {/* Main Navigation */}
        <SidebarGroup className="mb-8">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton 
                    onClick={() => handleMenuClick(item.view)}
                    className={cn(
                      "w-full h-auto p-4 rounded-xl border border-transparent transition-all duration-200 group",
                      currentView === item.view 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm' 
                        : 'hover:bg-gray-50 hover:border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentView === item.view
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium text-sm",
                          currentView === item.view ? 'text-blue-900' : 'text-gray-900'
                        )}>
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        currentView === item.view ? 'text-blue-600 rotate-90' : 'text-gray-400'
                      )} />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 px-3">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton 
                    onClick={() => handleMenuClick(item.view)}
                    className={cn(
                      "w-full h-auto p-4 rounded-xl border border-transparent transition-all duration-200 group",
                      currentView === item.view 
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-sm' 
                        : 'hover:bg-gray-50 hover:border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentView === item.view
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600'
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium text-sm",
                          currentView === item.view ? 'text-red-900' : 'text-gray-900'
                        )}>
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        currentView === item.view ? 'text-red-600 rotate-90' : 'text-gray-400'
                      )} />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{userProfile?.full_name || 'User'}</p>
              <p className="text-xs text-blue-100 capitalize">{userProfile?.role || 'Employee'}</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowProfile(!showProfile)}
            variant="secondary"
            size="sm"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0 text-xs h-8"
          >
            {showProfile ? 'Hide Profile' : 'View Profile'}
          </Button>
          {showProfile && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <UserProfile />
            </div>
          )}
        </div>
      </SidebarFooter>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <SidebarBase className="hidden md:flex border-r-0 bg-transparent w-80">
        <SidebarContentComponent />
      </SidebarBase>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-lg"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContentComponent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

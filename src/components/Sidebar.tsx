
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
  FileText,
  Star,
  Share2,
  HelpCircle,
  Trash2
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      onClick: () => {
        onViewChange("dashboard");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "dashboard"
    },
    {
      title: "All File",
      icon: FileText,
      onClick: () => {
        onViewChange("jobs");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "jobs"
    }
  ];

  const quickActions = [
    {
      title: "Favourite",
      icon: Star,
      onClick: () => {
        // Add favorite functionality
        setIsMobileMenuOpen(false);
      },
      isActive: false
    },
    {
      title: "Shared File",
      icon: Share2,
      onClick: () => {
        // Add shared files functionality
        setIsMobileMenuOpen(false);
      },
      isActive: false
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

  const bottomMenuItems = [
    {
      title: "Help",
      icon: HelpCircle,
      onClick: () => {
        // Add help functionality
        setIsMobileMenuOpen(false);
      },
      isActive: false
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => {
        onViewChange("settings");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "settings"
    },
    {
      title: "History",
      icon: Calendar,
      onClick: () => {
        onViewChange("calendar");
        setIsMobileMenuOpen(false);
      },
      isActive: currentView === "calendar"
    },
    {
      title: "Trash",
      icon: Trash2,
      onClick: () => {
        // Add trash functionality
        setIsMobileMenuOpen(false);
      },
      isActive: false
    }
  ];

  const SidebarContentComponent = () => (
    <>
      <SidebarHeader className="border-b border-purple-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Murad</h1>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={`w-full justify-start rounded-2xl mb-2 h-12 ${
                      item.isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    className="w-full justify-start rounded-2xl mb-2 h-12 hover:bg-gray-100 text-gray-600"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium px-3 mb-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={`w-full justify-start rounded-2xl mb-2 h-12 ${
                      item.isActive 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                        : 'hover:bg-red-50 hover:text-red-600 text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={`w-full justify-start rounded-2xl mb-2 h-12 ${
                      item.isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* File Upload Area */}
        <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-2xl text-center">
          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Drag & Drop</p>
          <Button 
            variant="link" 
            className="text-purple-600 p-0 h-auto font-medium"
            onClick={() => onViewChange("create")}
          >
            Browse Files
          </Button>
        </div>

        {/* User Profile Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl text-white">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">Murad Hossain</p>
              <p className="text-sm text-purple-200">UI/UX Designer</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowProfile(!showProfile)}
            variant="secondary"
            size="sm"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
          >
            View Profile
          </Button>
          {showProfile && (
            <div className="mt-3">
              <UserProfile />
            </div>
          )}
        </div>
      </SidebarContent>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <SidebarBase className="hidden md:flex border-r border-purple-100 bg-white/95 backdrop-blur-sm w-80">
        <SidebarContentComponent />
      </SidebarBase>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <div className="h-full bg-white/95 backdrop-blur-sm">
              <SidebarContentComponent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

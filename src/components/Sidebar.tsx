
import { 
  LayoutDashboard, 
  Briefcase, 
  Plus,
  Calendar,
  Settings,
  User
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
  SidebarHeader
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/UserProfile";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings") => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => onViewChange("dashboard"),
      isActive: currentView === "dashboard"
    },
    {
      title: "Job Orders",
      icon: Briefcase,
      onClick: () => onViewChange("jobs"),
      isActive: currentView === "jobs"
    },
    {
      title: "Create Job",
      icon: Plus,
      onClick: () => onViewChange("create"),
      isActive: currentView === "create"
    }
  ];

  const secondaryMenuItems = [
    {
      title: "Calendar",
      icon: Calendar,
      onClick: () => onViewChange("calendar"),
      isActive: currentView === "calendar"
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => onViewChange("settings"),
      isActive: currentView === "settings"
    }
  ];

  return (
    <SidebarBase className="border-r border-blue-100 bg-white/80 backdrop-blur-sm">
      <SidebarHeader className="border-b border-blue-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">JobFlow</h1>
            <p className="text-sm text-gray-600">Work Order Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 ${
                      item.isActive ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
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
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.onClick}
                    isActive={item.isActive}
                    className={`hover:bg-gray-100 transition-colors ${
                      item.isActive ? 'bg-gray-100 text-gray-900' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Button 
                  onClick={() => setShowProfile(!showProfile)}
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto hover:bg-gray-100"
                >
                  <User className="w-5 h-5 mr-2" />
                  <span>Profile</span>
                </Button>
                {showProfile && (
                  <div className="mt-2 px-2">
                    <UserProfile />
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarBase>
  );
}

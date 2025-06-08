
import { 
  LayoutDashboard, 
  Briefcase, 
  Plus,
  Calendar,
  Settings
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
  SidebarTrigger,
  SidebarHeader
} from "@/components/ui/sidebar";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "jobs" | "create") => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
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
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-gray-100 transition-colors">
                  <Calendar className="w-5 h-5" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarBase>
  );
}
